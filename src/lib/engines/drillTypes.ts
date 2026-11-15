import type { DrillId } from "@/content/coaching/types";
import type { Grade } from "./percentMath";

export type AnswerKind = "integer" | "percent" | "fraction";

export interface DrillQuestion {
  /** What the screen shows, e.g. "3/7" or "A is 25% less than B. ...". */
  display: string;
  /** What the live region reads out. */
  spoken: string;
  answerKind: AnswerKind;
  /** The answer as shown after the question, e.g. "42.85%". */
  answer: string;
  grade: (input: string) => Grade;
  /** Shown after a wrong answer. */
  explanation: string;
  /** The numbers behind the question, so tests can check it independently. */
  facts: Record<string, number | string>;
}

export interface DrillLevel {
  level: number;
  label: string;
}

export interface DrillDefinition {
  id: DrillId;
  title: string;
  levels: DrillLevel[];
  /** `draw` picks from each pool; pass a shuffle draw so a session covers every item. */
  generate: (level: number, draw?: Draw) => DrillQuestion;
}

/** Picks one item from a pool. `poolKey` names the pool so a draw can track each one separately. */
export type Draw = <T>(items: readonly T[], poolKey: string) => T;

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Independent random picks. Fine for tests, but a short session repeats some items and skips others. */
export const randomDraw: Draw = (items) => pick(items);

/**
 * Deals every item in a pool once, in random order, before any item repeats,
 * like a shuffled deck. When a pool runs out it is reshuffled, never starting
 * with the item just shown.
 */
export function createShuffleDraw(random: () => number = Math.random): Draw {
  const decks = new Map<string, number[]>();
  const lastShown = new Map<string, number>();

  return <T>(items: readonly T[], poolKey: string): T => {
    const key = `${poolKey}:${items.length}`;
    let deck = decks.get(key);
    if (!deck || deck.length === 0) {
      deck = items.map((_, index) => index);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // Cards are dealt from the end; don't repeat the last item across a reshuffle
      const top = deck.length - 1;
      if (deck.length > 1 && deck[top] === lastShown.get(key)) [deck[0], deck[top]] = [deck[top], deck[0]];
      decks.set(key, deck);
    }
    const index = deck.pop() as number;
    lastShown.set(key, index);
    return items[index];
  };
}

/** Whole numbers from min to max, inclusive. */
export function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}
