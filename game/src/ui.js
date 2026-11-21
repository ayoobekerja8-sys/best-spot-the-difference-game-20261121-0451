// The page around the pictures: the HUD's counter, dots, score and timer bar, the level cards on
// the start screen, and the win, game-over and pause cards. One job: keep the DOM in step with the
// run. No game rules live here.
import { LEVELS } from './levels.js';
import { paintPreview } from './render.js';

const $ = (id) => document.getElementById(id);

export function createUi({ onStartLevel, onNext, onRetry, onReplay, onHome, onResume, onHint, onPause }) {
  const elements = {
    levelLine: $('level-line'),
    counter: $('counter'),
    dots: $('dots'),
    score: $('score'),
    timer: $('timer'),
    timerFill: $('timer-fill'),
    timerLabel: $('timer-label'),
    hintButton: $('hint-button'),
    pauseButton: $('pause-button'),
    toast: $('toast'),
    status: $('status'),
    startScreen: $('start-screen'),
    winScreen: $('win-screen'),
    overScreen: $('over-screen'),
    pauseScreen: $('pause-screen'),
    winTitle: $('win-title'),
    winStars: $('win-stars'),
    winScore: $('win-score'),
    winLines: $('win-lines'),
    nextButton: $('next-button'),
    overLine: $('over-line'),
    overLines: $('over-lines'),
    levelCards: $('level-cards'),
  };

  let dotCount = -1;
  let toastTimer = 0;
  let lastCounter = '';
  let lastScore = '';
  let lastHints = -1;
  let lastTimerLabel = '';
  let lastUrgent = null;

  buildLevelCards(elements.levelCards, onStartLevel);

  $('start-button').addEventListener('click', () => onStartLevel(0));
  elements.nextButton.addEventListener('click', onNext);
  $('replay-button').addEventListener('click', onReplay);
  $('home-button').addEventListener('click', onHome);
  $('retry-button').addEventListener('click', onRetry);
  $('over-home-button').addEventListener('click', onHome);
  $('resume-button').addEventListener('click', onResume);
  $('pause-restart-button').addEventListener('click', onRetry);
  $('pause-home-button').addEventListener('click', onHome);
  elements.hintButton.addEventListener('click', onHint);
  elements.pauseButton.addEventListener('click', onPause);

  function announce(message) {
    elements.status.textContent = message;
  }

  function toast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1600);
  }

  function showOnly(name) {
    for (const key of ['startScreen', 'winScreen', 'overScreen', 'pauseScreen']) {
      elements[key].classList.toggle('hidden', key !== name);
    }
  }

  function hideOverlays() {
    showOnly(null);
  }

  /** The live HUD: level name, counter, one dot per difference, score, timer. */
  function updateHud(run, timer) {
    const total = run.differences.length;
    const found = run.found.size;
    const remaining = total - found;
    const levelLine = `Level ${run.level.index + 1} · <strong>${run.level.name}</strong>`;
    if (elements.levelLine.dataset.text !== levelLine) {
      elements.levelLine.innerHTML = levelLine;
      elements.levelLine.dataset.text = levelLine;
    }

    const counter = `Found ${found} of ${total} — <span class="rest">${remaining} remaining</span>`;
    if (counter !== lastCounter) {
      elements.counter.innerHTML = counter;
      lastCounter = counter;
    }

    const score = String(run.score);
    if (score !== lastScore) {
      elements.score.textContent = score;
      lastScore = score;
    }

    if (dotCount !== total) {
      elements.dots.innerHTML = '';
      for (let i = 0; i < total; i += 1) elements.dots.appendChild(document.createElement('i'));
      dotCount = total;
    }
    const dots = elements.dots.children;
    for (let i = 0; i < dots.length; i += 1) {
      dots[i].classList.toggle('on', i < found);
    }

    const fraction = timer.fraction();
    elements.timerFill.style.transform = `scaleX(${fraction.toFixed(4)})`;
    const label = timer.label();
    if (label !== lastTimerLabel) {
      elements.timerLabel.textContent = label;
      lastTimerLabel = label;
    }
    const urgent = timer.urgent();
    if (urgent !== lastUrgent) {
      elements.timer.classList.toggle('urgent', urgent);
      lastUrgent = urgent;
    }
    if (run.hintsLeft !== lastHints) {
      lastHints = run.hintsLeft;
      elements.hintButton.disabled = run.hintsLeft <= 0;
      elements.hintButton.textContent = `Hint ${run.hintsLeft} left`;
      const key = document.createElement('kbd');
      key.textContent = 'H';
      elements.hintButton.appendChild(key);
    }
  }

  function showStart() {
    showOnly('startScreen');
  }

  function showPause() {
    showOnly('pauseScreen');
  }

  function showWin({ run, stars, bonus, score, hasNext }) {
    showOnly('winScreen');
    elements.winTitle.textContent = `${run.level.name} cleared`;
    const starSpans = elements.winStars.children;
    for (let i = 0; i < starSpans.length; i += 1) starSpans[i].classList.toggle('on', i < stars);
    elements.winScore.textContent = String(score);
    const cleanLine = bonus.clean > 0 ? `Clean sweep bonus <b>+${bonus.clean}</b><br>` : '';
    elements.winLines.innerHTML =
      `${run.differences.length} of ${run.differences.length} differences found · ${run.misses} misses · ${run.hintsUsed} hints<br>` +
      `Time bonus <b>+${bonus.time}</b><br>${cleanLine}` +
      (hasNext ? 'One scene still waits.' : 'All three scenes cleared. Beautiful work.');
    elements.nextButton.style.display = hasNext ? '' : 'none';
  }

  function showOver({ run, best }) {
    showOnly('overScreen');
    elements.overLine.textContent = `You found ${run.found.size} of ${run.differences.length} differences in ${run.level.name}.`;
    const left = run.differences.filter((difference) => !run.found.has(difference.id)).slice(0, 3);
    const list = left.length > 0
      ? `<br>Still hiding: ${left.map((difference) => difference.label.toLowerCase()).join('; ')}.`
      : '';
    elements.overLines.innerHTML = `Best score this visit: <b>${best}</b>${list}`;
  }

  function setPaused(paused) {
    elements.pauseButton.textContent = paused ? 'Resume' : 'Pause';
    const key = document.createElement('kbd');
    key.textContent = 'P';
    elements.pauseButton.appendChild(key);
  }
  return {
    updateHud,
    showStart,
    showPause,
    showWin,
    showOver,
    hideOverlays,
    setPaused,
    announce,
    toast,
  };
}

/** The three level cards, each a real painting of that scene. */
function buildLevelCards(container, onStartLevel) {
  LEVELS.forEach((level) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card';
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    paintPreview(canvas, level.id);
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = `${level.index + 1}. ${level.name}`;
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${level.blurb} · ${level.seconds}s`;
    card.append(canvas, name, meta);
    card.addEventListener('click', () => onStartLevel(level.index));
    container.appendChild(card);
  });
}
