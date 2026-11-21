// Bootstrap: read the URL, build the run, wire the buttons and the keyboard, and own the one frame
// loop. The staged-screenshot support lives here too: ?level=N&found=M starts that level with the
// first M differences already marked, and ?level=N&found=all marks every one and shows the win card,
// so the screenshots are real states of this game's own code.
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createTimer } from './timer.js';
import {
  allFound,
  clearBonus,
  createRun,
  levelAt,
  nextLevelIndex,
  registerFind,
  registerMiss,
  remainingCount,
  spendHint,
  starsFor,
  HINTS_PER_LEVEL,
} from './levels.js';
import { createUi } from './ui.js';
import { playFind, playHint, playLose, playMiss, playWin, playClick, unlockAudio } from './audio.js';

const HINT_SECONDS = 2.6;
const params = new URLSearchParams(window.location.search);

const leftCanvas = document.getElementById('left-canvas');
const rightCanvas = document.getElementById('right-canvas');

const game = {
  run: null,
  timer: null,
  phase: 'start',
  score: 0,
  best: 0,
  lastFrame: 0,
  staged: false,
  shakeAt: -1e9,
  ended: false,
};

const renderer = createRenderer(leftCanvas, rightCanvas);
const ui = createUi({
  onStartLevel: (index) => startLevel(index),
  onNext: () => nextLevel(),
  onRetry: () => restartLevel(),
  onReplay: () => restartLevel(),
  onHome: () => goHome(),
  onResume: () => togglePause(),
  onHint: () => useHint(),
  onPause: () => togglePause(),
});

function startLevel(index, options = {}) {
  unlockAudio();
  const run = createRun(index, { score: game.score, preFound: options.preFound ?? 0, now: options.now ?? 0 });
  game.run = run;
  game.timer = createTimer(run.level.seconds);
  game.phase = 'play';
  game.ended = false;
  if (options.secondsLeft !== undefined) game.timer.remaining = options.secondsLeft;
  if (options.preFound) {
    const now = performance.now();
    let index = 0;
    for (const difference of run.differences) {
      if (!run.found.has(difference.id)) continue;
      run.markerAt.set(difference.id, now - 900 - index * 130);
      index += 1;
    }
  }
  ui.hideOverlays();
  ui.setPaused(false);
  ui.announce(`Level ${index + 1}, ${run.level.name}. Find ${run.differences.length} differences.`);
  renderNow();
}

function renderNow() {
  if (game.run) renderer.draw(game.run, performance.now(), { hint: true, shakeAt: game.shakeAt });
}

function restartLevel() {
  if (!game.run) return;
  game.score = 0;
  startLevel(game.run.level.index);
}

function nextLevel() {
  const index = nextLevelIndex(game.run ? game.run.level.index : -1);
  if (index === null) return;
  startLevel(index);
}

function goHome() {
  game.phase = 'start';
  game.run = null;
  game.timer = null;
  ui.showStart();
  ui.announce('Twin Lanterns. Choose a level.');
}

function togglePause() {
  if (game.phase === 'play') {
    game.phase = 'paused';
    ui.showPause();
    ui.setPaused(true);
    ui.announce('Paused.');
  } else if (game.phase === 'paused') {
    game.phase = 'play';
    ui.hideOverlays();
    ui.setPaused(false);
    ui.announce('Playing.');
  }
}

function useHint() {
  if (game.phase !== 'play' || !game.run) return;
  const target = spendHint(game.run, performance.now(), HINT_SECONDS);
  if (!target) {
    ui.toast(game.run.hintsLeft <= 0 ? 'No hints left this level' : 'Nothing left to hint');
    return;
  }
  playHint();
  ui.updateHud(game.run, game.timer);
  ui.toast(`Hint: look near the ${sideName(target)}`);
}

function sideName(difference) {
  const x = difference.x;
  const y = difference.y;
  const across = x < 187 ? 'left edge' : x < 374 ? 'middle' : 'right edge';
  const down = y < 200 ? 'top' : y < 400 ? 'upper half' : 'lower half';
  return `${across}, ${down}`;
}

function handleFind(difference) {
  const now = performance.now();
  const found = registerFind(game.run, difference, now);
  if (!found) return;
  game.score = game.run.score;
  playFind(game.run.found.size);
  ui.updateHud(game.run, game.timer);
  ui.announce(`Found ${game.run.found.size} of ${game.run.differences.length}. ${remainingCount(game.run)} remaining.`);
  if (allFound(game.run)) finishLevel();
}

function handleMiss(point) {
  const now = performance.now();
  registerMiss(game.run, point, now);
  game.score = game.run.score;
  game.shakeAt = now;
  playMiss();
  ui.updateHud(game.run, game.timer);
  ui.toast('Not quite — that one is the same in both pictures');
}

function finishLevel() {
  if (game.ended) return;
  game.ended = true;
  const secondsLeft = game.timer.remaining;
  const stars = starsFor(game.run, secondsLeft);
  const bonus = clearBonus(game.run, secondsLeft);
  game.run.score += bonus.total;
  game.score = game.run.score;
  game.best = Math.max(game.best, game.score);
  game.phase = 'won';
  playWin();
  ui.updateHud(game.run, game.timer);
  renderer.draw(game.run, performance.now(), { hint: true, shakeAt: game.shakeAt });
  ui.showWin({ run: game.run, stars, bonus, score: game.score, hasNext: nextLevelIndex(game.run.level.index) !== null });
  ui.announce(`Level cleared with ${stars} stars. Score ${game.score}.`);
}

function loseLevel() {
  if (game.ended) return;
  game.ended = true;
  game.phase = 'over';
  game.best = Math.max(game.best, game.score);
  playLose();
  ui.showOver({ run: game.run, best: game.best });
  ui.announce(`Time up. You found ${game.run.found.size} of ${game.run.differences.length}.`);
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - (game.lastFrame || now)) / 1000);
  game.lastFrame = now;
  if (game.phase !== 'play' || !game.run) return;
  const over = game.timer.tick(dt);
  if (over) {
    loseLevel();
    renderer.draw(game.run, now, { hint: true, shakeAt: game.shakeAt });
    return;
  }
  ui.updateHud(game.run, game.timer);
  renderer.draw(game.run, now, { hint: true, shakeAt: game.shakeAt });
}

function isActive() {
  return game.phase === 'play' && game.run !== null;
}

createInput({
  canvases: [leftCanvas, rightCanvas],
  getRun: () => game.run,
  onFind: handleFind,
  onMiss: handleMiss,
  isActive,
});

window.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'h') {
    event.preventDefault();
    useHint();
  } else if (key === 'p' || key === 'escape') {
    event.preventDefault();
    if (game.phase === 'paused') togglePause();
    else if (game.phase === 'play') togglePause();
  } else if (key === 'r') {
    event.preventDefault();
    if (game.phase === 'won' || game.phase === 'over' || game.phase === 'paused' || game.phase === 'play') restartLevel();
  } else if (key === 'n') {
    if (game.phase === 'won') {
      event.preventDefault();
      nextLevel();
    }
  } else if (key === ' ' || key === 'enter') {
    if (game.phase === 'start') {
      event.preventDefault();
      startLevel(0);
    } else if (game.phase === 'won') {
      event.preventDefault();
      nextLevel();
    }
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.phase === 'play') togglePause();
});

// A small read-only handle for play-testing and the screenshot runs: the live run, the clock and
// the phase, so a browser test can check the game's own state instead of guessing from pixels.
window.twinLanterns = {
  state: () => ({
    phase: game.phase,
    level: game.run ? game.run.level.id : null,
    found: game.run ? game.run.found.size : 0,
    total: game.run ? game.run.differences.length : 0,
    score: game.run ? game.run.score : 0,
    remaining: game.timer ? game.timer.remaining : 0,
  }),
  drainClock: () => {
    if (game.timer) game.timer.remaining = 0.05;
  },
};

/* ------------------------------------------------------- staged screenshots */

function stageFromQuery() {
  const levelParam = Number.parseInt(params.get('level') ?? '', 10);
  const foundParam = params.get('found');
  if (!Number.isInteger(levelParam) || levelParam < 1 || levelParam > 3 || foundParam === null) return false;

  const index = levelParam - 1;
  const level = levelAt(index);
  const total = createRun(index).differences.length;
  const all = foundParam === 'all';
  const count = all ? total : Math.max(0, Math.min(total, Number.parseInt(foundParam, 10) || 0));

  const secondsLeft = Math.max(20, Math.round(level.seconds * (0.55 + 0.45 * (1 - count / total))));  game.staged = true;
  game.score = count * 100;
  startLevel(index, { preFound: count, secondsLeft, now: -10000 });
  game.phase = 'play';

  if (all) {
    game.ended = true;
    const run = game.run;
    const stars = starsFor(run, secondsLeft);
    const bonus = clearBonus(run, secondsLeft);
    run.score += bonus.total;
    game.score = run.score;
    game.phase = 'won';
    ui.updateHud(run, game.timer);
    ui.showWin({ run, stars, bonus, score: game.score, hasNext: index < 2 });
  } else {
    ui.updateHud(game.run, game.timer);
    if (count > 0) ui.toast(`${count} found — keep hunting`);
  }

  renderer.draw(game.run, performance.now(), { hint: true, shakeAt: -1e9 });
  document.body.dataset.staged = all ? 'win' : 'play';
  window.__shotReady = true;
  if (!all) {
    // A staged play frame is a real, running level: the clock ticks and the pictures animate.
    game.lastFrame = performance.now();
    requestAnimationFrame(frame);
  }
  return true;
}

if (!stageFromQuery()) {
  // The two pictures are painted behind the start card, so the page never opens on two empty frames.
  game.run = createRun(0);
  game.timer = createTimer(game.run.level.seconds);
  renderer.draw(game.run, performance.now(), { hint: false, shakeAt: -1e9 });
  ui.updateHud(game.run, game.timer);
  game.run = null;
  game.timer = null;
  ui.showStart();
  ui.announce('Twin Lanterns. Choose a level to begin.');
  game.lastFrame = performance.now();
  requestAnimationFrame(frame);
}
