// The three scenes, painted in code. Each painter takes the set of difference ids to apply, so the
// left panel paints with an empty set and the right with every id: the two pictures come from one
// drawing routine and can never disagree about anything but the differences themselves.
export const SCENE = { width: 560, height: 600 };

/* ---------------------------------------------------------------- little paint helpers */

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function fill(ctx, color) {
  ctx.fillStyle = color;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width, cap = 'round') {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = cap;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE.height);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  circle(ctx, x, y, r);
  ctx.fill();
}

function sparkle(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? r : r * 0.34;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function bird(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-7, -9, 0, 0);
  ctx.quadraticCurveTo(7, -9, 14, 0);
  ctx.stroke();
  ctx.restore();
}

function cloud(ctx, x, y, scale, tint) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = tint;
  ellipse(ctx, -28, 6, 26, 17);
  ctx.fill();
  ellipse(ctx, 0, 0, 34, 23);
  ctx.fill();
  ellipse(ctx, 30, 8, 24, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ellipse(ctx, -4, -8, 22, 12);
  ctx.fill();
  ctx.restore();
}

function flower(ctx, x, y, petal, middle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  line(ctx, 0, 0, 0, 26, '#3f8a4a', 3);
  for (let i = 0; i < 5; i += 1) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.fillStyle = petal;
    circle(ctx, Math.cos(angle) * 8, Math.sin(angle) * 8, 6);
    ctx.fill();
  }
  ctx.fillStyle = middle;
  circle(ctx, 0, 0, 4.5);
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------------- 1. Sunny Park */

function park(ctx, v) {
  sky(ctx, [
    [0, '#8fd3f4'],
    [0.55, '#cfeefb'],
    [1, '#eef9e6'],
  ]);

  glow(ctx, 470, 78, 110, 'rgba(255,240,180,0.85)');
  ctx.fillStyle = '#ffe9a3';
  circle(ctx, 470, 78, 38);
  ctx.fill();

  if (!v.has('cloud')) cloud(ctx, 320, 100, 1, '#ffffff');
  cloud(ctx, 145, 88, 0.8, '#ffffff');
  cloud(ctx, 432, 160, 0.62, '#f4fbff');

  bird(ctx, 205, 70, 0.9, '#3f5d74');
  bird(ctx, 248, 92, 0.72, '#3f5d74');
  if (v.has('bird')) bird(ctx, 415, 62, 0.95, '#3f5d74');

  ctx.fillStyle = '#9ed8a0';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.quadraticCurveTo(120, 268, 260, 320);
  ctx.quadraticCurveTo(400, 366, 560, 300);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#7cc47f';
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.quadraticCurveTo(180, 320, 330, 372);
  ctx.quadraticCurveTo(450, 410, 560, 356);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#6bb86f';
  ctx.beginPath();
  ctx.moveTo(0, 408);
  ctx.quadraticCurveTo(200, 372, 400, 418);
  ctx.quadraticCurveTo(480, 434, 560, 412);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(60,120,70,0.35)';
  ellipse(ctx, 150, 402, 66, 12);
  ctx.fill();

  // A pale gravel path from the near edge up toward the pond, and a low fence along the ridge.
  ctx.fillStyle = '#efe3c4';
  ctx.beginPath();
  ctx.moveTo(228, 600);
  ctx.quadraticCurveTo(258, 574, 300, 552);
  ctx.quadraticCurveTo(318, 540, 330, 524);
  ctx.lineTo(352, 528);
  ctx.quadraticCurveTo(336, 552, 318, 566);
  ctx.quadraticCurveTo(286, 586, 272, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(196,180,146,0.55)';
  for (let i = 0; i < 5; i += 1) {
    ellipse(ctx, 258 + i * 14, 586 - i * 14, 6, 3);
    ctx.fill();
  }

  for (let i = 0; i < 11; i += 1) {
    const fx = 26 + i * 52;
    const fy = 336 + Math.round(Math.sin(i * 1.4) * 6);
    ctx.fillStyle = '#d9c9a4';
    rr(ctx, fx, fy, 6, 30, 2);
    ctx.fill();
    ctx.fillStyle = '#c2b08a';
    rr(ctx, fx - 4, fy + 8, 14, 4, 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#d9c9a4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(26, 344);
  ctx.lineTo(560, 344);
  ctx.stroke();

  line(ctx, 120, 420, 120, 300, '#8a5a3b', 26);
  line(ctx, 108, 340, 78, 300, '#8a5a3b', 12);
  line(ctx, 132, 340, 162, 296, '#8a5a3b', 12);

  const canopy = [
    [96, 250, 46],
    [150, 240, 44],
    [122, 212, 50],
    [88, 296, 34],
    [156, 292, 33],
  ];
  for (const [x, y, r] of canopy) {
    ctx.fillStyle = '#3f9b52';
    circle(ctx, x, y, r);
    ctx.fill();
  }
  for (const [x, y, r] of canopy) {
    ctx.fillStyle = 'rgba(120,200,110,0.55)';
    circle(ctx, x - r * 0.28, y - r * 0.32, r * 0.55);
    ctx.fill();
  }

  const apples = [
    [86, 232],
    [110, 302],
    [162, 236],
    [76, 272],
    [138, 214],
  ];
  for (const [x, y] of apples) {
    ctx.fillStyle = '#e8534a';
    circle(ctx, x, y, 9);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    circle(ctx, x - 3, y - 3, 3);
    ctx.fill();
  }
  if (!v.has('apple')) {
    ctx.fillStyle = '#e8534a';
    circle(ctx, 145, 265, 9);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    circle(ctx, 142, 262, 3);
    ctx.fill();
  }

  ctx.fillStyle = '#4f9f8f';
  ellipse(ctx, 390, 552, 108, 38);
  ctx.fill();
  ctx.fillStyle = '#6fc0b0';
  ellipse(ctx, 390, 547, 98, 30);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ellipse(ctx, 362, 538, 38, 8);
  ctx.fill();
  ellipse(ctx, 428, 556, 24, 5);
  ctx.fill();

  const duck = (x, y, scale, flipped) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipped ? -scale : scale, scale);
    ctx.fillStyle = '#f7d154';
    ellipse(ctx, 0, 0, 18, 12);
    ctx.fill();
    circle(ctx, 12, -10, 8);
    ctx.fill();
    ctx.fillStyle = '#f08b3c';
    ctx.beginPath();
    ctx.moveTo(19, -12);
    ctx.lineTo(29, -8);
    ctx.lineTo(19, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2b3a45';
    circle(ctx, 14, -12, 1.8);
    ctx.fill();
    ctx.restore();
  };
  duck(348, 548, 1, false);
  if (!v.has('duck')) duck(412, 542, 1.1, true);

  ctx.fillStyle = 'rgba(40,100,60,0.45)';
  ellipse(ctx, 330, 462, 46, 9);
  ctx.fill();
  ctx.fillStyle = '#a06a42';
  rr(ctx, 323, 412, 14, 54, 4);
  ctx.fill();
  const signFlipped = v.has('sign');
  ctx.save();
  ctx.translate(330, 400);
  ctx.fillStyle = '#f2e2b8';
  rr(ctx, -48, -18, 96, 36, 7);
  ctx.fill();
  ctx.strokeStyle = '#8a6a3c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#7a5a30';
  ctx.beginPath();
  if (signFlipped) {
    ctx.moveTo(34, 0);
    ctx.lineTo(18, -11);
    ctx.lineTo(18, 11);
  } else {
    ctx.moveTo(-34, 0);
    ctx.lineTo(-18, -11);
    ctx.lineTo(-18, 11);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a5a30';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PARK', signFlipped ? 10 : -8, 1);
  ctx.restore();

  const bench = (x, y) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(50,90,55,0.4)';
    ellipse(ctx, 0, 44, 46, 8);
    ctx.fill();
    ctx.fillStyle = '#a8703f';
    rr(ctx, -40, -14, 80, 10, 3);
    ctx.fill();
    rr(ctx, -40, 0, 80, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#8a5a32';
    rr(ctx, -34, -22, 68, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#6f4726';
    rr(ctx, -36, 6, 7, 34, 3);
    ctx.fill();
    rr(ctx, 29, 6, 7, 34, 3);
    ctx.fill();
    ctx.restore();
  };
  bench(478, 462);

  const balloonColor = v.has('balloon') ? '#59c8e8' : '#e8674f';
  const balloonShade = v.has('balloon') ? '#2f93b8' : '#b8402f';
  ctx.strokeStyle = 'rgba(70,70,80,0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(500, 268);
  ctx.quadraticCurveTo(506, 300, 498, 326);
  ctx.stroke();
  ctx.fillStyle = balloonColor;
  ellipse(ctx, 500, 240, 24, 30);
  ctx.fill();
  ctx.fillStyle = balloonShade;
  ctx.beginPath();
  ctx.moveTo(500, 270);
  ctx.quadraticCurveTo(512, 250, 512, 232);
  ctx.quadraticCurveTo(508, 246, 500, 270);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ellipse(ctx, 492, 228, 6, 10);
  ctx.fill();
  ctx.fillStyle = balloonShade;
  ctx.beginPath();
  ctx.moveTo(494, 269);
  ctx.lineTo(506, 269);
  ctx.lineTo(500, 277);
  ctx.closePath();
  ctx.fill();

  const flowers = [
    [34, 580, '#f28bb3', '#ffd966'],
    [58, 570, '#f5f0e1', '#f2b33d'],
    [82, 588, '#c9a3f5', '#ffe28a'],
    [106, 574, '#f28bb3', '#ffd966'],
  ];
  const moved = v.has('flower');
  for (const [x, y, petal, middle] of flowers) flower(ctx, x, y, petal, middle, 0.95);
  flower(ctx, moved ? 158 : 132, 570, '#ffd166', '#e8683f', 1.1);

  ctx.fillStyle = '#5cae64';
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 97 + 30) % 552;
    const y = 420 + ((i * 53) % 150);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 3, y - 12, x + 7, y - 15);
    ctx.quadraticCurveTo(x + 5, y - 6, x + 5, y);
    ctx.closePath();
    ctx.fill();
  }
}

/* ---------------------------------------------------------------- 2. Night Market */

function market(ctx, v) {
  sky(ctx, [
    [0, '#1b1440'],
    [0.55, '#2c1e55'],
    [1, '#4a2b5e'],
  ]);

  glow(ctx, 470, 86, 130, 'rgba(255,236,180,0.28)');
  ctx.fillStyle = '#fff3c9';
  circle(ctx, 470, 86, 34);
  ctx.fill();
  ctx.fillStyle = 'rgba(214,196,150,0.5)';
  circle(ctx, 458, 78, 8);
  ctx.fill();
  circle(ctx, 480, 96, 5);
  ctx.fill();

  const stars = [
    [70, 60, 2.4],
    [120, 120, 1.8],
    [190, 44, 2],
    [300, 130, 1.6],
    [360, 40, 2.2],
    [430, 150, 1.7],
    [510, 34, 2],
    [540, 120, 1.5],
  ];
  for (const [x, y, r] of stars) {
    ctx.fillStyle = 'rgba(255,247,220,0.9)';
    circle(ctx, x, y, r);
    ctx.fill();
  }
  if (v.has('star')) sparkle(ctx, 240, 64, 9, '#fff6cf');

  const lantern = (x, y, scale, color, halo) => {
    line(ctx, x, 0, x, y - 24 * scale, '#2a1c3a', 2);
    ctx.fillStyle = '#2a1c3a';
    rr(ctx, x - 9 * scale, y - 30 * scale, 18 * scale, 7 * scale, 2);
    ctx.fill();
    glow(ctx, x, y, 42 * scale, halo);
    ctx.fillStyle = color;
    rr(ctx, x - 14 * scale, y - 22 * scale, 28 * scale, 34 * scale, 10 * scale);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    rr(ctx, x - 8 * scale, y - 18 * scale, 6 * scale, 24 * scale, 3 * scale);
    ctx.fill();
    ctx.fillStyle = '#2a1c3a';
    rr(ctx, x - 9 * scale, y + 10 * scale, 18 * scale, 6 * scale, 2);
    ctx.fill();
    line(ctx, x, y + 16 * scale, x, y + 26 * scale, '#2a1c3a', 2);
  };
  lantern(104, 96, 1, '#ff8a5c', 'rgba(255,138,92,0.55)');
  lantern(480, 76, 0.9, '#ffd166', 'rgba(255,209,102,0.5)');
  if (v.has('lantern')) lantern(360, 100, 1, '#6ff0c9', 'rgba(111,240,201,0.5)');
  else lantern(360, 100, 1, '#ff8a5c', 'rgba(255,138,92,0.55)');

  ctx.fillStyle = '#231a3d';
  ctx.fillRect(0, 250, 560, 350);

  ctx.fillStyle = '#2e2150';
  for (let i = 0; i < 9; i += 1) {
    ctx.fillRect(i * 64, 250, 30, 350);
  }

  ctx.fillStyle = '#191129';
  ctx.fillRect(18, 268, 250, 8);
  line(ctx, 24, 276, 24, 400, '#191129', 6);
  line(ctx, 262, 276, 262, 400, '#191129', 6);

  const stripes = ['#f6e7c8', '#e8674f', '#f6e7c8', '#e8674f', '#f6e7c8', '#e8674f', '#f6e7c8', '#e8674f'];
  if (v.has('awning')) stripes[3] = '#f0b64a';
  for (let i = 0; i < stripes.length; i += 1) {
    ctx.fillStyle = stripes[i];
    rr(ctx, 26 + i * 29, 276, 30, 32, 0);
    ctx.fill();
    ellipse(ctx, 41 + i * 29, 308, 15, 8);
    ctx.fill();
  }

  ctx.fillStyle = '#3a2a55';
  ctx.fillRect(34, 372, 230, 30);
  ctx.fillStyle = '#5c4478';
  ctx.fillRect(34, 372, 230, 8);
  ctx.fillStyle = '#2a1d3f';
  ctx.fillRect(40, 402, 14, 96);
  ctx.fillRect(244, 402, 14, 96);

  const bowl = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 9, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ellipse(ctx, x, y, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#e8c27a';
    circle(ctx, x - 5, y - 5, 3);
    ctx.fill();
    circle(ctx, x + 4, y - 6, 2.6);
    ctx.fill();
  };
  bowl(94, 400, '#e8e1f2');
  bowl(200, 400, '#e8e1f2');
  if (!v.has('bowl')) bowl(150, 400, '#cfe8e1');

  ctx.fillStyle = '#f2e2b8';
  rr(ctx, 20, 330, 46, 44, 5);
  ctx.fill();
  ctx.strokeStyle = '#8a6a3c';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#5c3f22';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('5', 43, 346);
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('each', 43, 362);
  if (v.has('price')) {
    ctx.fillStyle = '#f2e2b8';
    rr(ctx, 22, 343, 30, 22, 3);
    ctx.fill();
    ctx.fillStyle = '#5c3f22';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('6', 43, 354);
  }

  const arrowRight = v.has('neon');
  ctx.save();
  ctx.translate(455, 224);
  ctx.shadowColor = 'rgba(120,240,255,0.9)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#7af0ff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (arrowRight) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.moveTo(12, -16);
    ctx.lineTo(30, 0);
    ctx.lineTo(12, 16);
  } else {
    ctx.moveTo(30, 0);
    ctx.lineTo(-30, 0);
    ctx.moveTo(-12, -16);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-12, 16);
  }
  ctx.stroke();
  ctx.restore();

  const cat = (x, y) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1b1526';
    ellipse(ctx, 0, 10, 16, 16);
    ctx.fill();
    circle(ctx, 0, -8, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-11, -14);
    ctx.lineTo(-8, -27);
    ctx.lineTo(-1, -18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, -14);
    ctx.lineTo(8, -27);
    ctx.lineTo(1, -18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1b1526';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 18);
    ctx.quadraticCurveTo(26, 20, 22, 6);
    ctx.stroke();
    ctx.fillStyle = '#ffe28a';
    circle(ctx, -4, -9, 1.8);
    ctx.fill();
    circle(ctx, 4, -9, 1.8);
    ctx.fill();
    ctx.restore();
  };
  ctx.fillStyle = '#4a3660';
  rr(ctx, 474, 386, 62, 12, 3);
  ctx.fill();
  if (!v.has('cat')) cat(505, 374);

  const hatColor = v.has('hat') ? '#59c8e8' : '#e8674f';
  const person = (x, y, scale, body, hat) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = body;
    rr(ctx, -16, 0, 32, 64, 10);
    ctx.fill();
    ctx.fillStyle = hat;
    ellipse(ctx, 0, -6, 17, 6);
    ctx.fill();
    ctx.fillStyle = '#2a1d3f';
    circle(ctx, 0, -18, 12);
    ctx.fill();
    ctx.fillStyle = hat;
    rr(ctx, -12, -32, 24, 14, 6);
    ctx.fill();
    ctx.fillStyle = hat;
    rr(ctx, -20, -22, 40, 5, 2);
    ctx.fill();
    ctx.restore();
  };
  person(180, 470, 0.9, '#463266', '#ffd166');
  person(250, 452, 1, '#3a2a55', hatColor);
  person(382, 470, 0.86, '#463266', '#c9a3f5');

  ctx.fillStyle = '#6b4a2e';
  rr(ctx, 292, 496, 42, 42, 4);
  ctx.fill();
  ctx.strokeStyle = '#4a3120';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (v.has('crates')) {
    ctx.fillStyle = '#7a5535';
    rr(ctx, 330, 486, 40, 40, 4);
    ctx.fill();
    ctx.strokeStyle = '#4a3120';
    ctx.stroke();
  }

  ctx.fillStyle = '#3a2a55';
  rr(ctx, 394, 398, 62, 46, 8);
  ctx.fill();
  ctx.fillStyle = '#5c4478';
  ellipse(ctx, 425, 398, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#f2c94c';
  rr(ctx, 400, 410, 50, 6, 3);
  ctx.fill();

  const steam = (x, y, scale, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#e8e1f2';
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 10 * scale, y - 16 * scale, x + 10 * scale, y - 26 * scale, x, y - 44 * scale);
    ctx.stroke();
    ctx.restore();
  };
  steam(410, 392, 0.9, 0.5);
  steam(440, 388, 0.7, 0.35);
  if (v.has('steam')) steam(425, 372, 0.9, 0.55);

  // A second stall on the right, its own warm pool of light on the stones.
  ctx.fillStyle = '#191129';
  ctx.fillRect(392, 330, 152, 8);
  line(ctx, 398, 338, 398, 430, '#191129', 5);
  line(ctx, 538, 338, 538, 430, '#191129', 5);
  ctx.fillStyle = '#3a2a55';
  ctx.fillRect(396, 402, 144, 26);
  ctx.fillStyle = '#5c4478';
  ctx.fillRect(396, 402, 144, 7);
  const jars = ['#e8a33d', '#c9a3f5', '#6ff0c9', '#ff8a5c', '#f2c94c'];
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = jars[i];
    rr(ctx, 406 + i * 26, 380, 16, 22, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    rr(ctx, 409 + i * 26, 383, 4, 14, 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f2e2b8';
  rr(ctx, 430, 344, 78, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#5c3f22';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JARS', 469, 355);

  // Bunting strung between the two stalls.
  ctx.strokeStyle = 'rgba(232,225,242,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, 214);
  ctx.quadraticCurveTo(280, 246, 540, 212);
  ctx.stroke();
  const bunting = ['#e8674f', '#ffd166', '#6ff0c9', '#c9a3f5', '#ff8a5c'];
  for (let i = 0; i < 9; i += 1) {
    const t = (i + 0.5) / 9;
    const x = 24 + t * 516;
    const y = 214 + Math.sin(t * Math.PI) * 30;
    ctx.fillStyle = bunting[i % bunting.length];
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 17);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#2a1d3f';
  ctx.fillRect(0, 556, 560, 44);
  ctx.fillStyle = 'rgba(255,209,102,0.18)';
  for (let i = 0; i < 6; i += 1) {
    ellipse(ctx, 60 + i * 92, 572, 30, 6);
    ctx.fill();
  }
  const pool = ctx.createRadialGradient(470, 548, 4, 470, 548, 86);
  pool.addColorStop(0, 'rgba(255,196,120,0.28)');
  pool.addColorStop(1, 'rgba(255,196,120,0)');
  ctx.fillStyle = pool;
  ellipse(ctx, 470, 552, 86, 26);
  ctx.fill();
}

/* ---------------------------------------------------------------- 3. Moon Base */

function moon(ctx, v) {
  sky(ctx, [
    [0, '#0a0c24'],
    [0.5, '#161a3d'],
    [1, '#2a2450'],
  ]);

  const stars = [
    [40, 60, 1.8],
    [96, 130, 1.4],
    [150, 48, 2],
    [210, 120, 1.5],
    [330, 140, 1.7],
    [380, 40, 2.2],
    [470, 118, 1.4],
    [530, 60, 1.9],
    [80, 210, 1.3],
    [500, 200, 1.5],
  ];
  for (const [x, y, r] of stars) {
    ctx.fillStyle = 'rgba(226,235,255,0.9)';
    circle(ctx, x, y, r);
    ctx.fill();
  }
  if (v.has('star')) sparkle(ctx, 300, 70, 9, '#e8f0ff');

  ctx.fillStyle = '#4f7fd6';
  circle(ctx, 470, 200, 30);
  ctx.fill();
  ctx.fillStyle = '#6fa35f';
  ellipse(ctx, 462, 192, 12, 8);
  ctx.fill();
  ellipse(ctx, 480, 210, 9, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ellipse(ctx, 458, 184, 9, 5);
  ctx.fill();

  ctx.fillStyle = '#b9bcc9';
  ctx.beginPath();
  ctx.moveTo(0, 336);
  ctx.quadraticCurveTo(140, 300, 300, 330);
  ctx.quadraticCurveTo(430, 352, 560, 322);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c9ccd7';
  ctx.beginPath();
  ctx.moveTo(0, 370);
  ctx.quadraticCurveTo(180, 344, 360, 374);
  ctx.quadraticCurveTo(470, 392, 560, 366);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8dae2';
  ctx.beginPath();
  ctx.moveTo(0, 440);
  ctx.quadraticCurveTo(200, 414, 400, 448);
  ctx.quadraticCurveTo(490, 462, 560, 444);
  ctx.lineTo(560, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(120,124,140,0.4)';
  ellipse(ctx, 350, 500, 60, 14);
  ctx.fill();
  ellipse(ctx, 120, 460, 40, 9);
  ctx.fill();

  const domeWindow = v.has('window') ? '#ffe08a' : '#7d8fb3';
  const domeHalo = v.has('window') ? 'rgba(255,224,138,0.55)' : 'rgba(125,143,179,0.18)';
  ctx.fillStyle = '#d8dae2';
  rr(ctx, 62, 352, 226, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#9aa0b4';
  rr(ctx, 62, 352, 226, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#e7e9ef';
  ctx.beginPath();
  ctx.arc(175, 356, 104, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(175, 356, 104, Math.PI * 1.05, Math.PI * 1.45);
  ctx.arc(175, 356, 88, Math.PI * 1.45, Math.PI * 1.05, true);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b3b8c8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(175, 356, 76, Math.PI, 0);
  ctx.stroke();
  glow(ctx, 175, 336, 42, domeHalo);
  ctx.fillStyle = domeWindow;
  rr(ctx, 146, 316, 58, 40, 8);
  ctx.fill();
  ctx.strokeStyle = '#8b91a6';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  rr(ctx, 152, 322, 10, 26, 4);
  ctx.fill();
  ctx.fillStyle = '#3f4a68';
  rr(ctx, 214, 330, 20, 26, 3);
  ctx.fill();

  ctx.fillStyle = '#8b91a6';
  rr(ctx, 262, 252, 16, 106, 3);
  ctx.fill();
  ctx.fillStyle = '#6f768c';
  rr(ctx, 250, 342, 40, 16, 3);
  ctx.fill();
  const dishAngle = v.has('dish') ? 0.5 : -0.35;
  ctx.save();
  ctx.translate(270, 245);
  ctx.rotate(dishAngle);
  ctx.fillStyle = '#e7e9ef';
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a9aec0';
  ctx.beginPath();
  ctx.ellipse(0, 4, 24, 9, 0, 0, Math.PI);
  ctx.fill();
  line(ctx, 0, 0, 0, 16, '#8b91a6', 3);
  ctx.fillStyle = '#ff8a5c';
  circle(ctx, 0, -3, 3.4);
  ctx.fill();
  ctx.restore();

  const panel = (x, y, tilt) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.fillStyle = '#3b4f7a';
    rr(ctx, -34, -20, 68, 40, 3);
    ctx.fill();
    ctx.strokeStyle = '#7f9bd6';
    ctx.lineWidth = 1.6;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 22, -18);
      ctx.lineTo(i * 22, 18);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.lineTo(32, 0);
    ctx.stroke();
    ctx.fillStyle = '#9aa0b4';
    ctx.fillRect(-3, 18, 6, 18);
    ctx.restore();
  };
  panel(402, 356, -0.18);
  panel(478, 366, -0.18);
  if (!v.has('panel')) panel(440, 361, -0.18);

  const roverWheels = [
    [160, 528],
    [220, 528],
  ];
  if (!v.has('wheel')) roverWheels.push([190, 530]);
  for (const [x, y] of roverWheels) {
    ctx.fillStyle = '#4a4f63';
    circle(ctx, x, y, 13);
    ctx.fill();
    ctx.fillStyle = '#8b91a6';
    circle(ctx, x, y, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#c9ccd7';
  rr(ctx, 148, 486, 88, 34, 7);
  ctx.fill();
  ctx.fillStyle = '#8b91a6';
  rr(ctx, 148, 486, 88, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#3b4f7a';
  rr(ctx, 176, 496, 30, 16, 3);
  ctx.fill();
  line(ctx, 236, 492, 244, 462, '#8b91a6', 3);
  ctx.fillStyle = '#ff8a5c';
  circle(ctx, 244, 458, 4);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  circle(ctx, 156, 496, 3);
  ctx.fill();

  const visorColor = v.has('visor') ? '#ff9d5c' : '#7af0ff';
  ctx.save();
  ctx.translate(300, 462);
  ctx.fillStyle = '#e7e9ef';
  rr(ctx, -20, -8, 40, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#c9ccd7';
  rr(ctx, -12, 34, 10, 22, 4);
  ctx.fill();
  rr(ctx, 2, 34, 10, 22, 4);
  ctx.fill();
  rr(ctx, -24, 4, 10, 28, 5);
  ctx.fill();
  rr(ctx, 14, 4, 10, 28, 5);
  ctx.fill();
  ctx.fillStyle = visorColor;
  rr(ctx, -13, -24, 26, 20, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  rr(ctx, -8, -20, 6, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#e7e9ef';
  rr(ctx, -13, -30, 26, 8, 4);
  ctx.fill();
  ctx.restore();

  const flagRight = v.has('flag');
  ctx.fillStyle = '#8b91a6';
  rr(ctx, 432, 300, 5, 72, 2);
  ctx.fill();
  ctx.fillStyle = '#5f8fe0';
  ctx.beginPath();
  if (flagRight) {
    ctx.moveTo(437, 302);
    ctx.lineTo(482, 316);
    ctx.lineTo(437, 332);
  } else {
    ctx.moveTo(432, 302);
    ctx.lineTo(387, 316);
    ctx.lineTo(432, 332);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  if (flagRight) {
    ctx.moveTo(437, 306);
    ctx.lineTo(462, 314);
    ctx.lineTo(437, 320);
  } else {
    ctx.moveTo(432, 306);
    ctx.lineTo(407, 314);
    ctx.lineTo(432, 320);
  }
  ctx.closePath();
  ctx.fill();

  if (v.has('crater')) {
    ctx.fillStyle = '#a9adba';
    ellipse(ctx, 245, 548, 34, 15);
    ctx.fill();
    ctx.fillStyle = '#8f94a6';
    ellipse(ctx, 245, 548, 24, 9);
    ctx.fill();
    ctx.fillStyle = '#c9ccd7';
    ellipse(ctx, 245, 542, 24, 6);
    ctx.fill();
  }

  ctx.fillStyle = '#8f94a6';
  ellipse(ctx, 480, 516, 20, 8);
  ctx.fill();
  const rockX = v.has('rock') ? 505 : 485;
  ctx.fillStyle = '#9aa0b4';
  ctx.beginPath();
  ctx.moveTo(rockX - 16, 510);
  ctx.lineTo(rockX - 9, 490);
  ctx.lineTo(rockX + 6, 486);
  ctx.lineTo(rockX + 16, 502);
  ctx.lineTo(rockX + 12, 512);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(rockX - 9, 490);
  ctx.lineTo(rockX + 6, 486);
  ctx.lineTo(rockX + 2, 496);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3b4f7a';
  rr(ctx, 48, 390, 44, 26, 4);
  ctx.fill();
  ctx.fillStyle = '#9aa0b4';
  rr(ctx, 44, 382, 52, 10, 4);
  ctx.fill();
  ctx.fillStyle = '#57b86b';
  line(ctx, 70, 384, 62, 358, '#57b86b', 4);
  line(ctx, 70, 384, 78, 360, '#57b86b', 4);
  ellipse(ctx, 60, 356, 8, 5);
  ctx.fill();
  ellipse(ctx, 80, 358, 8, 5);
  ctx.fill();
  if (v.has('plant')) {
    line(ctx, 70, 384, 70, 350, '#57b86b', 4);
    ctx.fillStyle = '#7ad88f';
    ellipse(ctx, 70, 346, 9, 6);
    ctx.fill();
  }

  ctx.fillStyle = '#8f94a6';
  rr(ctx, 374, 434, 4, 30, 2);
  ctx.fill();
  ctx.save();
  if (v.has('sign')) {
    ctx.translate(752, 0);
    ctx.scale(-1, 1);
  }
  ctx.fillStyle = '#d8dae2';
  rr(ctx, 348, 414, 56, 24, 4);
  ctx.fill();
  ctx.strokeStyle = '#9aa0b4';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2a2d40';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MOON', 376, 423);
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.fillText('BASE', 376, 433);
  ctx.restore();

  const padColor = v.has('padlight') ? '#ff6b6b' : '#6ff0c9';
  const padHalo = v.has('padlight') ? 'rgba(255,107,107,0.55)' : 'rgba(111,240,201,0.45)';
  glow(ctx, 500, 560, 34, padHalo);
  ctx.fillStyle = padColor;
  circle(ctx, 500, 560, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  circle(ctx, 497, 557, 3);
  ctx.fill();
  ctx.fillStyle = '#8f94a6';
  rr(ctx, 492, 568, 16, 14, 3);
  ctx.fill();
}

const PAINTERS = { park, market, moon };

/** Paint one panel of a level: every id in `variants` is drawn the altered way. */
export function drawScene(ctx, levelId, variants) {
  const painter = PAINTERS[levelId];
  if (!painter) return;
  ctx.save();
  painter(ctx, variants);
  ctx.restore();
}
