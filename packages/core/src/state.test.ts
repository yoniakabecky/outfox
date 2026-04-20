import { describe, expect, test } from "vitest";
import { initState } from "./state";

describe("initState", () => {
  test("should initialize the game state correctly", () => {
    const state = initState();
    expect(state.board).toHaveLength(5);
    expect(state.foxCards).toHaveLength(2);
    expect(state.tanukiCards).toHaveLength(2);
    expect(state.waitingCard).toBeDefined();
    expect(state.currentTurn).toBe(state.waitingCard.stamp);
    expect(state.phase).toBe("select-card");
    expect(state.selectedCard).toBeNull();
    expect(state.winner).toBeNull();
    expect(state.foxPoints).toBe(0);
    expect(state.tanukiPoints).toBe(0);
  });

  test("should set up the board with fox on row 0, tanuki on row 4, empty middle rows", () => {
    const state = initState();
    for (let col = 0; col < 5; col++) {
      expect(state.board[0][col]?.player).toBe("fox");
      expect(state.board[4][col]?.player).toBe("tanuki");
    }
    for (let row = 1; row <= 3; row++) {
      for (let col = 0; col < 5; col++) {
        expect(state.board[row][col]).toBeNull();
      }
    }
  });

  test("should place boss pieces at column 2 for both players", () => {
    const state = initState();
    expect(state.board[0][2]?.type).toBe("boss");
    expect(state.board[4][2]?.type).toBe("boss");
    for (const col of [0, 1, 3, 4]) {
      expect(state.board[0][col]?.type).toBe("sibling");
      expect(state.board[4][col]?.type).toBe("sibling");
    }
  });

  test("should deal 5 distinct cards", () => {
    const state = initState();
    const allCards = [
      ...state.foxCards,
      ...state.tanukiCards,
      state.waitingCard,
    ];
    const uniqueCards = new Set(allCards);
    expect(uniqueCards.size).toBe(5);
  });
});
