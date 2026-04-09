import { BOARD_SIZE, applyMove } from "./board";
import { ErrorCode, GameError } from "./errors";
import { isValidMove } from "./moves";
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

  const [fromRow, fromCol] = from;
  if (
    fromRow < 0 ||
    fromRow >= BOARD_SIZE ||
    fromCol < 0 ||
    fromCol >= BOARD_SIZE
  )
    throw new GameError(
      ErrorCode.OUT_OF_BOUNDS,
      "Source position is out of bounds",
    );

  const piece = state.board[fromRow][fromCol];
  if (!piece || piece.player !== state.currentTurn)
    throw new GameError(
      ErrorCode.OPPONENT_PIECE,
      "Cannot move opponent's piece",
    );

  const isValid = isValidMove(state, from, to, state.selectedCard);
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
