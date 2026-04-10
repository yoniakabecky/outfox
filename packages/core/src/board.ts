import type { Board, GameState } from "./types";

export const BOARD_SIZE = 5;

export const initialBoard: Board = [
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

export const validatePosition = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const applyMove = (
  state: GameState,
  from: [number, number],
  to: [number, number],
): GameState => {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const newBoard = state.board.map((row) => row.slice());
  newBoard[toRow][toCol] = state.board[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;

  return {
    ...state,
    board: newBoard,
  };
};
