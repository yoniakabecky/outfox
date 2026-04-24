import { describe, expect, test } from "vitest";
import type { GameState } from "./types";
import { checkWin } from "./win";
import { ErrorCode, GameError } from "./errors";

describe("checkWin", () => {
  const baseState = { foxPoints: 0, tanukiPoints: 0 } as GameState;

  test("should return null when neither player has reached 5 points", () => {
    expect(
      checkWin({ ...baseState, foxPoints: 4, tanukiPoints: 4 }),
    ).toBeNull();
  });

  test("should return null when both are at 0", () => {
    expect(checkWin(baseState)).toBeNull();
  });

  test("should return 'fox' when fox has exactly 5 points", () => {
    expect(checkWin({ ...baseState, foxPoints: 5, tanukiPoints: 2 })).toBe(
      "fox",
    );
  });

  test("should return 'tanuki' when tanuki has exactly 5 points", () => {
    expect(checkWin({ ...baseState, foxPoints: 1, tanukiPoints: 5 })).toBe(
      "tanuki",
    );
  });

  test("should return 'fox' when fox exceeds 5 points", () => {
    // Boss capture (+3) can push a player from 3 to 6
    expect(checkWin({ ...baseState, foxPoints: 6, tanukiPoints: 3 })).toBe(
      "fox",
    );
  });

  test("should throw an error when both players reach 5 points simultaneously", () => {
    const fn = () => checkWin({ ...baseState, foxPoints: 5, tanukiPoints: 5 });
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_GAME_STATE }),
    );
  });
});
