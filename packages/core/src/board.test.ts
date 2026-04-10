import { describe, expect, test } from "vitest";
import { applyMove, validatePosition } from "./board";
import type { GameState } from "./types";

describe("validatePosition", () => {
  test("should return true for valid positions", () => {
    expect(validatePosition(0, 0)).toBe(true);
    expect(validatePosition(4, 4)).toBe(true);
    expect(validatePosition(2, 3)).toBe(true);
  });

  test("should return false for invalid positions", () => {
    expect(validatePosition(-1, 0)).toBe(false);
    expect(validatePosition(0, -1)).toBe(false);
    expect(validatePosition(5, 0)).toBe(false);
    expect(validatePosition(0, 5)).toBe(false);
    expect(validatePosition(5, 5)).toBe(false);
  });
});

describe("applyMove", () => {
  const state = {
    board: [
      [null, null, { player: "fox" }, null, null],
      [null, { player: "fox" }, null, null, null],
      [null, null, { player: "tanuki" }, null, null],
      [null, null, null, null, null],
      [null, null, null, { player: "tanuki" }, null],
    ],
  } as GameState;

  test("should move piece to new position (tanuki)", () => {
    const from = [4, 3] as [number, number];
    const to = [3, 3] as [number, number];
    const newState = applyMove(state, from, to);
    expect(newState.board[3][3]).toEqual({ player: "tanuki" });
    expect(newState.board[4][3]).toBeNull();
  });

  test("should move piece to new position (fox)", () => {
    const from = [0, 2] as [number, number];
    const to = [0, 0] as [number, number];
    const newState = applyMove(state, from, to);
    expect(newState.board[0][0]).toEqual({ player: "fox" });
    expect(newState.board[0][2]).toBeNull();
  });

  test("should allow moving to a cell occupied by opponent piece", () => {
    const from = [0, 2] as [number, number]; // fox piece
    const to = [2, 2] as [number, number]; // tanuki piece
    const newState = applyMove(state, from, to);
    expect(newState.board[2][2]).toEqual({ player: "fox" });
    expect(newState.board[0][2]).toBeNull();
  });

  test("should not mutate original board state", () => {
    const from = [0, 2] as [number, number];
    const to = [0, 0] as [number, number];
    const newState = applyMove(state, from, to);
    // newState should reflect the move
    expect(newState.board[0][2]).toBeNull();
    expect(newState.board[0][0]).toEqual({ player: "fox" });
    // original state should remain unchanged
    expect(state.board[0][2]).toEqual({ player: "fox" });
    expect(state.board[0][0]).toBeNull();
  });
});
