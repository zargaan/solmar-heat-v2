// Entities and their per-frame updates: the player (on foot and driving),
// cars (parked, traffic, police), bullets, and mission-4 enemies.
// Physics is simple arcade: no external engine, everything is plain math.
import { PLAYER_SPEED, PLAYER_RADIUS, CAR_TOP_SPEED, CAR_ACCEL, CAR_BRAKE, CAR_TURN, CAR_LENGTH, CAR_WIDTH, BULLET_SPEED, BULLET_RADIUS, BULLET_DAMAGE, WORLD_W, WORLD_H } from './data.js';
import { pointInBuilding } from './city.js';

export function makePlayer(x, y) {
  return {
    x, y, angle: -Math.PI / 2, speed: 0,
    health: 100, ammo: 30, money: 0, wanted: 0,
    onFoot: true, car: null, shootCooldown: 0,
    wantedTimer: 0, dead: false,
  };
}

export function makeCar(x, y, angle, color, kind) {
  return {
    x, y, angle, speed: 0, color, kind,
    length: CAR_LENGTH, width: CAR_WIDTH,
    targetSpeed: 0, turnTarget: 0,
  };
}

export function clampToWorld(e, r) {
  e.x = Math.max(r, Math.min(WORLD_W - r, e.x));
  e.y = Math.max(r, Math.min(WORLD_H - r, e.y));
}

function tryMove(city, e, nx, ny, r) {
  if (pointInBuilding(city, nx, e.y)) nx = e.x;
  if (pointInBuilding(city, e.x, ny)) ny = e.y;
  if (pointInBuilding(city, nx, ny)) { nx = e.x; ny = e.y; }
  e.x = nx;
  e.y = ny;
  clampToWorld(e, r);
}

export function updatePlayerOnFoot(state, input, dt) {
  const p = state.player;
  const a = input.axis();
  const len = Math.hypot(a.x, a.y) || 1;
  const nx = p.x + (a.x / len) * PLAYER_SPEED * dt * (a.x || a.y ? 1 : 0);
  const ny = p.y + (a.y / len) * PLAYER_SPEED * dt * (a.x || a.y ? 1 : 0);
  if (a.x || a.y) {
    p.angle = Math.atan2(a.y, a.x);
    tryMove(state.city, p, nx, ny, PLAYER_RADIUS);
  }
  p.shootCooldown = Math.max(0, p.shootCooldown - dt);
  if ((input.mouse.clicked || input.down('Space')) && p.ammo > 0 && p.shootCooldown <= 0) {
    input.consumeClick();
    fireBullet(state, p.x, p.y, p.angle, 'player');
    p.ammo -= 1;
    p.shootCooldown = 0.22;
  } else {
    input.consumeClick();
  }
}

export function fireBullet(state, x, y, angle, from) {
  state.bullets.push({
    x: x + Math.cos(angle) * 16,
    y: y + Math.sin(angle) * 16,
    vx: Math.cos(angle) * BULLET_SPEED,
    vy: Math.sin(angle) * BULLET_SPEED,
    from,
    damage: BULLET_DAMAGE,
    life: 1.1,
  });
}

export function nearestParkedCar(state, maxDist) {
  const p = state.player;
  let best = null;
  let bestD = maxDist;
  for (const c of state.cars) {
    if (c.kind !== 'parked') continue;
    const d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

export function stealCar(state, car) {
  const p = state.player;
  car.kind = 'player';
  p.car = car;
  p.onFoot = false;
  p.x = car.x;
  p.y = car.y;
  p.angle = car.angle;
  raiseWanted(state, 1);
}

export function exitCar(state) {
  const p = state.player;
  if (!p.car) return;
  p.car.kind = 'parked';
  p.car.speed = 0;
  p.x = p.car.x + Math.cos(p.car.angle + Math.PI / 2) * 26;
  p.y = p.car.y + Math.sin(p.car.angle + Math.PI / 2) * 26;
  p.angle = p.car.angle;
  p.car = null;
  p.onFoot = true;
}

export function raiseWanted(state, n) {
  const p = state.player;
  p.wanted = Math.min(5, p.wanted + n);
  p.wantedTimer = 0;
}

export function updateDriving(state, input, dt) {
  const p = state.player;
  const car = p.car;
  if (!car) return;
  const a = input.axis();
  if (a.y < 0) car.speed += CAR_ACCEL * dt;
  else if (a.y > 0) car.speed -= CAR_BRAKE * dt;
  else car.speed *= Math.pow(0.35, dt);
  if (car.speed > CAR_TOP_SPEED) car.speed = CAR_TOP_SPEED;
  if (car.speed < -120) car.speed = -120;
  const steer = a.x * CAR_TURN * dt * (car.speed >= 0 ? 1 : -1) * Math.min(1, Math.abs(car.speed) / 90);
  car.angle += steer;
  const nx = car.x + Math.cos(car.angle) * car.speed * dt;
  const ny = car.y + Math.sin(car.angle) * car.speed * dt;
  const before = { x: car.x, y: car.y };
  tryMove(state.city, car, nx, ny, 12);
  if (Math.hypot(car.x - before.x, car.y - before.y) < 0.5 && Math.abs(car.speed) > 60) {
    car.speed *= 0.4;
  }
  p.x = car.x;
  p.y = car.y;
  p.angle = car.angle;
  p.shootCooldown = Math.max(0, p.shootCooldown - dt);
  if (input.mouse.clicked && p.ammo > 0 && p.shootCooldown <= 0) {
    input.consumeClick();
    fireBullet(state, p.x, p.y, p.angle, 'player');
    p.ammo -= 1;
    p.shootCooldown = 0.25;
  } else {
    input.consumeClick();
  }
}

export function updateTraffic(state, dt) {
  for (const c of state.cars) {
    if (c.kind !== 'traffic') continue;
    c.speed += (150 - c.speed) * Math.min(1, dt * 0.8);
    const nx = c.x + Math.cos(c.angle) * c.speed * dt;
    const ny = c.y + Math.sin(c.angle) * c.speed * dt;
    if (pointInBuilding(state.city, nx, ny)) {
      c.angle += Math.PI / 2;
      continue;
    }
    c.x = nx;
    c.y = ny;
    clampToWorld(c, 14);
    if (c.x <= 16 || c.x >= WORLD_W - 16 || c.y <= 16 || c.y >= WORLD_H - 16) {
      c.angle += Math.PI;
    }
  }
}

export function updatePolice(state, dt) {
  const p = state.player;
  for (const c of state.cars) {
    if (c.kind !== 'police') continue;
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const dist = Math.hypot(dx, dy) || 1;
    const want = Math.atan2(dy, dx);
    let diff = want - c.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    c.angle += Math.max(-2.4 * dt, Math.min(2.4 * dt, diff));
    const target = dist > 700 ? CAR_TOP_SPEED : 330;
    c.speed += (target - c.speed) * Math.min(1, dt * 1.2);
    const nx = c.x + Math.cos(c.angle) * c.speed * dt;
    const ny = c.y + Math.sin(c.angle) * c.speed * dt;
    if (!pointInBuilding(state.city, nx, ny)) {
      c.x = nx;
      c.y = ny;
    } else {
      c.angle += Math.PI / 3;
    }
    clampToWorld(c, 14);
    if (dist < 30) {
      if (p.onFoot) {
        p.health -= 18 * dt;
      } else if (p.car) {
        p.car.speed *= Math.pow(0.5, dt);
        p.health -= 6 * dt;
      }
      if (p.health <= 0) {
        p.health = 0;
        p.dead = true;
      }
    }
  }
}

export function updateBullets(state, dt) {
  const p = state.player;
  for (const b of state.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (pointInBuilding(state.city, b.x, b.y)) b.life = 0;
    if (b.from === 'player') {
      for (const e of state.enemies) {
        if (e.health > 0 && Math.hypot(e.x - b.x, e.y - b.y) < 14) {
          e.health -= b.damage;
          b.life = 0;
          if (e.health <= 0) state.player.money += e.bounty;
        }
      }
      for (const c of state.cars) {
        if (c.kind === 'police' && Math.hypot(c.x - b.x, c.y - b.y) < 18) {
          b.life = 0;
          raiseWanted(state, 1);
        }
      }
    } else if (b.from === 'enemy') {
      if (Math.hypot(p.x - b.x, p.y - b.y) < 12) {
        p.health -= b.damage;
        b.life = 0;
        if (p.health <= 0) {
          p.health = 0;
          p.dead = true;
        }
      }
    }
  }
  state.bullets = state.bullets.filter((b) => b.life > 0 && b.x > 0 && b.x < WORLD_W && b.y > 0 && b.y < WORLD_H);
}

export function updateEnemies(state, dt) {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.health <= 0) continue;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    e.angle = Math.atan2(dy, dx);
    if (dist > 260) {
      const nx = e.x + (dx / dist) * 95 * dt;
      const ny = e.y + (dy / dist) * 95 * dt;
      if (!pointInBuilding(state.city, nx, ny)) {
        e.x = nx;
        e.y = ny;
      }
    }
    e.cooldown -= dt;
    if (dist < 420 && e.cooldown <= 0) {
      fireBullet(state, e.x, e.y, e.angle, 'enemy');
      e.cooldown = e.boss ? 0.9 : 1.5;
    }
  }
}

export function spawnPolice(state, count) {
  const p = state.player;
  const existing = state.cars.filter((c) => c.kind === 'police').length;
  for (let i = existing; i < count; i++) {
    const a = state.rng.range(0, Math.PI * 2);
    const d = state.rng.range(320, 480);
    const x = Math.max(40, Math.min(WORLD_W - 40, p.x + Math.cos(a) * d));
    const y = Math.max(40, Math.min(WORLD_H - 40, p.y + Math.sin(a) * d));
    state.cars.push(makeCar(x, y, 0, '#1a3a8a', 'police'));
  }
  state.cars = state.cars.filter((c) => c.kind !== 'police' || state.cars.filter((o) => o.kind === 'police').indexOf(c) < count);
}
