import { describe, expect, test } from "vitest";
import { selectCard, cancelSelection, makeMove } from "./actions";
import { cards } from "./cards";

describe("selectCard", () => {
  const initialState = {
    phase: "select-card",
    currentTurn: "fox",
    foxCards: [cards.tiger, cards.dragon],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.hawk,
    selectedCard: null,
  };

  test("should update state with selected card and change phase to select-piece", () => {
    const cardToSelect = cards.tiger;
    const newState = selectCard(initialState as any, cardToSelect);

    expect(newState.phase).toBe("select-piece");
    expect(newState.selectedCard).toBe(cardToSelect);
  });

  test("should throw error if not in select-card phase", () => {
    const state = { ...initialState, phase: "select-piece" as const };
    expect(() => selectCard(state as any, cards.tiger)).toThrow(
      "Not in select-card phase",
    );
  });

  test("should throw error if card does not belong to current player", () => {
    expect(() => selectCard(initialState as any, cards.frog)).toThrow(
      "Card does not belong to current player",
    );
    expect(() =>
      selectCard(initialState as any, initialState.waitingCard),
    ).toThrow("Card does not belong to current player");
  });
});

describe("cancelSelection", () => {
  test("should reset selected card and piece, and set phase to select-card", () => {
    const state = {
      phase: "select-piece",
      selectedCard: cards.tiger,
    };
    const newState = cancelSelection(state as any);

    expect(newState.phase).toBe("select-card");
    expect(newState.selectedCard).toBeNull();
  });

  test("should throw if not in select-piece phase", () => {
    const state = { phase: "select-card", selectedCard: null };
    expect(() => cancelSelection(state as any)).toThrow(
      "Not in select-piece phase",
    );
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
  };

  test("should apply move, cycle card, and switch phase to select-card if no winner", () => {
    const from = [1, 1] as [number, number];
    const to = [0, 1] as [number, number];

    const newState = makeMove(state as any, from, to);

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
    };
    // tanuki sibling at [2,2] uses frog move [-1,-1] to capture fox boss at [1,1]
    const newState = makeMove(winningState as any, [2, 2], [1, 1]);

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
    };
    // tiger from [2,2] can reach [4,2] (tanuki nest) via fox-mirrored move [2,0]
    const newState = makeMove(winningState as any, [2, 2], [4, 2]);

    expect(newState.board[4][2]).toEqual({ player: "fox", type: "boss" });
    expect(newState.board[2][2]).toBeNull();
    expect(newState.phase).toBe("game-over");
    expect(newState.winner).toBe("fox");
  });

  test("should throw error if phase is not 'select-piece'", () => {
    const invalidState = { ...state, phase: "select-card" as const };
    expect(() => makeMove(invalidState as any, [1, 1], [0, 1])).toThrow(
      "Not in select-piece phase",
    );
  });

  test("should throw error if no card is selected", () => {
    const invalidState = { ...state, selectedCard: null };
    expect(() => makeMove(invalidState as any, [1, 1], [0, 1])).toThrow(
      "No card selected",
    );
  });

  test("should throw error if move is invalid according to selected card", () => {
    const invalidState = { ...state, selectedCard: cards.dragon };
    // dragon fox-mirrored moves from [1,1]: [2,3], [0,2], [0,0] — [1,0] is not reachable
    expect(() => makeMove(invalidState as any, [1, 1], [1, 0])).toThrow(
      "Invalid move for the selected card",
    );
  });

  test("should throw error if selected piece belongs to the opponent", () => {
    // [2,2] is a tanuki piece; fox cannot move it
    expect(() => makeMove(state as any, [2, 2], [1, 2])).toThrow(
      "Cannot move opponent's piece",
    );
  });
});
