import { ErrorCode, GameError } from "./errors";
import { BOARD_SIZE, applyMove, getValidMoves } from "./moves";
import { cycleCard } from "./state";
import type { Card, GameState } from "./types";
import { checkWin } from "./win";

export const selectCard = (state: GameState, card: Card): GameState => {
  if (state.phase !== "select-card")
    throw new GameError(ErrorCode.WRONG_PHASE, "Not in select-card phase");

  const hand = state.currentTurn === "fox" ? state.foxCards : state.tanukiCards;
  if (!hand.includes(card))
    throw new GameError(
      ErrorCode.CARD_NOT_IN_HAND,
      "Card does not belong to current player",
    );

  return { ...state, phase: "select-piece", selectedCard: card };
};

export const cancelSelection = (state: GameState): GameState => {
  if (state.phase !== "select-piece")
    throw new GameError(ErrorCode.WRONG_PHASE, "Not in select-piece phase");
  return {
    ...state,
    phase: "select-card",
    selectedCard: null,
  };
};

export const makeMove = (
  state: GameState,
  from: [number, number],
  to: [number, number],
): GameState => {
  if (state.phase !== "select-piece")
    throw new GameError(ErrorCode.WRONG_PHASE, "Not in select-piece phase");
  if (!state.selectedCard)
    throw new GameError(ErrorCode.NO_CARD_SELECTED, "No card selected");

  if (from[0] < 0 || from[0] >= BOARD_SIZE || from[1] < 0 || from[1] >= BOARD_SIZE)
    throw new GameError(ErrorCode.OUT_OF_BOUNDS, "Source position is out of bounds");

  const piece = state.board[from[0]][from[1]];
  if (!piece || piece.player !== state.currentTurn)
    throw new GameError(
      ErrorCode.OPPONENT_PIECE,
      "Cannot move opponent's piece",
    );

  const isValid = getValidMoves(state, from, state.selectedCard).some(
    ([r, c]) => r === to[0] && c === to[1],
  );
  if (!isValid)
    throw new GameError(
      ErrorCode.INVALID_MOVE,
      "Invalid move for the selected card",
    );

  const afterMove = applyMove(state, from, to);
  const winner = checkWin(afterMove);

  if (winner) {
    return {
      ...afterMove,
      phase: "game-over",
      winner,
      selectedCard: null,
    };
  }

  const afterCycle = cycleCard(afterMove, state.selectedCard);
  return {
    ...afterCycle,
    phase: "select-card",
    selectedCard: null,
  };
};
