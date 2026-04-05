import type { Card, CardName } from "./types";

export const cards: Record<CardName, Card> = {
  tiger: {
    name: "tiger",
    moves: [
      [-2, 0],
      [1, 0],
    ],
    stamp: "fox",
  },
  dragon: {
    name: "dragon",
    moves: [
      [-1, -2],
      [-1, 2],
      [1, -1],
      [1, 1],
    ],
    stamp: "tanuki",
  },
  frog: {
    name: "frog",
    moves: [
      [0, -2],
      [-1, -1],
      [1, 1],
    ],
    stamp: "fox",
  },
  rabbit: {
    name: "rabbit",
    moves: [
      [0, 2],
      [-1, 1],
      [1, -1],
    ],
    stamp: "tanuki",
  },
  crane: {
    name: "crane",
    moves: [
      [-1, 0],
      [1, -1],
      [1, 1],
    ],
    stamp: "tanuki",
  },
  elephant: {
    name: "elephant",
    moves: [
      [-1, -1],
      [-1, 1],
      [0, -1],
      [0, 1],
    ],
    stamp: "fox",
  },
  monkey: {
    name: "monkey",
    moves: [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ],
    stamp: "tanuki",
  },
  weasel: {
    name: "weasel",
    moves: [
      [-1, -1],
      [-1, 1],
      [1, 0],
    ],
    stamp: "fox",
  },
  horse: {
    name: "horse",
    moves: [
      [-1, 0],
      [1, 0],
      [0, -1],
    ],
    stamp: "fox",
  },
  ox: {
    name: "ox",
    moves: [
      [-1, 0],
      [1, 0],
      [0, 1],
    ],
    stamp: "tanuki",
  },
  goose: {
    name: "goose",
    moves: [
      [0, -1],
      [-1, -1],
      [0, 1],
      [1, 1],
    ],
    stamp: "fox",
  },
  rooster: {
    name: "rooster",
    moves: [
      [0, 1],
      [-1, 1],
      [0, -1],
      [1, -1],
    ],
    stamp: "tanuki",
  },
  snake: {
    name: "snake",
    moves: [
      [-1, -1],
      [1, -1],
      [0, 1],
    ],
    stamp: "tanuki",
  },
  cobra: {
    name: "cobra",
    moves: [
      [-1, 1],
      [1, 1],
      [0, -1],
    ],
    stamp: "fox",
  },
  boar: {
    name: "boar",
    moves: [
      [-1, 0],
      [0, -1],
      [0, 1],
    ],
    stamp: "fox",
  },
  hawk: {
    name: "hawk",
    moves: [
      [-1, 0],
      [0, -2],
      [0, 2],
    ],
    stamp: "tanuki",
  },
};

export const dealCards = (): [Card, Card, Card, Card, Card] => {
  const pool = Object.values(cards) as Card[];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1], pool[2], pool[3], pool[4]];
};
