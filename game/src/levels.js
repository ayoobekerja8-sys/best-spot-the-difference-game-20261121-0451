// Level progression and scoring: the three scenes, their clocks, what a find is worth, what a
// mistake costs, and how a cleared level turns into stars. No drawing and no DOM in here.
import { differencesFor } from './differences.js';

export const LEVELS = [
  { index: 0, id: 'park', name: 'Sunny Park', seconds: 120, blurb: 'A bright afternoon by the pond' },
  { index: 1, id: 'market', name: 'Night Market', seconds: 150, blurb: 'Lanterns, steam and a curious cat' },
  { index: 2, id: 'moon', name: 'Moon Base', seconds: 180, blurb: 'A quiet outpost under hard stars' },
];

export const POINTS = { find: 100, miss: -25, hint: -50, perfect: 150, perSecond: 5 };
export const HINTS_PER_LEVEL = 3;

export function levelAt(index) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index))];
}

/** A fresh run of one level. `preFound` stages a screenshot: that many differences start marked. */
export function createRun(index, options = {}) {
  const level = levelAt(index);
  const differences = differencesFor(level.id);
  const preFound = Math.max(0, Math.min(differences.length, options.preFound ?? 0));
  const found = new Set();
  const markerAt = new Map();
  for (let i = 0; i < preFound; i += 1) {
    found.add(differences[i].id);
    markerAt.set(differences[i].id, options.now ?? 0);
  }
  return {
    level,
    differences,
    found,
    markerAt,
    score: options.score ?? 0,
    runScore: preFound * POINTS.find,
    hintsLeft: HINTS_PER_LEVEL,
    misses: 0,
    hintsUsed: 0,
    hintTarget: null,
    hintUntil: 0,
    miss: null,
    elapsed: options.elapsed ?? 0,
  };
}

export function remainingCount(run) {
  return run.differences.length - run.found.size;
}

export function allFound(run) {
  return run.found.size >= run.differences.length;
}

/** Mark one difference found; returns the difference, or null when it was already marked. */
export function registerFind(run, difference, now) {
  if (!difference || run.found.has(difference.id)) return null;
  run.found.add(difference.id);
  run.markerAt.set(difference.id, now);
  run.score += POINTS.find;
  run.runScore += POINTS.find;
  run.hintTarget = null;
  return difference;
}

export function registerMiss(run, point, now) {
  run.misses += 1;
  run.score = Math.max(0, run.score + POINTS.miss);
  run.runScore = Math.max(0, run.runScore + POINTS.miss);
  run.miss = { x: point.x, y: point.y, at: now };
  return POINTS.miss;
}

/** Spend a hint on the first difference still unfound; returns it, or null when none is left. */
export function spendHint(run, now, hintSeconds) {
  if (run.hintsLeft <= 0) return null;
  const target = run.differences.find((difference) => !run.found.has(difference.id));
  if (!target) return null;
  run.hintsLeft -= 1;
  run.hintsUsed += 1;
  run.hintTarget = target;
  run.hintUntil = now + hintSeconds * 1000;
  run.score = Math.max(0, run.score + POINTS.hint);
  run.runScore = Math.max(0, run.runScore + POINTS.hint);
  return target;
}

/** Stars for a cleared level: three when most of the clock is left, two when some, one otherwise. */
export function starsFor(run, secondsLeft) {
  const fraction = secondsLeft / run.level.seconds;
  if (fraction >= 0.5) return 3;
  if (fraction >= 0.22) return 2;
  return 1;
}

/** The bonus a cleared level pays: time left, plus a clean sweep with no hints and no misses. */
export function clearBonus(run, secondsLeft) {
  const time = Math.round(secondsLeft) * POINTS.perSecond;
  const clean = run.misses === 0 && run.hintsUsed === 0 ? POINTS.perfect : 0;
  return { time, clean, total: time + clean };
}

export function nextLevelIndex(index) {
  return index + 1 < LEVELS.length ? index + 1 : null;
}
