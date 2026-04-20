import { initialBoard } from "./board";
import { dealCards } from "./cards";
import type { GameState } from "./types";

export const initState = (): GameState => {
  const cards = dealCards();

  return {
    board: initialBoard.map((row) => row.slice()),
    foxCards: [cards[0], cards[2]],
    tanukiCards: [cards[1], cards[3]],
    waitingCard: cards[4],
    currentTurn: cards[4].stamp,
    phase: "hide-snack",
    selectedCard: null,
    winner: null,
    foxPoints: 0,
    tanukiPoints: 0,
    foxSnack: null,
    tanukiSnack: null,
  };
};
