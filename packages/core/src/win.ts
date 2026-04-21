import type { GameState } from "./types";

const POINTS_TO_WIN = 5;

export const checkWin = (state: GameState): "fox" | "tanuki" | null => {
  if (state.foxPoints >= POINTS_TO_WIN) return "fox";
  if (state.tanukiPoints >= POINTS_TO_WIN) return "tanuki";
  return null;
};
