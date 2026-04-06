import { applyMove } from "./moves";
import { cycleCard } from "./state";
import type { Card, GameState } from "./types";
import { checkWin } from "./win";

export const selectCard = (state: GameState, card: Card): GameState => {
  if (state.phase !== "select-card")
    throw new Error("Not in select-card phase");

  const hand = state.currentTurn === "fox" ? state.foxCards : state.tanukiCards;
  if (!hand.includes(card))
    throw new Error("Card does not belong to current player");

  return { ...state, phase: "select-piece", selectedCard: card };
};

export const cancelSelection = (state: GameState): GameState => {
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
    throw new Error("Not in select-piece phase");
  if (!state.selectedCard) throw new Error("No card selected");

  const afterMove = applyMove(state, from, to);
  const afterCycle = cycleCard(afterMove, state.selectedCard);
  const winner = checkWin(afterCycle);

  if (winner) {
    return {
      ...afterCycle,
      phase: "game-over",
      winner,
      selectedCard: null,
    };
  }

  return {
    ...afterCycle,
    phase: "select-card",
    selectedCard: null,
  };
};
