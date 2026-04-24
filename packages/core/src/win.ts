import { ErrorCode, GameError } from "./errors";
import type { GameState } from "./types";

const POINTS_TO_WIN = 5;

export const checkWin = (state: GameState): "fox" | "tanuki" | null => {
  if (state.foxPoints >= POINTS_TO_WIN && state.tanukiPoints >= POINTS_TO_WIN) {
    throw new GameError(
      ErrorCode.INVALID_GAME_STATE,
      "Both players cannot reach the winning points at the same time",
    );
  }
  if (state.foxPoints >= POINTS_TO_WIN) return "fox";
  if (state.tanukiPoints >= POINTS_TO_WIN) return "tanuki";
  return null;
};
