import { describe, expect, test } from "vitest";
import type { GameState } from "./types";
import { checkWin } from "./win";
import { GameError } from "./errors";

describe("checkWin", () => {
  test("should return null for ongoing game", () => {
    const state = {
      board: [
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, null, null, null, null],
        [null, null, null, { player: "tanuki", type: "boss" }, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBeNull();
  });

  test("should return 'fox' if fox boss is in tanuki nest", () => {
    const state = {
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "boss" }, null, null],
        [null, null, null, null, null],
        [null, null, { player: "fox", type: "boss" }, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBe("fox");
  });

  test("should return 'tanuki' if tanuki boss is in fox nest", () => {
    const state = {
      board: [
        [null, null, { player: "tanuki", type: "boss" }, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, { player: "fox", type: "boss" }, null, null, null],
        [null, null, null, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBe("tanuki");
  });

  test("should return 'tanuki' if fox boss is captured", () => {
    const state = {
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, null, null, null],
        [null, { player: "tanuki", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "boss" }, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBe("tanuki");
  });

  test("should return 'fox' if tanuki boss is captured", () => {
    const state = {
      board: [
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, null, null, null],
        [null, { player: "tanuki", type: "sibling" }, null, null, null],
        [null, null, null, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBe("fox");
  });

  test("should return null if a sibling piece is in opponent nests (tanuki)", () => {
    const state = {
      board: [
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, { player: "fox", type: "boss" }, null, null, null],
        [null, null, { player: "tanuki", type: "boss" }, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBeNull();
  });

  test("should return error if both bosses are captured simultaneously (draw)", () => {
    const state = {
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, null, null, null],
        [null, { player: "tanuki", type: "sibling" }, null, null, null],
        [null, null, null, null, null],
      ],
    } as GameState;
    expect(() => checkWin(state)).toThrow(GameError);
    expect(() => checkWin(state)).toThrow(
      expect.objectContaining({ code: "INVALID_GAME_STATE" }),
    );
  });

  test("should return null if a sibling piece is in opponent nests (fox)", () => {
    const state = {
      board: [
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, { player: "tanuki", type: "sibling" }, null, null, null],
        [null, null, { player: "fox", type: "sibling" }, null, null],
        [null, { player: "tanuki", type: "boss" }, null, null, null],
        [null, null, { player: "fox", type: "sibling" }, null, null],
      ],
    } as GameState;
    expect(checkWin(state)).toBeNull();
  });
});
