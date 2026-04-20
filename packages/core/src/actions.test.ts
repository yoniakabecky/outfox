import { describe, expect, test } from "vitest";
import { cancelSelection, makeMove, placeSnack, selectCard } from "./actions";
import { cards } from "./cards";
import { ErrorCode, GameError } from "./errors";
import type { GameState } from "./types";

describe("placeSnack", () => {
  const board: GameState["board"] = [
    [null, null, { player: "tanuki", type: "boss" }, null, null],
    [{ player: "tanuki", type: "sibling" }, null, null, null, { player: "tanuki", type: "sibling" }],
    [null, null, null, null, null],
    [{ player: "fox", type: "sibling" }, null, null, null, { player: "fox", type: "sibling" }],
    [null, null, { player: "fox", type: "boss" }, null, null],
  ];

  const baseState: GameState = {
    board,
    foxCards: [cards.hawk, cards.horse],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.bear,
    currentTurn: "fox",
    phase: "hide-snack",
    selectedCard: null,
    winner: null,
    foxPoints: 0,
    tanukiPoints: 0,
    foxSnack: null,
    tanukiSnack: null,
  };

  test("should throw WRONG_PHASE if not in hide-snack", () => {
    const state = { ...baseState, phase: "select-card" as const };
    const fn = () => placeSnack(state, "fox", [3, 1]);
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.WRONG_PHASE }));
  });

  test("should throw OUT_OF_BOUNDS for invalid position", () => {
    const fn = () => placeSnack(baseState, "fox", [-1, 0]);
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.OUT_OF_BOUNDS }));
  });

  test("should throw INVALID_SNACK_PLACEMENT when fox places in tanuki half (rows 0-1)", () => {
    const fn = () => placeSnack(baseState, "fox", [0, 2]);
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.INVALID_SNACK_PLACEMENT }));
  });

  test("should throw INVALID_SNACK_PLACEMENT when tanuki places in fox half (rows 3-4)", () => {
    const fn = () => placeSnack(baseState, "tanuki", [4, 2]);
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.INVALID_SNACK_PLACEMENT }));
  });

  test("should throw INVALID_SNACK_PLACEMENT when cell is occupied", () => {
    const fn = () => placeSnack(baseState, "fox", [3, 0]); // fox sibling is there
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.INVALID_SNACK_PLACEMENT }));
  });

  test("should throw INVALID_SNACK_PLACEMENT if player already placed", () => {
    const state = { ...baseState, foxSnack: [3, 1] as [number, number] };
    const fn = () => placeSnack(state, "fox", [3, 2]);
    expect(fn).toThrow(expect.objectContaining({ code: ErrorCode.INVALID_SNACK_PLACEMENT }));
  });

  test("should set foxSnack and stay in hide-snack when only fox has placed", () => {
    const newState = placeSnack(baseState, "fox", [3, 1]);
    expect(newState.foxSnack).toEqual([3, 1]);
    expect(newState.tanukiSnack).toBeNull();
    expect(newState.phase).toBe("hide-snack");
  });

  test("should set tanukiSnack and stay in hide-snack when only tanuki has placed", () => {
    const newState = placeSnack(baseState, "tanuki", [1, 1]);
    expect(newState.tanukiSnack).toEqual([1, 1]);
    expect(newState.foxSnack).toBeNull();
    expect(newState.phase).toBe("hide-snack");
  });

  test("should transition to select-card once both players have placed", () => {
    const afterFox = placeSnack(baseState, "fox", [3, 1]);
    const afterBoth = placeSnack(afterFox, "tanuki", [1, 1]);
    expect(afterBoth.foxSnack).toEqual([3, 1]);
    expect(afterBoth.tanukiSnack).toEqual([1, 1]);
    expect(afterBoth.phase).toBe("select-card");
    expect(afterBoth.currentTurn).toBe(baseState.currentTurn);
  });

  test("should transition to select-card regardless of placement order", () => {
    const afterTanuki = placeSnack(baseState, "tanuki", [0, 1]);
    const afterBoth = placeSnack(afterTanuki, "fox", [4, 1]);
    expect(afterBoth.phase).toBe("select-card");
    expect(afterBoth.foxSnack).toEqual([4, 1]);
    expect(afterBoth.tanukiSnack).toEqual([0, 1]);
  });
});

describe("selectCard", () => {
  const initialState = {
    phase: "select-card",
    currentTurn: "fox",
    foxCards: [cards.hawk, cards.horse],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.bear,
    selectedCard: null,
  } as GameState;

  test("should update state with selected card and change phase to select-piece", () => {
    const cardToSelect = cards.hawk;
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
    const fn = () => selectCard(state, cards.hawk);
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
      selectedCard: cards.hawk,
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

describe("makeMove", () => {
  const state = {
    board: [
      [null, null, { player: "fox", type: "boss" }, null, null],
      [null, { player: "fox", type: "sibling" }, null, null, null],
      [null, null, { player: "tanuki", type: "sibling" }, null, null],
      [null, null, null, null, null],
      [null, null, null, { player: "tanuki", type: "boss" }, null],
    ],
    foxCards: [cards.hawk, cards.horse],
    tanukiCards: [cards.frog, cards.monkey],
    waitingCard: cards.bear,
    currentTurn: "fox",
    phase: "select-piece",
    selectedCard: cards.hawk,
    winner: null,
    foxPoints: 0,
    tanukiPoints: 0,
  } as GameState;

  test("should apply move, cycle card, and switch phase to select-card if no winner", () => {
    // hawk fox-mirrored from [1,1]: [2,0],[1,-1],[1,1] → [3,1],[2,0],[2,2]; use [3,1]
    const from = [1, 1] as [number, number];
    const to = [3, 1] as [number, number];

    const newState = makeMove(state, from, to);

    expect(newState.board[3][1]).toEqual({ player: "fox", type: "sibling" });
    expect(newState.board[1][1]).toBeNull();
    expect(newState.waitingCard).toBe(cards.hawk);
    expect(newState.currentTurn).toBe("tanuki");
    expect(newState.phase).toBe("select-card");
  });

  test("should award 1 point when capturing a sibling (no game-over)", () => {
    // hawk fox-mirrored from [1,1]: [+1,+1] → [2,2] (tanuki sibling)
    const newState = makeMove(state, [1, 1], [2, 2]);

    expect(newState.foxPoints).toBe(1);
    expect(newState.tanukiPoints).toBe(0);
    expect(newState.phase).toBe("select-card");
    expect(newState.winner).toBeNull();
  });

  test("should award 3 points when capturing a boss and trigger game-over at 5", () => {
    const winningState = {
      ...state,
      board: [
        [null, null, null, null, null],
        [null, { player: "fox", type: "sibling" }, null, null, null],
        [null, null, { player: "tanuki", type: "boss" }, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
      ],
      foxPoints: 2, // 2 + 3 = 5 → win
    } as GameState;
    // hawk fox-mirrored from [1,1]: [+1,+1] → [2,2] (tanuki boss)
    const newState = makeMove(winningState, [1, 1], [2, 2]);

    expect(newState.foxPoints).toBe(5);
    expect(newState.phase).toBe("game-over");
    expect(newState.winner).toBe("fox");
  });

  test("should trigger game-over for tanuki when capturing boss at 5 points", () => {
    const winningState = {
      ...state,
      board: [
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, null, null, null, null],
        [null, null, { player: "tanuki", type: "sibling" }, null, null],
        [null, null, null, null, null],
        [null, null, null, { player: "tanuki", type: "boss" }, null],
      ],
      currentTurn: "tanuki",
      selectedCard: cards.frog,
      tanukiPoints: 2, // 2 + 3 = 5 → win
    } as GameState;
    // tanuki sibling at [2,2] uses frog move [-2,0] to capture fox boss at [0,2]
    const newState = makeMove(winningState, [2, 2], [0, 2]);

    expect(newState.tanukiPoints).toBe(5);
    expect(newState.phase).toBe("game-over");
    expect(newState.winner).toBe("tanuki");
  });

  test("should throw error if phase is not 'select-piece'", () => {
    const invalidState = {
      ...state,
      phase: "select-card" as const,
    } as GameState;
    const fn = () => makeMove(invalidState, [1, 1], [3, 1]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.WRONG_PHASE }),
    );
  });

  test("should throw error if no card is selected", () => {
    const invalidState = { ...state, selectedCard: null } as GameState;
    const fn = () => makeMove(invalidState, [1, 1], [3, 1]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.NO_CARD_SELECTED }),
    );
  });

  test("should throw error if move is invalid according to selected card", () => {
    const invalidState = { ...state, selectedCard: cards.horse } as GameState;
    // horse fox-mirrored moves from [1,1]: [3,0],[3,2],[2,3] — [1,0] is not reachable
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

  test("should throw error if to position is outside the board", () => {
    const fn = () => makeMove(state as GameState, [1, 1], [5, 5]);
    expect(fn).toThrow(GameError);
    expect(fn).toThrow(
      expect.objectContaining({ code: ErrorCode.OUT_OF_BOUNDS }),
    );
  });

  test("should cycle card and switch turns for tanuki", () => {
    const tanukiState = {
      ...state,
      board: [
        [null, null, { player: "fox", type: "boss" }, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [
          null,
          { player: "tanuki", type: "sibling" },
          null,
          { player: "tanuki", type: "boss" },
          null,
        ],
      ],
      currentTurn: "tanuki" as const,
      selectedCard: cards.frog, // frog tanuki moves from [4,1]: [-2,0]→[2,1], [0,-1]→[4,0], [1,1]→[5,2 OOB]
    } as GameState;
    const newState = makeMove(tanukiState, [4, 1], [2, 1]);

    expect(newState.currentTurn).toBe("fox");
    expect(newState.waitingCard).toBe(cards.frog);
    expect(newState.tanukiCards).toContain(cards.bear); // old waitingCard enters hand
    expect(newState.tanukiCards).not.toContain(cards.frog);
    expect(newState.phase).toBe("select-card");
  });

  test("should place the waiting card at the same hand index as the used card", () => {
    // Use foxCards[1] = horse; horse fox-mirrored from [1,1]: [3,0],[3,2],[2,3]
    const newState = makeMove(
      { ...state, selectedCard: cards.horse } as GameState,
      [1, 1],
      [3, 2],
    );

    expect(newState.foxCards[1]).toBe(cards.bear); // waiting card fills slot 1 (horse's slot)
    expect(newState.foxCards[0]).toBe(cards.hawk); // slot 0 unchanged
    expect(newState.waitingCard).toBe(cards.horse); // used card becomes new waiting
  });
});
