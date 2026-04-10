import { BOARD_SIZE } from "./board";
import type { GameState } from "./types";

export const checkWin = (state: GameState): "fox" | "tanuki" | null => {
  const centerCol = Math.floor(BOARD_SIZE / 2);
  const foxNest = state.board[0][centerCol];
  const tanukiNest = state.board[BOARD_SIZE - 1][centerCol];

  // Check if fox boss is in tanuki nest
  if (tanukiNest && tanukiNest.player === "fox" && tanukiNest.type === "boss") {
    return "fox";
  }

  // Check if tanuki boss is in fox nest
  if (foxNest && foxNest.player === "tanuki" && foxNest.type === "boss") {
    return "tanuki";
  }

  // Check if either boss is captured
  let foxBossCaptured = true;
  let tanukiBossCaptured = true;

  for (const row of state.board) {
    for (const cell of row) {
      if (cell) {
        if (cell.player === "fox" && cell.type === "boss") {
          foxBossCaptured = false;
        }
        if (cell.player === "tanuki" && cell.type === "boss") {
          tanukiBossCaptured = false;
        }
      }
    }
  }

  if (foxBossCaptured && tanukiBossCaptured) {
    // This should never happen in a normal game, but if it does, it's a draw.
    // For simplicity, we'll just return null.
    return null;
  }

  if (foxBossCaptured) return "tanuki";
  if (tanukiBossCaptured) return "fox";

  return null;
};
