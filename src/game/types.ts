export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SawDef {
  x: number;
  y: number;
  radius: number;
  path: Point[];
  speed: number;
  currentPathIndex: number;
  t: number; // For interpolation along path
}

export interface LaserDef {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  period: number; // Total cycle duration in ms
  activeDuration?: number; // How long it stays ON (defaults to half of period if not set)
  offset: number; // shift in period
  isActive: boolean;
}

export interface CoinDef {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface LevelDef {
  id: number;
  name: string;
  width: number;
  height: number;
  playerStart: Point;
  goal: Rect;
  platforms: Rect[];
  spikes: Rect[];
  saws: SawDef[];
  lasers: LaserDef[];
  coins: CoinDef[];
}

export type GameStatus = 'START' | 'PLAYING' | 'GAMEOVER' | 'LEVEL_COMPLETE' | 'WIN';

export interface GameState {
  status: GameStatus;
  currentLevelIndex: number;
  lives: number;
  score: number;
  totalCoins: number;
}
