[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/zargaan/solmar-heat-v2/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/zargaan/solmar-heat-v2/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

# Solmar Heat

A top-down 2D open-world crime game in the spirit of GTA 6, built from
scratch in plain HTML + JavaScript (ES modules, canvas, no libraries).
You are a small-time hustler in the city of Solmar: walk the streets,
steal a car, outrun the police, run five missions, and take down the
crime boss Rico Vane at his mansion.

## How to play

Open `game/index.html` in a desktop browser (or serve the `game/` folder
over HTTP and open it). No network, no build step.

- **WASD / arrow keys** — move on foot, or drive (W accelerate, S brake,
  A/D steer) when in a car.
- **E** — steal a nearby parked car, or get out of the car you are driving.
- **Click / Space** — shoot toward the mouse / facing direction (uses ammo).
- **Enter** — start the game, or play again after winning or getting wasted.

## The game

- A deterministic city (fixed seed): a road grid, downtown towers, a
  mansion estate in the north-east, docks in the south-west, a park.
- Traffic cars, parked cars you can steal, and police cars that chase you
  when your wanted level rises.
- Wanted level (0–5 stars): stealing a car raises it; laying low lowers
  it. More stars means more police.
- Five missions: steal a car, drive downtown, lose the heat, pick up the
  package at the docks, then storm the mansion and defeat Rico Vane.
- HUD: money, wanted stars, ammo, health, current mission, and a minimap.
- A title screen, a win screen, and a game-over screen.

## Screenshots

The three screenshots in `screenshots/` are deterministic renders of the
game's own code, taken in a browser:

1. `1-start.jpg` — title screen, player on foot beside a parked car.
2. `2-play.jpg` — driving downtown, wanted level 2, two police cars in
   pursuit, mission 1 live.
3. `3-end.jpg` — the final-mission shootout at the mansion, Rico Vane
   present.

Load `game/index.html?shot=1`, `?shot=2`, or `?shot=3` to render each
scene exactly.

## Handing the game in

`main.ts` (Node 22, stdlib only) copies `game/` and `screenshots/` (plus
`LICENSE`) to the output directory and writes `dossier.json` there with
`buildDossier` from `vendor/makefun-game.ts` (the kit's copy, unchanged):

```
node main.ts
```

Outside the grader, set `MAKEFUN_OUTPUT_DIR` to choose the output
directory. `dossier.json` is byte for byte what `buildDossier` writes.

## License

MIT. See `LICENSE`.
