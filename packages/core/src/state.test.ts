import { describe, expect, test } from "vitest";
import { cycleCard, initState } from "./state";

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

describe("cycleCard", () => {
  test("should cycle the card and switch turns correctly (fox)", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const usedCard = state.foxCards[0];
    const newState = cycleCard(state, usedCard);

    expect(newState.waitingCard).toBe(usedCard);
    expect(newState.currentTurn).toBe("tanuki");
    expect(newState.foxCards).toContain(state.waitingCard);
    expect(newState.foxCards).not.toContain(usedCard);
    expect(newState.tanukiCards).toEqual(state.tanukiCards);
  });

  test("should cycle the card and switch turns correctly (tanuki)", () => {
    const state = { ...initState(), currentTurn: "tanuki" as const };
    const usedCard = state.tanukiCards[0];
    const newState = cycleCard(state, usedCard);

    expect(newState.waitingCard).toBe(usedCard);
    expect(newState.currentTurn).toBe("fox");
    expect(newState.tanukiCards).toContain(state.waitingCard);
    expect(newState.tanukiCards).not.toContain(usedCard);
    expect(newState.foxCards).toEqual(state.foxCards);
  });

  test("should cycle the second card in the hand (index 1)", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const usedCard = state.foxCards[1];
    const newState = cycleCard(state, usedCard);

    expect(newState.waitingCard).toBe(usedCard);
    expect(newState.foxCards[1]).toBe(state.waitingCard);
    expect(newState.foxCards[0]).toBe(state.foxCards[0]);
  });

  test("should place the waiting card at the same index as the used card", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const usedCard = state.foxCards[1];
    const newState = cycleCard(state, usedCard);

    expect(newState.foxCards.indexOf(state.waitingCard)).toBe(1);
  });

  test("should not change hand if used card is not in current player's hand", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const invalidCard = state.tanukiCards[0];
    const newState = cycleCard(state, invalidCard);

    expect(newState.foxCards).toEqual(state.foxCards);
    expect(newState.tanukiCards).toEqual(state.tanukiCards);
    expect(newState.waitingCard).toBe(state.waitingCard);
    expect(newState.currentTurn).toBe("fox");
  });

  test("should not mutate the original state", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const originalFoxCards = state.foxCards;
    const originalWaitingCard = state.waitingCard;
    cycleCard(state, state.foxCards[0]);

    expect(state.foxCards).toBe(originalFoxCards);
    expect(state.waitingCard).toBe(originalWaitingCard);
  });
});
