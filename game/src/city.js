// City generation for Solmar Heat.
// Builds a deterministic top-down city from a seed: a road grid, building
// blocks, a downtown core, a mansion estate in the north-east, docks in the
// south-west, a park, and the mission markers. Nothing here is random at
// run time; every placement comes from the seeded RNG.
import { makeRng } from './rng.js';
import { WORLD_W, WORLD_H, SEED, COLORS } from './data.js';

const ROAD_W = 64;
const BLOCK = 300;

export function buildCity(seed) {
  const rng = makeRng(seed);
  const roadsV = [];
  const roadsH = [];
  for (let x = 200; x < WORLD_W - 100; x += BLOCK) roadsV.push(x);
  for (let y = 200; y < WORLD_H - 100; y += 250) roadsH.push(y);

  const downtown = { x0: 800, y0: 500, x1: 1600, y1: 1100 };
  const mansion = { x0: 1880, y0: 140, x1: 2320, y1: 520 };
  const docks = { x0: 150, y0: 1280, x1: 560, y1: 1680 };
  const park = { x0: 1150, y0: 1250, x1: 1650, y1: 1620 };

  const buildings = [];
  const isDowntown = (cx, cy) => cx > downtown.x0 && cx < downtown.x1 && cy > downtown.y0 && cy < downtown.y1;
  const inRect = (cx, cy, r) => cx > r.x0 && cx < r.x1 && cy > r.y0 && cy < r.y1;

  for (let ix = 0; ix < roadsV.length - 1; ix++) {
    for (let iy = 0; iy < roadsH.length - 1; iy++) {
      const bx0 = roadsV[ix] + ROAD_W / 2 + 14;
      const by0 = roadsH[iy] + ROAD_W / 2 + 14;
      const bx1 = roadsV[ix + 1] - ROAD_W / 2 - 14;
      const by1 = roadsH[iy + 1] - ROAD_W / 2 - 14;
      const cx = (bx0 + bx1) / 2;
      const cy = (by0 + by1) / 2;
      if (inRect(cx, cy, mansion) || inRect(cx, cy, docks) || inRect(cx, cy, park)) continue;
      const n = isDowntown(cx, cy) ? rng.int(2, 3) : rng.int(1, 2);
      for (let k = 0; k < n; k++) {
        const w = rng.range(70, Math.min(150, bx1 - bx0 - 20));
        const h = rng.range(60, Math.min(130, by1 - by0 - 20));
        const x = rng.range(bx0, Math.max(bx0 + 1, bx1 - w));
        const y = rng.range(by0, Math.max(by0 + 1, by1 - h));
        buildings.push({
          x, y, w, h,
          color: isDowntown(cx, cy) ? COLORS.buildingDowntown : COLORS.buildingHouse,
          tall: isDowntown(cx, cy),
        });
      }
    }
  }

  // The mansion itself: one big house with a walled garden and a driveway.
  buildings.push({
    x: mansion.x0 + 90, y: mansion.y0 + 60, w: 240, h: 170,
    color: COLORS.buildingMansion, tall: false, mansion: true,
  });

  // Parked cars along the roads, placed by the seeded RNG.
  const parked = [];
  const spots = [
    [350, 250], [650, 250], [950, 250], [1250, 250], [1550, 250], [1850, 250],
    [350, 500], [950, 500], [1550, 500], [2050, 500],
    [350, 750], [650, 750], [1250, 750], [1850, 750],
    [350, 1000], [950, 1000], [1550, 1000], [2050, 1000],
    [650, 1250], [1250, 1250], [1850, 1250],
    [350, 1500], [950, 1500], [1550, 1500],
  ];
  for (const [sx, sy] of spots) {
    if (!rng.chance(0.72)) continue;
    const px = sx + rng.range(-8, 8);
    const py = sy + rng.range(-8, 8);
    if (pointInBuilding({ buildings }, px, py)) continue;
    parked.push({
      x: px,
      y: py,
      angle: rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]),
      color: rng.pick(COLORS.carColors),
    });
  }
  // One guaranteed stealable car on the curb right beside the player start.
  parked.push({ x: 236, y: 320, angle: Math.PI / 2, color: '#c0392b' });

  // Traffic spawn points: on the roads, spread across the map.
  const trafficSpawns = [];
  for (const x of roadsV) {
    for (const y of roadsH) {
      if (rng.chance(0.5)) {
        trafficSpawns.push({ x: x + rng.range(-20, 20), y: y + rng.range(-20, 20), vertical: rng.chance(0.5) });
      }
    }
  }

  return {
    seed,
    roadsV,
    roadsH,
    roadW: ROAD_W,
    buildings,
    downtown,
    mansion,
    docks,
    park,
    parked,
    trafficSpawns,
    playerStart: { x: 200, y: 320 },
    downtownMarker: { x: 1200, y: 700 },
    docksMarker: { x: 350, y: 1480 },
    mansionGate: { x: 2100, y: 560 },
    bossSpot: { x: 2100, y: 430 },
  };
}

export function pointInBuilding(city, x, y) {
  for (const b of city.buildings) {
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return b;
  }
  return null;
}

export function onRoad(city, x, y) {
  const half = city.roadW / 2;
  for (const rx of city.roadsV) if (Math.abs(x - rx) < half) return true;
  for (const ry of city.roadsH) if (Math.abs(y - ry) < half) return true;
  return false;
}
