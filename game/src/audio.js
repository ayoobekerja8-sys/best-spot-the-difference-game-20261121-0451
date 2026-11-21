// Every sound in the game, synthesised with WebAudio: a rising chime per find, a soft thud for a
// miss, a two-note hint, a fanfare on a cleared level. No audio files and no network: the browser
// makes all of it. The context is created on the first gesture, as browsers require.
let context = null;
let master = null;

function audio() {
  if (context) return context;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
    master = context.createGain();
    master.gain.value = 0.16;
    master.connect(context.destination);
  } catch {
    context = null;
  }
  return context;
}

export function unlockAudio() {
  const ctx = audio();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function tone(freq, delay, duration, type = 'sine', volume = 1) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function glide(from, to, delay, duration, type = 'triangle', volume = 0.7) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0, 2349.32];

/** The chime for the nth find: climbs the scale as the hunt goes on. */
export function playFind(count) {
  const note = PENTATONIC[Math.min(PENTATONIC.length - 1, Math.max(0, count - 1))];
  tone(note, 0, 0.22, 'sine', 0.9);
  tone(note * 1.5, 0.045, 0.26, 'sine', 0.45);
  tone(note * 2, 0.09, 0.3, 'triangle', 0.18);
}

export function playMiss() {
  glide(180, 92, 0, 0.16, 'square', 0.35);
}

export function playHint() {
  tone(659.25, 0, 0.16, 'triangle', 0.5);
  tone(987.77, 0.1, 0.24, 'triangle', 0.4);
}

export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((note, index) => tone(note, index * 0.09, 0.4, 'triangle', 0.55));
  tone(261.63, 0, 0.9, 'sine', 0.3);
}

export function playLose() {
  tone(392, 0, 0.3, 'triangle', 0.5);
  tone(311.13, 0.16, 0.34, 'triangle', 0.5);
  tone(233.08, 0.34, 0.6, 'sine', 0.45);
}

export function playClick() {
  tone(880, 0, 0.05, 'square', 0.18);
}
