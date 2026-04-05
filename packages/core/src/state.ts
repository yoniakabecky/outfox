import type { Board } from "./types";

const initialBoard: Board = [
  [
    { player: "fox", type: "sibling" },
    { player: "fox", type: "sibling" },
    { player: "fox", type: "boss" },
    { player: "fox", type: "sibling" },
    { player: "fox", type: "sibling" },
  ],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "boss" },
    { player: "tanuki", type: "sibling" },
    { player: "tanuki", type: "sibling" },
  ],
];
