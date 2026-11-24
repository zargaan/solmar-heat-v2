// Solmar Heat — entry point and game loop.
// Boots the canvas, builds the city from the fixed seed, runs the loop,
// and handles phase changes (title, playing, won, game over).
// With ?shot=1|2|3 in the URL it renders one deterministic screenshot
// scene instead of starting the loop.
import { buildCity } from './city.js';
import { makePlayer, makeCar, updatePlayerOnFoot, updateDriving, updateTraffic, updatePolice, updateBullets, updateEnemies, nearestParkedCar, stealCar, exitCar } from './entities.js';
import { makeRng } from './rng.js';
import { SEED, VIEW_W, VIEW_H, PLAYER_START_AMMO } from './data.js';
import { startMission, updateMissions, updateWanted, missionMarker } from './missions.js';
import { drawWorld, drawHud, drawTitle, drawEnd, cameraFor } from './render.js';
import { createInput } from './input.js';
import { setupShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export function createState() {
  const city = buildCity(SEED);
  const rng = makeRng(SEED + 7);
  const player = makePlayer(city.playerStart.x, city.playerStart.y);
  const cars = [];
  for (const p of city.parked) {
    cars.push(makeCar(p.x, p.y, p.angle, p.color, 'parked'));
  }
  for (const s of city.trafficSpawns.slice(0, 14)) {
    const c = makeCar(s.x, s.y, s.vertical ? Math.PI / 2 : 0, rng.pick(['#c0392b', '#2980b9', '#f39c12', '#8e44ad', '#16a085', '#e67e22', '#ecf0f1']), 'traffic');
    c.speed = 140;
    cars.push(c);
  }
  const state = {
    city,
    rng,
    player,
    cars,
    bullets: [],
    enemies: [],
    missionIndex: 0,
    missionDone: false,
    missionTimer: 0,
    banner: '',
    bannerTimer: 0,
    marker: null,
    phase: 'title',
    time: 0,
  };
  startMission(state, 0);
  state.marker = missionMarker(state);
  return state;
}

const state = createState();
// Debug handle for automated play-testing (read-only state probe).
window.__solmar = state;
const input = createInput(canvas);

function update(dt) {
  state.time += dt;
  state.bannerTimer = Math.max(0, state.bannerTimer - dt);
  if (state.phase !== 'playing') return;
  const p = state.player;
  if (input.pressed('KeyE')) {
    if (p.onFoot) {
      const car = nearestParkedCar(state, 46);
      if (car) stealCar(state, car);
    } else {
      exitCar(state);
    }
  }
  if (p.onFoot) updatePlayerOnFoot(state, input, dt);
  else updateDriving(state, input, dt);
  updateTraffic(state, dt);
  updatePolice(state, dt);
  updateBullets(state, dt);
  updateEnemies(state, dt);
  updateMissions(state, dt);
  updateWanted(state, dt);
  state.marker = missionMarker(state);
  if (p.dead) state.phase = 'gameover';
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.phase === 'title') {
    drawTitle(ctx, state);
    return;
  }
  if (state.phase === 'won' || state.phase === 'gameover') {
    const cam = cameraFor(state);
    drawWorld(ctx, state, cam);
    drawHud(ctx, state);
    drawEnd(ctx, state, state.phase === 'won');
    return;
  }
  const cam = cameraFor(state);
  drawWorld(ctx, state, cam);
  drawHud(ctx, state);
}

let last = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
  last = t;
  if (input.pressed('Enter')) {
    if (state.phase === 'title') state.phase = 'playing';
    else if (state.phase === 'won' || state.phase === 'gameover') {
      const fresh = createState();
      Object.assign(state, fresh);
      state.phase = 'playing';
    }
  }
  update(dt);
  render();
  requestAnimationFrame(loop);
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  setupShot(state, Number(shot));
  state.marker = missionMarker(state);
  render();
} else {
  requestAnimationFrame(loop);
}
