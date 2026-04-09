import { ErrorCode, GameError } from "./errors";
import type { Card, GameState } from "./types";

export const BOARD_SIZE = 5;

export const getValidMoves = (
  state: GameState,
  piecePos: [number, number],
  card: Card,
): [number, number][] => {
  const [row, col] = piecePos;
  const cell = state.board[row][col];
  if (!cell) return [];

  const player = cell.player;

  // if player is fox, mirror the card moves vertically (cards are defined from tanuki's perspective)
  const moves =
    player === "fox" ? card.moves.map(([dr, dc]) => [-dr, -dc]) : card.moves;

  const validMoves: [number, number][] = [];

  // check if piece can move according to the card moves
  for (const [dr, dc] of moves) {
    const nr = row + dr;
    const nc = col + dc;

    // check if move is within board bounds
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;

    // check if move is valid (not occupied by own piece)
    const targetCell = state.board[nr][nc];
    if (targetCell && targetCell.player === player) continue;

    validMoves.push([nr, nc]);
  }

  return validMoves;
};

export const applyMove = (
  state: GameState,
  from: [number, number],
  to: [number, number],
): GameState => {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const piece = state.board[fromRow][fromCol];
  if (!piece)
    throw new GameError(
      ErrorCode.NO_PIECE_AT_SOURCE,
      "No piece at the source position",
    );

  const target = state.board[toRow][toCol];
  if (target && target.player === piece.player)
    throw new GameError(
      ErrorCode.FRIENDLY_FIRE,
      "Cannot move to a cell occupied by a team piece",
    );

  const newBoard = state.board.map((row) => row.slice());
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  return {
    ...state,
    board: newBoard,
  };
};
