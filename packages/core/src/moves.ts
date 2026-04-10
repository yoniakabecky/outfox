import { validatePosition } from "./board";
import type { Card, GameState } from "./types";

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
    if (!validatePosition(nr, nc)) continue;

    // check if move is valid (not occupied by own piece)
    const targetCell = state.board[nr][nc];
    if (targetCell && targetCell.player === player) continue;

    validMoves.push([nr, nc]);
  }

  return validMoves;
};

export const validateMove = (
  state: GameState,
  from: [number, number],
  to: [number, number],
  card: Card,
): boolean => {
  const validMoves = getValidMoves(state, from, card);
  return validMoves.some(([r, c]) => r === to[0] && c === to[1]);
};
