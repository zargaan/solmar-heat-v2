// Canvas rendering for Solmar Heat.
// Draws the city (roads, buildings, districts), cars, the player, enemies,
// bullets, the mission marker, the HUD (money, wanted stars, ammo, health,
// mission text), a minimap, and the title / win / game-over screens.
import { VIEW_W, VIEW_H, COLORS, MISSIONS, GAME_TITLE, GAME_SUBTITLE } from './data.js';

export function cameraFor(state) {
  const p = state.player;
  let x = p.x - VIEW_W / 2;
  let y = p.y - VIEW_H / 2;
  x = Math.max(0, Math.min(2400 - VIEW_W, x));
  y = Math.max(0, Math.min(1800 - VIEW_H, y));
  return { x, y };
}

function drawCarShape(ctx, x, y, angle, length, width, color, isPolice) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#111111';
  ctx.fillRect(-length / 2 - 2, -width / 2 - 2, length + 4, width + 4);
  ctx.fillStyle = color;
  ctx.fillRect(-length / 2, -width / 2, length, width);
  ctx.fillStyle = 'rgba(180, 220, 255, 0.85)';
  ctx.fillRect(length * 0.08, -width / 2 + 2, length * 0.2, width - 4);
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(-length / 2 + 2, -width / 2 - 2, 6, 4);
  ctx.fillRect(-length / 2 + 2, width / 2 - 2, 6, 4);
  ctx.fillRect(length / 2 - 8, -width / 2 - 2, 6, 4);
  ctx.fillRect(length / 2 - 8, width / 2 - 2, 6, 4);
  if (isPolice) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -width / 2, 8, width);
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(-length / 2 + 4, -3, 7, 6);
    ctx.fillStyle = '#2266ff';
    ctx.fillRect(length / 2 - 11, -3, 7, 6);
  }
  ctx.restore();
}

function drawPerson(ctx, x, y, angle, color, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(radius - 2, -3, 7, 6);
  ctx.restore();
}

export function drawWorld(ctx, state, cam) {
  const city = state.city;
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  // Park and docks ground.
  ctx.fillStyle = COLORS.park;
  ctx.fillRect(city.park.x0, city.park.y0, city.park.x1 - city.park.x0, city.park.y1 - city.park.y0);
  ctx.fillStyle = '#5a4a33';
  ctx.fillRect(city.docks.x0, city.docks.y0, city.docks.x1 - city.docks.x0, city.docks.y1 - city.docks.y0);
  ctx.fillStyle = COLORS.water;
  ctx.fillRect(city.docks.x0, city.docks.y1 - 60, city.docks.x1 - city.docks.x0, 60);
  // Roads.
  ctx.fillStyle = COLORS.road;
  for (const x of city.roadsV) ctx.fillRect(x - city.roadW / 2, 0, city.roadW, 1800);
  for (const y of city.roadsH) ctx.fillRect(0, y - city.roadW / 2, 2400, city.roadW);
  // Road centre dashes.
  ctx.fillStyle = COLORS.roadLine;
  for (const x of city.roadsV) {
    for (let y = 20; y < 1800; y += 56) ctx.fillRect(x - 2, y, 4, 26);
  }
  for (const y of city.roadsH) {
    for (let x = 20; x < 2400; x += 56) ctx.fillRect(x, y - 2, 26, 4);
  }
  // Mansion grounds.
  ctx.fillStyle = '#7a9a4d';
  ctx.fillRect(city.mansion.x0, city.mansion.y0, city.mansion.x1 - city.mansion.x0, city.mansion.y1 - city.mansion.y0);
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(city.mansion.x0 + 120, city.mansion.y1 - 40, 180, 40);
  // Buildings.
  for (const b of city.buildings) {
    ctx.fillStyle = '#1c1c20';
    ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = COLORS.buildingRoof;
    ctx.fillRect(b.x + 6, b.y + 6, b.w - 12, b.h - 12);
    if (b.tall) {
      ctx.fillStyle = 'rgba(255, 240, 160, 0.75)';
      for (let wx = b.x + 12; wx < b.x + b.w - 10; wx += 22) {
        for (let wy = b.y + 12; wy < b.y + b.h - 10; wy += 24) {
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
    if (b.mansion) {
      ctx.fillStyle = '#e8d27a';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VANE MANSION', b.x + b.w / 2, b.y + b.h / 2 + 5);
    }
  }
  // Mission marker.
  const mk = state.marker;
  if (mk && state.phase === 'playing') {
    const bob = Math.sin(state.time * 3) * 5;
    ctx.fillStyle = COLORS.marker;
    ctx.beginPath();
    ctx.arc(mk.x, mk.y + bob - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(mk.x - 8, mk.y + bob - 10);
    ctx.lineTo(mk.x + 8, mk.y + bob - 10);
    ctx.lineTo(mk.x, mk.y + bob + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 71, 87, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mk.x, mk.y, 26 + Math.sin(state.time * 3) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Cars.
  for (const c of state.cars) {
    drawCarShape(ctx, c.x, c.y, c.angle, c.length, c.width, c.color, c.kind === 'police');
  }
  // Enemies.
  for (const e of state.enemies) {
    if (e.health <= 0) continue;
    drawPerson(ctx, e.x, e.y, e.angle, e.boss ? COLORS.boss : COLORS.enemy, e.boss ? 13 : 10);
    if (e.boss) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RICO VANE', e.x, e.y - 20);
      ctx.fillStyle = '#330000';
      ctx.fillRect(e.x - 22, e.y - 16, 44, 5);
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(e.x - 22, e.y - 16, 44 * Math.max(0, e.health / 320), 5);
    }
  }
  // Bullets.
  ctx.fillStyle = COLORS.bullet;
  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Player.
  const p = state.player;
  if (p.onFoot) drawPerson(ctx, p.x, p.y, p.angle, COLORS.player, 10);
  ctx.restore();
}

export function drawHud(ctx, state) {
  const p = state.player;
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(10, 10, 300, 86);
  ctx.fillStyle = COLORS.hudMoney;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('$' + p.money.toLocaleString('en-US'), 22, 38);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '16px sans-serif';
  ctx.fillText('Ammo ' + p.ammo + '   HP ' + Math.ceil(p.health), 22, 62);
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < p.wanted ? '★' : '☆';
  ctx.fillStyle = COLORS.star;
  ctx.font = '20px sans-serif';
  ctx.fillText(stars, 22, 86);
  const m = MISSIONS[state.missionIndex];
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(10, 104, 430, 44);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('MISSION ' + (state.missionIndex + 1) + '/5 — ' + m.name, 22, 123);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText(m.text, 22, 141);
  if (state.bannerTimer > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(VIEW_W / 2 - 220, 120, 440, 40);
    ctx.fillStyle = '#7dff6a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.banner, VIEW_W / 2, 146);
    ctx.textAlign = 'left';
  }
  if (p.onFoot) {
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '13px sans-serif';
    ctx.fillText('WASD move — E steal car — click / Space shoot', 22, VIEW_H - 16);
  } else {
    const kmh = Math.round(Math.abs(p.car.speed) / 420 * 64);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(kmh + ' km/h', VIEW_W - 120, VIEW_H - 16);
    ctx.font = '13px sans-serif';
    ctx.fillText('W accelerate — S brake — A/D steer — E exit', 22, VIEW_H - 16);
  }
  drawMinimap(ctx, state);
}

export function drawMinimap(ctx, state) {
  const w = 168;
  const h = 126;
  const x0 = VIEW_W - w - 12;
  const y0 = 12;
  const sx = w / 2400;
  const sy = h / 1800;
  ctx.fillStyle = 'rgba(8, 10, 8, 0.78)';
  ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = '#3a3a3f';
  for (const rx of state.city.roadsV) ctx.fillRect(x0 + rx * sx - 1, y0, 2, h);
  for (const ry of state.city.roadsH) ctx.fillRect(x0, y0 + ry * sy, w, 2);
  ctx.fillStyle = '#8a6d2f';
  ctx.fillRect(x0 + state.city.mansion.x0 * sx, y0 + state.city.mansion.y0 * sy, (state.city.mansion.x1 - state.city.mansion.x0) * sx, (state.city.mansion.y1 - state.city.mansion.y0) * sy);
  const mk = state.marker;
  if (mk) {
    ctx.fillStyle = COLORS.marker;
    ctx.beginPath();
    ctx.arc(x0 + mk.x * sx, y0 + mk.y * sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of state.cars) {
    if (c.kind === 'police') {
      ctx.fillStyle = '#4d7dff';
      ctx.fillRect(x0 + c.x * sx - 2, y0 + c.y * sy - 2, 4, 4);
    }
  }
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(x0 + state.player.x * sx, y0 + state.player.y * sy, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTitle(ctx, state) {
  drawWorld(ctx, state, { x: 0, y: 0 });
  ctx.fillStyle = 'rgba(5, 5, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(GAME_TITLE, VIEW_W / 2, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText(GAME_SUBTITLE, VIEW_W / 2, 236);
  ctx.fillStyle = '#7dff6a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Press ENTER to start', VIEW_W / 2, 320);
  ctx.fillStyle = '#cccccc';
  ctx.font = '15px sans-serif';
  ctx.fillText('WASD move — E steal a car — drive, evade the police, run 5 missions', VIEW_W / 2, 360);
  ctx.fillText('Take down Rico Vane at the mansion to win.', VIEW_W / 2, 384);
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, state, won) {
  ctx.fillStyle = 'rgba(5, 5, 10, 0.7)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = won ? '#7dff6a' : '#ff4757';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(won ? 'YOU WIN' : 'WASTED', VIEW_W / 2, 250);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText(won ? 'Rico Vane is down. Solmar is yours.' : 'The heat got you. Try again.', VIEW_W / 2, 292);
  ctx.fillStyle = COLORS.hudMoney;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Money earned: $' + state.player.money.toLocaleString('en-US'), VIEW_W / 2, 340);
  ctx.fillStyle = '#cccccc';
  ctx.font = '16px sans-serif';
  ctx.fillText('Press ENTER to play again', VIEW_W / 2, 390);
  ctx.textAlign = 'left';
}
