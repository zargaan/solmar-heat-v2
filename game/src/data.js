// Game constants, palette and mission definitions for Solmar Heat.
// All tuning numbers live here so the rest of the code reads them by name.
export const SEED = 1337;
export const WORLD_W = 2400;
export const WORLD_H = 1800;
export const VIEW_W = 960;
export const VIEW_H = 600;

export const PLAYER_SPEED = 150;
export const PLAYER_RADIUS = 10;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_START_AMMO = 30;

export const CAR_TOP_SPEED = 420;
export const CAR_ACCEL = 340;
export const CAR_BRAKE = 560;
export const CAR_TURN = 2.7;
export const CAR_LENGTH = 34;
export const CAR_WIDTH = 16;

export const BULLET_SPEED = 640;
export const BULLET_RADIUS = 3;
export const BULLET_DAMAGE = 34;

export const WANTED_MAX = 5;
export const WANTED_DECAY_SECONDS = 14;

export const COLORS = {
  grass: '#2f6b2f',
  road: '#3a3a3f',
  roadLine: '#d8c84a',
  sidewalk: '#6f6f74',
  buildingDowntown: '#4a5a78',
  buildingHouse: '#7a5a42',
  buildingMansion: '#8a6d2f',
  buildingRoof: '#2c2c30',
  park: '#3d7a3d',
  water: '#2f5a8a',
  carColors: ['#c0392b', '#2980b9', '#f39c12', '#8e44ad', '#16a085', '#e67e22', '#ecf0f1', '#2c3e50'],
  police: '#1a3a8a',
  player: '#f1c40f',
  enemy: '#e74c3c',
  boss: '#8e0000',
  bullet: '#ffe14d',
  hudBg: 'rgba(10, 10, 14, 0.72)',
  hudText: '#ffffff',
  hudMoney: '#7dff6a',
  star: '#ffd700',
  marker: '#ff4757',
};

export const MISSIONS = [
  {
    id: 0,
    name: 'Hot Wheels',
    text: 'Steal a parked car. Walk up to one and press E.',
    reward: 200,
  },
  {
    id: 1,
    name: 'Downtown Run',
    text: 'Drive to the downtown marker. Follow the red pin.',
    reward: 400,
  },
  {
    id: 2,
    name: 'Lose the Heat',
    text: 'Get your wanted level back down to zero. Lay low.',
    reward: 600,
  },
  {
    id: 3,
    name: 'The Package',
    text: 'Drive to the docks marker and pick up the package.',
    reward: 900,
  },
  {
    id: 4,
    name: 'Storm the Mansion',
    text: 'Rico Vane is at the mansion. Take him down.',
    reward: 2000,
  },
];

export const BOSS_NAME = 'Rico Vane';
export const GAME_TITLE = 'SOLMAR HEAT';
export const GAME_SUBTITLE = 'a Vice City story, built from scratch';
