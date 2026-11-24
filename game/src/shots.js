// Deterministic screenshot scenes for Solmar Heat.
// The game reads ?shot=1|2|3 from the URL and builds that exact scene,
// so the three screenshots are reproducible from the fixed seed.
//   1 — title screen: the player on foot beside a parked car, city behind.
//   2 — play: driving downtown, wanted level 2, two police cars in pursuit,
//       mission 1 (Downtown Run) live.
//   3 — end: the final-mission shootout at the mansion, boss Rico Vane present.
import { makeCar } from './entities.js';
import { startMission, spawnMansionCrew } from './missions.js';

export function setupShot(state, n) {
  state.time = 1.0;
  state.bannerTimer = 0;
  if (n === 1) {
    state.phase = 'title';
    state.player.x = state.city.playerStart.x;
    state.player.y = state.city.playerStart.y;
    state.player.angle = Math.PI / 2;
    state.player.onFoot = true;
    state.player.car = null;
    return;
  }
  if (n === 2) {
    state.phase = 'playing';
    startMission(state, 1);
    const car = makeCar(1200, 800, 0, '#c0392b', 'player');
    car.speed = 300;
    state.cars.push(car);
    state.player.car = car;
    state.player.onFoot = false;
    state.player.x = 1200;
    state.player.y = 800;
    state.player.angle = 0;
    state.player.wanted = 2;
    state.player.money = 200;
    state.player.ammo = 28;
    const p1 = makeCar(1080, 760, 0, '#1a3a8a', 'police');
    p1.speed = 320;
    const p2 = makeCar(1120, 900, -0.4, '#1a3a8a', 'police');
    p2.speed = 320;
    state.cars.push(p1, p2);
    return;
  }
  if (n === 3) {
    state.phase = 'playing';
    startMission(state, 4);
    state.player.x = 2050;
    state.player.y = 480;
    state.player.angle = -Math.PI / 2;
    state.player.onFoot = true;
    state.player.car = null;
    state.player.wanted = 4;
    state.player.money = 1900;
    state.player.ammo = 22;
    state.player.health = 82;
    spawnMansionCrew(state);
    state.bullets.push(
      { x: 2060, y: 560, vx: 0, vy: -640, from: 'player', damage: 34, life: 0.9 },
      { x: 2090, y: 520, vx: -120, vy: 620, from: 'enemy', damage: 34, life: 0.9 },
    );
    return;
  }
}
