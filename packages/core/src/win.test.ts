import { describe, expect, test } from "vitest";
import { checkWin } from "./win";

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
    };
    expect(checkWin(state as any)).toBeNull();
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
    };
    expect(checkWin(state as any)).toBe("fox");
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
    };
    expect(checkWin(state as any)).toBe("tanuki");
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
    };
    expect(checkWin(state as any)).toBe("tanuki");
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
    };
    expect(checkWin(state as any)).toBe("fox");
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
    };
    expect(checkWin(state as any)).toBeNull();
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
    };
    expect(checkWin(state as any)).toBeNull();
  });
});
