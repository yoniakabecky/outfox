# @outfox/core

Game logic for **outfox** — state management, move validation, and win detection.

## Install

```sh
pnpm add @outfox/core
```

## Usage

```ts
import {
  initState,
  selectCard,
  cancelSelection,
  makeMove,
  getValidMoves,
  cards,
  GameError,
  ErrorCode,
} from "@outfox/core";
```

### Game loop

```ts
// 1. Initialize
let state = initState();
// state.currentTurn is set by the waiting card's stamp ("fox" | "tanuki")

// 2. Select a card from the current player's hand
state = selectCard(state, state.foxCards[0]);
// state.phase is now "select-piece"

// 3. Get valid destinations for a piece
const validMoves = getValidMoves(state, [0, 2], state.selectedCard!);
// returns [[row, col], ...]

// 4. Execute the move
state = makeMove(state, [0, 2], validMoves[0]);
// used card goes to waiting spot; waiting card enters hand; turn changes

// Cancel card selection and go back
state = cancelSelection(state);
```

### Win detection

`makeMove` checks for a winner automatically. When the game ends:

```ts
state.phase; // "game-over"
state.winner; // "fox" | "tanuki"
```

Win conditions:

- Capture the opponent's boss, or
- Move your boss to the opponent's nest (center of their back row).

### Error handling

Actions throw `GameError` on invalid input:

```ts
try {
  state = makeMove(state, from, to);
} catch (e) {
  if (e instanceof GameError) {
    console.error(e.code); // e.g. ErrorCode.INVALID_MOVE
  }
}
```

Error codes: `WRONG_PHASE`, `CARD_NOT_IN_HAND`, `NO_CARD_SELECTED`, `OPPONENT_PIECE`, `INVALID_MOVE`, `NO_PIECE_AT_SOURCE`, `FRIENDLY_FIRE`, `OUT_OF_BOUNDS`.

### Cards

```ts
import { cards } from "@outfox/core";

cards.tiger; // { name, moves: [[dr, dc], ...], stamp: "fox" | "tanuki" }
```

16 cards available: tiger, dragon, frog, rabbit, crane, elephant, monkey, weasel, horse, ox, goose, rooster, snake, cobra, boar, hawk.

## Types

```ts
type Player = "fox" | "tanuki";
type PieceType = "boss" | "sibling";
type Cell = { player: Player; type: PieceType } | null;
type Board = Cell[][]; // 5×5, [row][col]

type GameState = {
  board: Board;
  foxCards: Hand;
  tanukiCards: Hand;
  waitingCard: Card;
  currentTurn: Player;
  phase: "select-card" | "select-piece" | "game-over";
  selectedCard: Card | null;
  winner: Player | null;
};
```

## Development

```sh
pnpm build   # compile TypeScript
pnpm test    # run vitest
pnpm dev     # watch mode
```
