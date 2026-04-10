import { describe, expect, test } from "vitest";
import { cancelSelection, cycleCard, makeMove, selectCard } from "./actions";
import { cards } from "./cards";
import { ErrorCode, GameError } from "./errors";
import { initState } from "./state";
import type { GameState } from "./types";

describe("selectCard", () => {
  const initialState = {
    phase: "select-card",
    currentTurn: "fox",
    foxCards: [cards.tiger, cards.dragon],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.hawk,
    selectedCard: null,
  } as GameState;

  test("should update state with selected card and change phase to select-piece", () => {
    const cardToSelect = cards.tiger;
    const newState = selectCard(initialState, cardToSelect);

    expect(newState.phase).toBe("select-piece");
    expect(newState.selectedCard).toBe(cardToSelect);
  });

  test("should select card from tanuki hand when currentTurn is tanuki", () => {
    const state = { ...initialState, currentTurn: "tanuki" as const };
    const newState = selectCard(state, cards.frog);

    expect(newState.phase).toBe("select-piece");
    expect(newState.selectedCard).toBe(cards.frog);
  });

  test("should throw error if not in select-card phase", () => {
    const state = { ...initialState, phase: "select-piece" as const };
    const fn = () => selectCard(state, cards.tiger);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.WRONG_PHASE }),
    );
  });

  test("should throw error if card does not belong to current player", () => {
    const fn = () => selectCard(initialState, cards.frog);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.CARD_NOT_IN_HAND }),
    );
    expect(() => selectCard(initialState, initialState.waitingCard)).toThrow(
      expect.objectContaining({ code: ErrorCode.CARD_NOT_IN_HAND }),
    );
  });
});

describe("cancelSelection", () => {
  test("should reset selected card and piece, and set phase to select-card", () => {
    const state = {
      phase: "select-piece",
      selectedCard: cards.tiger,
    } as GameState;
    const newState = cancelSelection(state);

    expect(newState.phase).toBe("select-card");
    expect(newState.selectedCard).toBeNull();
  });

  test("should throw if not in select-piece phase", () => {
    const state = { phase: "select-card", selectedCard: null } as GameState;
    const fn = () => cancelSelection(state);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.WRONG_PHASE }),
    );
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

  test("should throw if used card is not in current player's hand", () => {
    const state = { ...initState(), currentTurn: "fox" as const };
    const invalidCard = state.tanukiCards[0];

    expect(() => cycleCard(state, invalidCard)).toThrow(GameError);
    expect(() => cycleCard(state, invalidCard)).toThrow(
      "Card does not belong to current player",
    );
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

describe("makeMove", () => {
  const state = {
    board: [
      [null, null, { player: "fox", type: "boss" }, null, null],
      [null, { player: "fox", type: "sibling" }, null, null, null],
      [null, null, { player: "tanuki", type: "sibling" }, null, null],
      [null, null, null, null, null],
      [null, null, null, { player: "tanuki", type: "boss" }, null],
    ],
    foxCards: [cards.tiger, cards.dragon],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.hawk,
    currentTurn: "fox",
    phase: "select-piece",
    selectedCard: cards.tiger,
    winner: null,
  } as GameState;

  test("should apply move, cycle card, and switch phase to select-card if no winner", () => {
    const from = [1, 1] as [number, number];
    const to = [0, 1] as [number, number];

    const newState = makeMove(state, from, to);

    expect(newState.board[0][1]).toEqual({ player: "fox", type: "sibling" });
    expect(newState.board[1][1]).toBeNull();
    expect(newState.waitingCard).toBe(cards.tiger);
    expect(newState.currentTurn).toBe("tanuki");
    expect(newState.phase).toBe("select-card");
  });

  test("should set winner and change phase to game-over if move results in win (tanuki)", () => {
    const winningState = {
      ...state,
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "boss" }, null, null, null],
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, null, null, null, null],
        [null, null, null, { player: "tanuki", type: "boss" }, null],
      ],
      currentTurn: "tanuki",
      selectedCard: cards.frog,
    } as GameState;
    // tanuki sibling at [2,2] uses frog move [-1,-1] to capture fox boss at [1,1]
    const newState = makeMove(winningState, [2, 2], [1, 1]);

    expect(newState.board[1][1]).toEqual({ player: "tanuki", type: "sibling" });
    expect(newState.board[2][2]).toBeNull();
    expect(newState.phase).toBe("game-over");
    expect(newState.winner).toBe("tanuki");
  });

  test("should set winner and change phase to game-over if move results in win (fox)", () => {
    const winningState = {
      ...state,
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, null, null, null, null],
        [null, null, null, { player: "tanuki", type: "boss" }, null],
      ],
      selectedCard: cards.tiger,
    } as GameState;
    // tiger from [2,2] can reach [4,2] (tanuki nest) via fox-mirrored move [2,0]
    const newState = makeMove(winningState, [2, 2], [4, 2]);

    expect(newState.board[4][2]).toEqual({ player: "fox", type: "boss" });
    expect(newState.board[2][2]).toBeNull();
    expect(newState.phase).toBe("game-over");
    expect(newState.winner).toBe("fox");
  });

  test("should throw error if phase is not 'select-piece'", () => {
    const invalidState = {
      ...state,
      phase: "select-card" as const,
    } as GameState;
    const fn = () => makeMove(invalidState, [1, 1], [0, 1]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.WRONG_PHASE }),
    );
  });

  test("should throw error if no card is selected", () => {
    const invalidState = { ...state, selectedCard: null } as GameState;
    const fn = () => makeMove(invalidState, [1, 1], [0, 1]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.NO_CARD_SELECTED }),
    );
  });

  test("should throw error if move is invalid according to selected card", () => {
    const invalidState = { ...state, selectedCard: cards.dragon } as GameState;
    // dragon fox-mirrored moves from [1,1]: [2,3], [0,2], [0,0] — [1,0] is not reachable
    const fn = () => makeMove(invalidState, [1, 1], [1, 0]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_MOVE }),
    );
  });

  test("should throw error if there is no piece at source position", () => {
    const fn = () => makeMove(state as GameState, [0, 0], [0, 1]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.NO_PIECE_AT_SOURCE }),
    );
  });

  test("should throw error if selected piece belongs to the opponent", () => {
    // [2,2] is a tanuki piece; fox cannot move it
    const fn = () => makeMove(state as GameState, [2, 2], [1, 2]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.OPPONENT_PIECE }),
    );
  });

  test("should throw error if from position is outside the board", () => {
    const fn = () => makeMove(state as GameState, [-1, 0], [0, 0]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.OUT_OF_BOUNDS }),
    );
  });
});
