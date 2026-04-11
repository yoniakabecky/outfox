type Player = "fox" | "tanuki";
type PieceType = "boss" | "sibling";
type Cell = { player: Player; type: PieceType } | null;
type Board = Cell[][]; // [row][col], 5×5

type CardName =
  | "frog"
  | "rabbit"
  | "monkey"
  | "horse"
  | "boar"
  | "hawk"
  | "deer"
  | "bear"
  | "squirrel"
  | "goat";
type Card = {
  name: CardName;
  moves: [number, number][]; // [dr, dc] offsets from piece position
  stamp: Player; // which player goes first if this is the 5th card
};
type Hand = [Card, Card]; // each player has exactly 2 cards

type GameState = {
  board: Board;
  foxCards: Hand;
  tanukiCards: Hand;
  waitingCard: Card;
  currentTurn: Player;
  phase: "select-card" | "select-piece" | "game-over";
  selectedCard: Card | null;
  winner: Player | null;
};

export type { Board, Card, CardName, Cell, GameState, Hand, PieceType, Player };
