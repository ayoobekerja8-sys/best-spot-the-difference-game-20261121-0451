// Click handling: a click on either picture is mapped from the canvas's on-screen box back into
// scene coordinates, then tested against every difference still unfound. A hit is handed to the
// game as a find; a miss is handed over as a point, so the renderer can shake and flash there.
import { SCENE } from './scenes.js';

const SLOP = 10;

/** The scene point under a pointer event, or null when the canvas is not laid out yet. */
function toScene(canvas, event) {
  const box = canvas.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0) return null;
  return {
    x: ((event.clientX - box.left) / box.width) * SCENE.width,
    y: ((event.clientY - box.top) / box.height) * SCENE.height,
  };
}

/** The nearest difference whose circle holds the point, found or not. */
function nearest(run, point) {
  let best = null;
  let bestDistance = Infinity;
  for (const difference of run.differences) {
    const dx = point.x - difference.x;
    const dy = point.y - difference.y;
    const distance = Math.hypot(dx, dy);
    const reach = Math.max(22, difference.r) + SLOP;
    if (distance <= reach && distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  return best;
}

/** The nearest unfound difference whose circle holds the point, if any. */
function hitTest(run, point) {
  const difference = nearest(run, point);
  return difference && !run.found.has(difference.id) ? difference : null;
}

/**
 * Wire clicks on both canvases. `getRun()` returns the run being played (or null when no level is
 * live), `onFind(difference)` and `onMiss(point)` are called for the game to score and react. A
 * click on a spot already marked does nothing: no second find, and no penalty either.
 */
export function createInput({ canvases, getRun, onFind, onMiss, isActive }) {
  const handlers = [];

  for (const canvas of canvases) {
    const handler = (event) => {
      if (!isActive()) return;
      const run = getRun();
      if (!run) return;
      const point = toScene(canvas, event);
      if (!point) return;
      const difference = hitTest(run, point);
      if (difference) onFind(difference);
      else if (nearest(run, point)) return;
      else onMiss(point);
    };
    canvas.addEventListener('pointerdown', handler);
    handlers.push(() => canvas.removeEventListener('pointerdown', handler));
  }

  return {
    hitTest,
    toScene,
    detach() {
      for (const off of handlers) off();
      handlers.length = 0;
    },
  };
}
