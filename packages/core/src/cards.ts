import type { Card, CardName } from "./types";

export const cards: Record<CardName, Card> = {
  frog: {
    name: "frog",
    moves: [
      [-2, 0],
      [0, -1],
      [1, 1],
    ],
    stamp: "fox",
  },
  rabbit: {
    name: "rabbit",
    moves: [
      [-1, 0],
      [-2, 0],
      [-1, 1],
    ],
    stamp: "tanuki",
  },
  monkey: {
    name: "monkey",
    moves: [
      [-1, 1],
      [-1, -1],
      [1, 1],
      [1, -1],
    ],
    stamp: "tanuki",
  },
  horse: {
    name: "horse",
    moves: [
      [-2, 1],
      [-2, -1],
      [-1, 2],
      [-1, -2],
    ],
    stamp: "fox",
  },
  boar: {
    name: "boar",
    moves: [
      [-1, 0],
      [-2, 0],
      [-3, 0],
    ],
    stamp: "fox",
  },
  hawk: {
    name: "hawk",
    moves: [
      [-2, 0],
      [-1, 1],
      [-1, -1],
    ],
    stamp: "tanuki",
  },
  deer: {
    name: "deer",
    moves: [
      [0, 2],
      [0, -2],
      [1, 0],
    ],
    stamp: "fox",
  },
  bear: {
    name: "bear",
    moves: [
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    stamp: "tanuki",
  },
  squirrel: {
    name: "squirrel",
    moves: [
      [0, 1],
      [0, -1],
      [-1, 1],
      [1, -1],
    ],
    stamp: "fox",
  },
  goat: {
    name: "goat",
    moves: [
      [-1, 0],
      [1, 0],
      [-1, 1],
      [-1, -1],
    ],
    stamp: "tanuki",
  },
};

export const dealCards = (): [Card, Card, Card, Card, Card] => {
  const pool = Object.values(cards);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1], pool[2], pool[3], pool[4]];
};
