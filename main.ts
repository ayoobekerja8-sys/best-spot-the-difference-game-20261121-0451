// Twin Lanterns: Spot the Difference — the hand-in program.
//
// Node 22, standard library only. The game is this repository's game/ folder: plain static files a
// desktop browser opens offline, with no build step, no library and no network request. This program
// copies game/ and screenshots/ to the output directory (/output, or $MAKEFUN_OUTPUT_DIR locally)
// and writes dossier.json — the summary the judge reads — with the vendored make.fun library. Two
// runs over the same repository write the same bytes: the copy is recursive and in a fixed order,
// and buildDossier is deterministic.
//
//   node serve.ts                      # play it at http://localhost:8080
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(output, { recursive: true });
cpSync(join(here, 'game'), join(output, 'game'), { recursive: true });

const shotsFrom = join(here, 'screenshots');
mkdirSync(join(output, 'screenshots'), { recursive: true });
if (existsSync(shotsFrom)) cpSync(shotsFrom, join(output, 'screenshots'), { recursive: true });

// The caps are the scorer's own (reference/gate.json): only text_max_bytes shapes the bytes, and the
// rest refuse here what the scorer would refuse, so a broken hand-in fails locally first.
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(output, 'dossier.json'), dossier);
