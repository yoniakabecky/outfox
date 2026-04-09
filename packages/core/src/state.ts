import { dealCards } from "./cards";
import { ErrorCode, GameError } from "./errors";
import type { Board, Card, GameState, Hand } from "./types";

const initialBoard: Board = [
  [
    { player: "fox", type: "sibling" },
    { player: "fox", type: "sibling" },
    { player: "fox", type: "boss" },
    { player: "fox", type: "sibling" },
    { player: "fox", type: "sibling" },
  ],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "boss" },
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "sibling" },
  ],
];

export const cycleCard = (state: GameState, usedCard: Card): GameState => {
  const isFox = state.currentTurn === "fox";
  const hand = isFox ? state.foxCards : state.tanukiCards;
  if (!hand.includes(usedCard)) {
    throw new GameError(ErrorCode.CARD_NOT_IN_HAND, "Card does not belong to current player");
  }

  const newHand = hand.map((c) =>
    c === usedCard ? state.waitingCard : c,
  ) as Hand;

  return {
    ...state,
    foxCards: isFox ? newHand : state.foxCards,
    tanukiCards: isFox ? state.tanukiCards : newHand,
    waitingCard: usedCard,
    currentTurn: isFox ? "tanuki" : "fox",
  };
};

export const initState = (): GameState => {
  const cards = dealCards();

  return {
    board: initialBoard.map((row) => row.slice()),
    foxCards: [cards[0], cards[2]],
    tanukiCards: [cards[1], cards[3]],
    waitingCard: cards[4],
    currentTurn: cards[4].stamp,
    phase: "select-card",
    selectedCard: null,
    winner: null,
  };
};
