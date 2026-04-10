import { describe, expect, test } from "vitest";
import { cards } from "./cards";
import { getValidMoves } from "./moves";
import type { GameState } from "./types";

describe("getValidMoves", () => {
  const board = [
    [null, null, { player: "fox", type: "boss" }, null, null],
    [null, { player: "fox", type: "sibling" }, null, null, null],
    [null, null, { player: "tanuki", type: "sibling" }, null, null],
    [null, null, null, null, null],
    [null, null, null, { player: "tanuki" }, null],
  ];

  test("should return valid moves for a piece (fox)", () => {
    const piecePos = [1, 1] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.tiger,
    );
    expect(validMoves).toEqual([
      [3, 1],
      [0, 1],
    ]);
  });

  test("should return valid moves for a piece (tanuki)", () => {
    const piecePos = [4, 3] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.frog,
    );
    expect(validMoves).toEqual([
      [4, 1],
      [3, 2],
    ]);
  });

  test("should return empty array if piece position is out of bounds", () => {
    const piecePos = [5, 5] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.tiger,
    );
    expect(validMoves).toEqual([]);
  });

  test("should return empty array if no piece at position", () => {
    const piecePos = [0, 0] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.tiger,
    );
    expect(validMoves).toEqual([]);
  });

  test("should not return moves that team piece occupies (fox)", () => {
    const piecePos = [1, 1] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.dragon,
    );
    expect(validMoves).toEqual([
      [2, 3],
      [0, 0],
      // [0, 2] is occupied by a team piece
    ]);
  });

  test("should return moves that opponent team piece occupies (tanuki)", () => {
    const piecePos = [2, 2] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.monkey,
    );
    expect(validMoves).toEqual([
      [1, 1], // occupied by an opponent piece
      [1, 3],
      [3, 1],
      [3, 3],
    ]);
  });

  test("should not return moves that are out of board bounds", () => {
    const piecePos = [0, 2] as [number, number];
    const validMoves = getValidMoves(
      { board } as GameState,
      piecePos,
      cards.tiger,
    );
    expect(validMoves).toEqual([
      [2, 2],
      // [-2, 2] is out of bounds
    ]);
  });

  test("should return empty array if all moves are invalid", () => {
    const state = {
      board: [
        [null, null, { player: "fox" }, null, null],
        [null, { player: "tanuki" }, null, null, null],
        [null, null, { player: "fox" }, null, null],
        [null, null, null, null, null],
        [null, null, null, { player: "tanuki" }, null],
      ],
    } as GameState;
    const piecePos = [0, 2] as [number, number];
    const validMoves = getValidMoves(state, piecePos, cards.tiger);
    expect(validMoves).toEqual([]);
  });
});
