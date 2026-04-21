import { applyMove, validatePosition } from "./board";
import { ErrorCode, GameError } from "./errors";
import { validateMove } from "./moves";
import type { Card, GameState, Hand, Player } from "./types";
import { checkWin } from "./win";

export const placeSnack = (
  state: GameState,
  player: Player,
  position: [number, number],
): GameState => {
  if (state.phase !== "hide-snack")
    throw new GameError(ErrorCode.WRONG_PHASE, "Not in hide-snack phase");

  const [row, col] = position;

  if (!validatePosition(row, col))
    throw new GameError(ErrorCode.OUT_OF_BOUNDS, "Position is out of bounds");

  const isFox = player === "fox";
  const validRows = isFox ? [3, 4] : [0, 1];
  if (!validRows.includes(row))
    throw new GameError(
      ErrorCode.INVALID_SNACK_PLACEMENT,
      "Snack must be placed in own half of the board",
    );

  if (state.board[row][col] !== null)
    throw new GameError(ErrorCode.INVALID_SNACK_PLACEMENT, "Cell is occupied");

  if (isFox ? state.foxSnack !== null : state.tanukiSnack !== null)
    throw new GameError(
      ErrorCode.INVALID_SNACK_PLACEMENT,
      "Player has already placed their snack",
    );

  const next = {
    ...state,
    foxSnack: isFox ? position : state.foxSnack,
    tanukiSnack: isFox ? state.tanukiSnack : position,
  };

  if (next.foxSnack !== null && next.tanukiSnack !== null) {
    return { ...next, phase: "select-card" };
  }

  return next;
};

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

const calcPoints = (
  state: GameState,
  to: [number, number],
): Pick<
  GameState,
  "foxPoints" | "tanukiPoints" | "foxSnack" | "tanukiSnack"
> => {
  const [toRow, toCol] = to;
  const isFox = state.currentTurn === "fox";

  const targetCell = state.board[toRow][toCol];
  const capturePoints =
    targetCell && targetCell.player !== state.currentTurn
      ? targetCell.type === "boss"
        ? 3
        : 1
      : 0;

  const opponentSnack = isFox ? state.tanukiSnack : state.foxSnack;
  const snackFound =
    opponentSnack != null &&
    opponentSnack[0] === toRow &&
    opponentSnack[1] === toCol;

  const total = capturePoints + (snackFound ? 2 : 0);

  return {
    foxPoints: isFox ? state.foxPoints + total : state.foxPoints,
    tanukiPoints: isFox ? state.tanukiPoints : state.tanukiPoints + total,
    foxSnack: !isFox && snackFound ? null : state.foxSnack,
    tanukiSnack: isFox && snackFound ? null : state.tanukiSnack,
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
  const stateWithPoints = { ...afterMove, ...calcPoints(state, to) };
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
