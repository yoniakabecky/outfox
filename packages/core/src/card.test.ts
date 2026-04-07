import { describe, expect, test } from "vitest";
import { dealCards } from "./cards";

describe("dealCards", () => {
  test("should return 5 cards", () => {
    const cards = dealCards();
    expect(cards).toHaveLength(5);
  });

  test("should return unique cards", () => {
    const cards = dealCards();
    const uniqueCards = new Set(cards.map((card) => card.name));
    expect(uniqueCards.size).toBe(cards.length);
  });

  test("should shuffle cards randomly across calls", () => {
    const results = new Set(
      Array.from({ length: 20 }, () =>
        dealCards()
          .map((card) => card.name)
          .join(","),
      ),
    );
    expect(results.size).toBeGreaterThan(1);
  });
});
