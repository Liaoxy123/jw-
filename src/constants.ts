import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 10;
export const INITIAL_ROWS = 4;

export type GameMode = 'classic' | 'time';
export type GameStatus = 'menu' | 'playing' | 'gameover';

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
}
