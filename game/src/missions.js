// Mission flow and the wanted system for Solmar Heat.
// Five missions in order; each completes on a concrete in-world condition
// and pays out, then the next one starts. The wanted level rises on crime
// and decays when the player lays low; police spawn to match it.
import { MISSIONS, BOSS_NAME, WANTED_DECAY_SECONDS } from './data.js';
import { makeCar, raiseWanted, spawnPolice } from './entities.js';

export function missionMarker(state) {
  const i = state.missionIndex;
  if (i === 1) return state.city.downtownMarker;
  if (i === 3) return state.city.docksMarker;
  if (i === 4) return state.city.bossSpot;
  return null;
}

export function startMission(state, index) {
  state.missionIndex = index;
  state.missionDone = false;
  state.missionTimer = 0;
  if (index === 4) {
    spawnMansionCrew(state);
  }
}

export function spawnMansionCrew(state) {
  const m = state.city.mansion;
  // Spots on the mansion grounds, clear of the house itself
  // (the house spans x 1970-2210, y 200-370): north, west, east, south.
  const spots = [
    [m.x0 + 120, m.y0 + 30], [m.x0 + 320, m.y0 + 30],
    [m.x0 + 40, m.y0 + 140], [m.x0 + 380, m.y0 + 140],
    [m.x0 + 120, m.y0 + 310], [m.x0 + 320, m.y0 + 310],
  ];
  state.enemies = [];
  for (const [x, y] of spots) {
    state.enemies.push({
      x, y, angle: 0, health: 68, cooldown: 1.2, boss: false, bounty: 50, speed: 95,
    });
  }
  state.enemies.push({
    x: state.city.bossSpot.x, y: state.city.bossSpot.y, angle: 0,
    health: 320, cooldown: 1.0, boss: true, bounty: 500, speed: 80, name: BOSS_NAME,
  });
}

export function completeMission(state) {
  const m = MISSIONS[state.missionIndex];
  state.player.money += m.reward;
  state.missionDone = true;
  state.banner = m.name + ' complete! +$' + m.reward;
  state.bannerTimer = 2.5;
  if (state.missionIndex + 1 < MISSIONS.length) {
    startMission(state, state.missionIndex + 1);
  } else {
    state.phase = 'won';
  }
}

export function updateMissions(state, dt) {
  const p = state.player;
  const i = state.missionIndex;
  state.missionTimer += dt;
  if (state.phase !== 'playing') return;
  if (i === 0) {
    if (!p.onFoot && p.car) completeMission(state);
  } else if (i === 1) {
    const mk = state.city.downtownMarker;
    if (!p.onFoot && Math.hypot(p.x - mk.x, p.y - mk.y) < 70) completeMission(state);
  } else if (i === 2) {
    if (p.wanted <= 0) completeMission(state);
  } else if (i === 3) {
    const mk = state.city.docksMarker;
    if (Math.hypot(p.x - mk.x, p.y - mk.y) < 70) completeMission(state);
  } else if (i === 4) {
    const boss = state.enemies.find((e) => e.boss);
    if (boss && boss.health <= 0) completeMission(state);
  }
}

export function updateWanted(state, dt) {
  const p = state.player;
  if (p.wanted > 0) {
    p.wantedTimer += dt;
    const nearPolice = state.cars.some((c) => c.kind === 'police' && Math.hypot(c.x - p.x, c.y - p.y) < 500);
    if (!nearPolice && p.wantedTimer > WANTED_DECAY_SECONDS) {
      p.wanted -= 1;
      p.wantedTimer = 0;
    }
  }
  const wantCount = Math.min(p.wanted, 4);
  const have = state.cars.filter((c) => c.kind === 'police').length;
  if (have < wantCount) {
    spawnPolice(state, wantCount);
  } else if (have > wantCount) {
    let excess = have - wantCount;
    state.cars = state.cars.filter((c) => {
      if (c.kind === 'police' && excess > 0) { excess -= 1; return false; }
      return true;
    });
  }
  if (p.wanted > 0 && state.missionIndex === 2) {
    // Mission 2 is about losing the heat; the timer only runs while hidden.
  }
}
