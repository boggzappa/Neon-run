import { LevelDef } from './types';

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "Neon Alley",
    width: 1200,
    height: 600,
    playerStart: { x: 50, y: 500 },
    goal: { x: 1100, y: 450, width: 60, height: 100 },
    platforms: [
      { x: 0, y: 550, width: 400, height: 50 },
      { x: 450, y: 480, width: 200, height: 30 },
      { x: 700, y: 550, width: 500, height: 50 },
      { x: 900, y: 450, width: 150, height: 30 },
    ],
    spikes: [],
    saws: [],
    lasers: [],
    coins: [
      { id: '1-1', x: 300, y: 500, collected: false },
      { id: '1-2', x: 550, y: 430, collected: false },
      { id: '1-3', x: 950, y: 400, collected: false },
    ],
  },
  {
    id: 2,
    name: "Spiky Depths",
    width: 1500,
    height: 600,
    playerStart: { x: 50, y: 500 },
    goal: { x: 1400, y: 450, width: 60, height: 100 },
    platforms: [
      { x: 0, y: 550, width: 300, height: 50 },
      { x: 400, y: 450, width: 200, height: 30 },
      { x: 700, y: 550, width: 200, height: 50 },
      { x: 1000, y: 450, width: 200, height: 30 },
      { x: 1300, y: 550, width: 200, height: 50 },
    ],
    spikes: [
      { x: 470, y: 440, width: 60, height: 10 }, // Fixed height back to 10
      { x: 1070, y: 440, width: 60, height: 10 },
      // Removed the middle ground spike
    ],
    saws: [],
    lasers: [],
    coins: [
      { id: '2-1', x: 500, y: 320, collected: false },
      { id: '2-2', x: 800, y: 460, collected: false },
      { id: '2-3', x: 1100, y: 320, collected: false },
    ],
  },
  {
    id: 3,
    name: "Buzzsaw Corridor",
    width: 1200,
    height: 600,
    playerStart: { x: 50, y: 500 },
    goal: { x: 1100, y: 450, width: 60, height: 100 },
    platforms: [
      { x: 0, y: 550, width: 200, height: 50 },
      { x: 250, y: 450, width: 150, height: 30 },
      { x: 500, y: 350, width: 150, height: 30 },
      { x: 750, y: 450, width: 150, height: 30 },
      { x: 1000, y: 550, width: 200, height: 50 },
    ],
    spikes: [],
    saws: [
      {
        x: 325, y: 300, radius: 25, speed: 0.002, t: 0, currentPathIndex: 0,
        path: [{ x: 325, y: 150 }, { x: 325, y: 400 }]
      },
      {
        x: 575, y: 200, radius: 30, speed: 0.003, t: 0, currentPathIndex: 0,
        path: [{ x: 450, y: 200 }, { x: 700, y: 200 }]
      },
      {
        x: 825, y: 300, radius: 25, speed: 0.002, t: 0, currentPathIndex: 0,
        path: [{ x: 825, y: 150 }, { x: 825, y: 400 }]
      },
    ],
    lasers: [],
    coins: [
      { id: '3-1', x: 325, y: 420, collected: false },
      { id: '3-2', x: 575, y: 250, collected: false },
      { id: '3-3', x: 825, y: 420, collected: false },
    ],
  },
  {
    id: 4,
    name: "Laser Grid",
    width: 1000,
    height: 800,
    playerStart: { x: 50, y: 700 },
    goal: { x: 800, y: 0, width: 60, height: 100 },
    platforms: [
      { x: 0, y: 750, width: 200, height: 50 },
      { x: 300, y: 650, width: 150, height: 30 },
      { x: 100, y: 550, width: 150, height: 30 },
      { x: 300, y: 450, width: 150, height: 30 },
      { x: 500, y: 350, width: 150, height: 30 },
      { x: 300, y: 250, width: 150, height: 30 },
      { x: 100, y: 150, width: 150, height: 30 },
      { x: 300, y: 125, width: 120, height: 30 }, // Intermediate platform added
      { x: 500, y: 100, width: 400, height: 30 }, // Uppest platform
    ],
    spikes: [],
    saws: [],
    lasers: [
      { x1: 250, y1: 0, x2: 250, y2: 800, period: 4000, offset: 0, isActive: true },
      { x1: 500, y1: 0, x2: 500, y2: 800, period: 4000, offset: 2000, isActive: true },
      { x1: 750, y1: 0, x2: 750, y2: 800, period: 4000, offset: 1000, isActive: true },
    ],
    coins: [
      { id: '4-1', x: 150, y: 500, collected: false },
      { id: '4-2', x: 550, y: 300, collected: false },
      { id: '4-3', x: 800, y: 60, collected: false },
    ],
  },
  {
    id: 5,
    name: "The Neon Core",
    width: 2000,
    height: 600,
    playerStart: { x: 50, y: 500 },
    goal: { x: 1900, y: 450, width: 60, height: 100 },
    platforms: [
      { x: 0, y: 550, width: 200, height: 50 },
      { x: 300, y: 450, width: 200, height: 30 },
      { x: 600, y: 350, width: 200, height: 30 },
      { x: 900, y: 450, width: 200, height: 30 },
      { x: 1200, y: 350, width: 200, height: 30 },
      { x: 1500, y: 450, width: 200, height: 30 },
      { x: 1800, y: 550, width: 200, height: 50 },
    ],
    spikes: [
      { x: 360, y: 440, width: 80, height: 10 }, // 4 spikes (20px each)
      { x: 960, y: 440, width: 80, height: 10 }, // 4 spikes (20px each)
      { x: 1560, y: 440, width: 80, height: 10 }, // 4 spikes (20px each)
    ],
    saws: [
      {
        x: 600, y: 200, radius: 40, speed: 0.004, t: 0, currentPathIndex: 0,
        path: [{ x: 500, y: 200 }, { x: 800, y: 200 }]
      },
      {
        x: 1200, y: 200, radius: 40, speed: 0.004, t: 0, currentPathIndex: 0,
        path: [{ x: 1100, y: 200 }, { x: 1400, y: 200 }]
      },
    ],
    lasers: [
      { x1: 0, y1: 300, x2: 2000, y2: 300, period: 7000, activeDuration: 1200, offset: 0, isActive: true },
    ],
    coins: [
      { id: '5-1', x: 600, y: 300, collected: false },
      { id: '5-2', x: 1200, y: 300, collected: false },
      { id: '5-3', x: 1930, y: 400, collected: false },
    ],
  },
];
