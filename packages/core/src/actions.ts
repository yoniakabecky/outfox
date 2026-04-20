import { applyMove, validatePosition } from "./board";
import { ErrorCode, GameError } from "./errors";
import { validateMove } from "./moves";
import type { Card, GameState, Hand } from "./types";
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

const calcCapturePoints = (
  state: GameState,
  to: [number, number],
): { foxPoints: number; tanukiPoints: number } => {
  const [toRow, toCol] = to;
  const targetCell = state.board[toRow][toCol];
  if (targetCell === null || targetCell.player === state.currentTurn)
    return { foxPoints: state.foxPoints, tanukiPoints: state.tanukiPoints };

  // TODO: Add +2 points for snack cell when that mechanic is implemented.
  const points = targetCell.type === "boss" ? 3 : 1;
  return {
    foxPoints:
      state.currentTurn === "fox" ? state.foxPoints + points : state.foxPoints,
    tanukiPoints:
      state.currentTurn === "tanuki"
        ? state.tanukiPoints + points
        : state.tanukiPoints,
  };
};

const cycleCard = (state: GameState, usedCard: Card): GameState => {
  const isFox = state.currentTurn === "fox";
  const hand = isFox ? state.foxCards : state.tanukiCards;
  const newHand: Hand = [
    hand[0] === usedCard ? state.waitingCard : hand[0],
    hand[1] === usedCard ? state.waitingCard : hand[1],
  ];

  return {
    ...state,
    foxCards: isFox ? newHand : state.foxCards,
    tanukiCards: isFox ? state.tanukiCards : newHand,
    waitingCard: usedCard,
    currentTurn: isFox ? "tanuki" : "fox",
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

  if (!validatePosition(...from))
    throw new GameError(
      ErrorCode.OUT_OF_BOUNDS,
      "Source position is out of bounds",
    );
  if (!validatePosition(...to))
    throw new GameError(
      ErrorCode.OUT_OF_BOUNDS,
      "Target position is out of bounds",
    );

  const [fromRow, fromCol] = from;
  const piece = state.board[fromRow][fromCol];
  if (!piece)
    throw new GameError(
      ErrorCode.NO_PIECE_AT_SOURCE,
      "No piece at source position",
    );
  if (piece.player !== state.currentTurn)
    throw new GameError(
      ErrorCode.OPPONENT_PIECE,
      "Cannot move opponent's piece",
    );

  const isValid = validateMove(state, from, to, state.selectedCard);
  if (!isValid)
    throw new GameError(
      ErrorCode.INVALID_MOVE,
      "Invalid move for the selected card",
    );

  const afterMove = applyMove(state, from, to);
  const stateWithPoints = { ...afterMove, ...calcCapturePoints(state, to) };
  const winner = checkWin(stateWithPoints);

  if (winner) {
    return {
      ...stateWithPoints,
      phase: "game-over",
      winner,
      selectedCard: null,
    };
  }

  const afterCycle = cycleCard(stateWithPoints, state.selectedCard);
  return {
    ...afterCycle,
    phase: "select-card",
    selectedCard: null,
  };
};
