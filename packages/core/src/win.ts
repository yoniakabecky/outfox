import type { GameState } from "./types";

export const POINTS_TO_WIN = 5;

export const checkWin = (state: GameState): "fox" | "tanuki" | null => {
  // TODO: Add snack cell check here (+2 pts) when that mechanic is implemented.
  if (state.foxPoints >= POINTS_TO_WIN) return "fox";
  if (state.tanukiPoints >= POINTS_TO_WIN) return "tanuki";
  return null;
};
