// The difference data: one list per level, each entry the spot in scene coordinates, the hit radius,
// the words the game speaks about it, and the variant that only the altered panel draws.
// The scene painters read these same coordinates, so the art and the hit test never drift apart.
export const LEVEL_DIFFERENCES = {
  park: [
    { id: 'bird', x: 415, y: 62, r: 28, kind: 'extra', label: 'An extra bird glides in' },
    { id: 'cloud', x: 320, y: 100, r: 56, kind: 'missing', label: 'A cloud has drifted away' },
    { id: 'apple', x: 145, y: 265, r: 26, kind: 'missing', label: 'An apple is missing from the tree' },
    { id: 'balloon', x: 500, y: 240, r: 36, kind: 'colour', variant: { color: '#59c8e8', shade: '#2f93b8' }, label: 'A balloon changed colour' },
    { id: 'duck', x: 412, y: 542, r: 32, kind: 'missing', label: 'A duck has left the pond' },
    { id: 'sign', x: 330, y: 400, r: 40, kind: 'flipped', label: 'The park sign points the other way' },
    { id: 'flower', x: 132, y: 570, r: 30, kind: 'moved', variant: { dx: 26 }, label: 'A flower moved along the bed' },
  ],
  market: [
    { id: 'star', x: 240, y: 64, r: 24, kind: 'extra', label: 'An extra star appears' },
    { id: 'lantern', x: 360, y: 100, r: 32, kind: 'colour', variant: { color: '#6ff0c9', glow: 'rgba(111,240,201,0.5)' }, label: 'A lantern glows a different colour' },
    { id: 'awning', x: 128, y: 296, r: 28, kind: 'colour', variant: { color: '#f0b64a' }, label: 'A stripe on the awning changed colour' },
    { id: 'bowl', x: 150, y: 400, r: 26, kind: 'missing', label: 'A bowl is missing from the counter' },
    { id: 'price', x: 40, y: 352, r: 36, kind: 'text', variant: { text: '6' }, label: 'The price board says 6' },
    { id: 'neon', x: 455, y: 224, r: 36, kind: 'flipped', label: 'The neon arrow points the other way' },
    { id: 'cat', x: 505, y: 380, r: 34, kind: 'missing', label: 'The market cat is gone' },
    { id: 'hat', x: 250, y: 430, r: 30, kind: 'colour', variant: { color: '#59c8e8' }, label: "A visitor's hat changed colour" },
    { id: 'crates', x: 350, y: 506, r: 34, kind: 'extra', label: 'An extra crate is stacked' },
    { id: 'steam', x: 425, y: 372, r: 32, kind: 'extra', label: 'An extra puff of steam' },
  ],
  moon: [
    { id: 'star', x: 300, y: 70, r: 24, kind: 'extra', label: 'An extra star burns in the dark' },
    { id: 'window', x: 175, y: 336, r: 42, kind: 'colour', variant: { color: '#ffe08a', glow: 'rgba(255,224,138,0.7)' }, label: 'A dome window is lit' },
    { id: 'dish', x: 270, y: 245, r: 34, kind: 'rotated', variant: { angle: 0.5 }, label: 'The antenna dish turned' },
    { id: 'panel', x: 445, y: 362, r: 32, kind: 'missing', label: 'A solar panel is gone' },
    { id: 'wheel', x: 190, y: 528, r: 28, kind: 'missing', label: 'The rover lost a wheel' },
    { id: 'visor', x: 300, y: 448, r: 28, kind: 'colour', variant: { color: '#ff9d5c' }, label: 'The visor changed colour' },
    { id: 'flag', x: 434, y: 316, r: 36, kind: 'flipped', label: 'The flag points the other way' },
    { id: 'crater', x: 245, y: 548, r: 32, kind: 'extra', label: 'A fresh crater' },
    { id: 'rock', x: 485, y: 500, r: 30, kind: 'moved', variant: { dx: 20 }, label: 'A rock rolled along the dust' },
    { id: 'plant', x: 70, y: 352, r: 30, kind: 'extra', label: 'The base plant grew a leaf' },
    { id: 'sign', x: 376, y: 426, r: 34, kind: 'flipped', label: 'The base sign is mirrored' },
    { id: 'padlight', x: 500, y: 560, r: 28, kind: 'colour', variant: { color: '#ff6b6b', glow: 'rgba(255,107,107,0.6)' }, label: 'A landing light turned red' },
  ],
};

/** Every difference of one level, in the order the game counts them. */
export function differencesFor(levelId) {
  return LEVEL_DIFFERENCES[levelId] ?? [];
}

/** One difference by level and id, for the scene painters that anchor art to its spot. */
export function differenceById(levelId, id) {
  return differencesFor(levelId).find((difference) => difference.id === id) ?? null;
}

/** The point a hint or a marker circles: the difference's own centre. */
export function centreOf(difference) {
  return { x: difference.x, y: difference.y };
}
