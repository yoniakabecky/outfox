// biome-ignore format: readability
export const ErrorCode = {
  WRONG_PHASE:              "WRONG_PHASE",              // action called in the wrong game phase
  CARD_NOT_IN_HAND:         "CARD_NOT_IN_HAND",         // selected card not in current player's hand
  NO_CARD_SELECTED:         "NO_CARD_SELECTED",         // makeMove called with no card selected
  OPPONENT_PIECE:           "OPPONENT_PIECE",           // tried to move the opponent's piece
  INVALID_MOVE:             "INVALID_MOVE",             // destination not reachable with selected card
  NO_PIECE_AT_SOURCE:       "NO_PIECE_AT_SOURCE",       // applyMove called with empty source cell
  OUT_OF_BOUNDS:            "OUT_OF_BOUNDS",            // source position is outside the board
  INVALID_SNACK_PLACEMENT:  "INVALID_SNACK_PLACEMENT",  // wrong half of board, or already placed
  INVALID_GAME_STATE:       "INVALID_GAME_STATE",       // e.g. both bosses captured at the same time (should never happen)
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class GameError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "GameError";
    this.code = code;
  }
}
