# Twin Lanterns: Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ayoobekerja8-sys/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ayoobekerja8-sys/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Lanterns is an original spot-the-difference game that runs in desktop Chrome from plain static
files, with no build step, no library and no network request. Two near-identical scenes sit side by
side — the left one is the original, the right one hides small changes — and both are painted in code
with Canvas 2D: a sunny park with a pond and ducks, a lantern-lit night market, and a quiet moon base.
Each of the three levels has its own count of differences and its own clock (7 in 120 seconds, 10 in
150, 12 in 180), rising in difficulty from a missing apple to a flipped flag and a turned antenna dish.
Clicking a difference on either picture marks it with a pop-in gold ring and a short WebAudio chime and
adds 100 points; a wrong click shakes the panel, flashes red and costs 25 points; a hint (three a level)
pulses the area of one difference still hidden. Clearing a level pays a time bonus and up to three
stars, and a clean sweep with no hints or misses pays more. Everything — art, sound, levels, names — is
original and made for this game.

## How to play

Serve the game folder and open it in a desktop browser:

```sh
node serve.ts          # http://localhost:8080
```

Then:

- **Click** a difference on **either** picture. A gold ring marks it and a chime rings; the HUD reads
  "Found X of Y — Z remaining".
- **H** gives a hint (3 per level): the area of one unfound difference pulses for a moment.
- **P** pauses (the clock stops), **R** restarts the level, **N** goes to the next level on the win
  card, **Space** starts the game.
- Finish before the clock runs out for stars: three when half the time is left, two when a fifth is,
  one otherwise.

## Layout

```
game/index.html      page shell: two canvases, HUD, overlays
game/src/main.js     bootstrap, query params, keyboard, the one frame loop
game/src/scenes.js   the three scenes, painted in code
game/src/differences.js  each level's difference list and its variant
game/src/render.js   both panels, markers, hint pulse, wrong-click feedback
game/src/input.js    click mapping and hit-testing
game/src/timer.js    countdown clock and timer bar
game/src/audio.js    WebAudio chimes, no files
game/src/ui.js       HUD, level cards, win / game-over / pause cards
game/src/levels.js   level progression, scoring, stars
main.ts              hand-in: copies game/ and screenshots/, writes dossier.json
serve.ts             a tiny static server for local play
```

## Screenshot staging

For screenshots the game can be opened at a real state of itself: `?level=1&found=3` starts level 1
with the first three differences already marked, and `?level=1&found=all` marks every one and shows the
win card. The counters and markers are the game's own.

## Hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `game/` and `screenshots/` into the output directory and writes `dossier.json` with
`vendor/makefun-game.ts`. Two runs write identical bytes.

MIT licensed.
