// Canvas drawing: both panels of the scene, the found markers with their pop-in rings, the hint
// pulse, and the feedback for a wrong click. Everything is painted from the run's state, so a
// staged screenshot (?found=N) renders exactly like a played one.
import { drawScene, SCENE } from './scenes.js';

/** The canvases' backing store is 2x the scene, so the art stays sharp when scaled up a little. */
const BACKING = 2;
const MARK_LIFE = 900;
const MISS_LIFE = 620;

function ring(ctx, x, y, radius, width, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function check(ctx, x, y, size, color, width) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(x - size, y);
  ctx.lineTo(x - size * 0.2, y + size * 0.72);
  ctx.lineTo(x + size, y - size * 0.62);
  ctx.stroke();
}

function easeOutBack(t) {
  const c = 1.70158;
  const p = t - 1;
  return 1 + (c + 1) * p * p * p + c * p * p;
}

function marker(ctx, difference, now, foundAt) {
  const age = Math.max(0, now - foundAt);
  const pop = Math.min(1, age / 260);
  const settle = easeOutBack(pop);
  const breathe = 1 + Math.sin(age / 320) * 0.035;
  const radius = Math.max(14, difference.r * 0.86) * (0.6 + 0.4 * settle) * breathe;

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(difference.x, difference.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(18, 12, 28, 0.34)';
  ctx.fill();
  ctx.globalAlpha = 1;

  const glow = ctx.createRadialGradient(difference.x, difference.y, radius * 0.55, difference.x, difference.y, radius * 1.5);
  glow.addColorStop(0, 'rgba(255, 207, 122, 0.0)');
  glow.addColorStop(0.6, 'rgba(255, 207, 122, 0.35)');
  glow.addColorStop(1, 'rgba(255, 207, 122, 0.0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(difference.x, difference.y, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // A dark backing ring first, so the gold reads on the bright park sky as well as the night scenes.
  ring(ctx, difference.x, difference.y, radius, 6.4, 'rgba(24, 14, 34, 0.72)');
  ring(ctx, difference.x, difference.y, radius, 3.4, '#ffd88a');
  ring(ctx, difference.x, difference.y, radius + 6, 1.4, 'rgba(24, 14, 34, 0.45)');
  ring(ctx, difference.x, difference.y, radius + 5, 1.2, 'rgba(255, 216, 138, 0.7)');

  if (age < MARK_LIFE) {
    const t = age / MARK_LIFE;
    const burst = radius + 6 + t * 34;
    ctx.globalAlpha = (1 - t) * 0.75;
    ring(ctx, difference.x, difference.y, burst, 3.4 * (1 - t) + 0.6, '#fff3cf');
    ctx.globalAlpha = 1;
  }

  check(ctx, difference.x, difference.y, 7.5, '#fff8e8', 3.2);
  ctx.restore();
}

function hintPulse(ctx, difference, now, until) {
  const left = until - now;
  if (left <= 0) return;
  const fade = Math.min(1, left / 300);
  const phase = (now % 900) / 900;
  ctx.save();
  ctx.globalAlpha = 0.8 * fade;
  for (let i = 0; i < 3; i += 1) {
    const t = (phase + i / 3) % 1;
    ctx.globalAlpha = (1 - t) * 0.7 * fade;
    ring(ctx, difference.x, difference.y, 12 + t * (difference.r + 26), 3 - t * 2, '#8ef0d0');
  }
  ctx.globalAlpha = 0.55 * fade;
  ctx.beginPath();
  ctx.arc(difference.x, difference.y, difference.r + 6, 0, Math.PI * 2);
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(142, 240, 208, 0.9)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

function missFlash(ctx, miss, now) {
  const age = now - miss.at;
  if (age < 0 || age > MISS_LIFE) return;
  const t = age / MISS_LIFE;
  ctx.save();
  ctx.globalAlpha = (1 - t) * 0.55;
  ctx.fillStyle = 'rgba(255, 90, 90, 0.55)';
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
  ctx.globalAlpha = 1 - t;
  const s = 13;
  ctx.strokeStyle = '#ffe0dc';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(miss.x - s, miss.y - s);
  ctx.lineTo(miss.x + s, miss.y + s);
  ctx.moveTo(miss.x + s, miss.y - s);
  ctx.lineTo(miss.x - s, miss.y + s);
  ctx.stroke();
  ctx.restore();
}

function paintPanel(ctx, run, now, variants, state) {
  ctx.setTransform(BACKING, 0, 0, BACKING, 0, 0);
  ctx.clearRect(0, 0, SCENE.width, SCENE.height);

  const shakeAge = now - (state.shakeAt ?? -1e9);
  if (shakeAge >= 0 && shakeAge < 320) {
    const amp = 6 * (1 - shakeAge / 320);
    ctx.translate(Math.sin(shakeAge / 22) * amp, Math.cos(shakeAge / 17) * amp * 0.5);
  }

  drawScene(ctx, run.level.id, variants);

  const vignette = ctx.createRadialGradient(
    SCENE.width / 2, SCENE.height / 2, SCENE.height * 0.32,
    SCENE.width / 2, SCENE.height / 2, SCENE.height * 0.82,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(8,5,16,0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);

  for (const difference of run.differences) {
    if (!run.found.has(difference.id)) continue;
    marker(ctx, difference, now, run.markerAt.get(difference.id) ?? now);
  }

  if (state.hint && run.hintTarget && now < run.hintUntil) hintPulse(ctx, run.hintTarget, now, run.hintUntil);
  if (run.miss) missFlash(ctx, run.miss, now);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function createRenderer(leftCanvas, rightCanvas) {
  for (const canvas of [leftCanvas, rightCanvas]) {
    canvas.width = SCENE.width * BACKING;
    canvas.height = SCENE.height * BACKING;
  }
  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');
  const allVariants = new Set();

  function draw(run, now, state) {
    allVariants.clear();
    for (const difference of run.differences) allVariants.add(difference.id);
    paintPanel(leftCtx, run, now, new Set(), state);
    paintPanel(rightCtx, run, now, allVariants, state);
  }

  return { draw };
}

/** Paint a level thumbnail into a small canvas for the start screen. */
export function paintPreview(canvas, levelId) {
  const ctx = canvas.getContext('2d');
  canvas.width = SCENE.width;
  canvas.height = SCENE.height;
  ctx.clearRect(0, 0, SCENE.width, SCENE.height);
  drawScene(ctx, levelId, new Set());
  const shade = ctx.createLinearGradient(0, SCENE.height * 0.55, 0, SCENE.height);
  shade.addColorStop(0, 'rgba(12,8,22,0)');
  shade.addColorStop(1, 'rgba(12,8,22,0.45)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
}
