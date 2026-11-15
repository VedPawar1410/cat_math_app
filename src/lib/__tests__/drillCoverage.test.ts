import { describe, expect, it } from "vitest";
import { createShuffleDraw } from "../engines/drillTypes";
import { formsForLevel } from "../engines/fractionPercentEngine";
import { multipleForms } from "../engines/percentOfEngine";
import { drills } from "../engines/drills";
import { percentChart } from "@/content/coaching/percentages";

/** Draws a full round from a session's deck and returns what each question was about. */
function round<T>(count: number, make: (draw: ReturnType<typeof createShuffleDraw>) => T) {
  const draw = createShuffleDraw();
  return Array.from({ length: count }, () => make(draw));
}

describe("shuffled deck", () => {
  it("deals every item once per round, 20 rounds in a row", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];
    const draw = createShuffleDraw();
    for (let r = 0; r < 20; r++) {
      const dealt = items.map(() => draw(items, "pool"));
      expect([...dealt].sort()).toEqual(items);
    }
  });

  it("never shows the same item twice in a row, even across a reshuffle", () => {
    const items = [1, 2, 3];
    const draw = createShuffleDraw();
    let previous: number | undefined;
    for (let i = 0; i < 3000; i++) {
      const next = draw(items, "pool");
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it("keeps separate pools apart", () => {
    const draw = createShuffleDraw();
    const a = [1, 2, 3].map(() => draw([1, 2, 3], "one"));
    const b = [1, 2, 3].map(() => draw([1, 2, 3], "two"));
    expect([...a].sort()).toEqual([1, 2, 3]);
    expect([...b].sort()).toEqual([1, 2, 3]);
  });
});

describe("a session covers every question before repeating", () => {
  it.each([1, 2, 3])("fraction to %, level %i: one round asks every fraction once", (level) => {
    const forms = formsForLevel(level);
    const asked = round(forms.length, (draw) => drills["fraction-to-percent"].generate(level, draw).display);
    expect(new Set(asked).size).toBe(forms.length);
  });

  it.each([1, 2, 3])("percent to fraction, level %i: one round asks every percentage once", (level) => {
    const forms = formsForLevel(level);
    const asked = round(forms.length, (draw) => drills["percent-to-fraction"].generate(level, draw).display);
    expect(new Set(asked).size).toBe(forms.length);
  });

  it("x% of N: every chart fraction at level 1, and every multiple and split at level 2", () => {
    const level1 = round(percentChart.length, (draw) => drills["percent-of"].generate(1, draw).facts.percent);
    expect(new Set(level1).size).toBe(percentChart.length);
    const level2 = round(multipleForms.length, (draw) => drills["percent-of"].generate(2, draw).facts.percent);
    expect(new Set(level2).size).toBe(multipleForms.length);
  });

  it("more vs less, level 1: all 36 ladder questions inside the chart", () => {
    const asked = round(36, (draw) => {
      const f = drills["more-less"].generate(1, draw).facts;
      return `${f.given}-${f.givenN}`;
    });
    expect(new Set(asked).size).toBe(36);
  });

  it.each([
    ["squares", 25, "base"],
    ["square-roots", 25, "radicand"],
    ["cubes", 14, "base"],
    ["cube-roots", 14, "radicand"],
  ] as const)("%s: one round asks all %i once", (id, count, fact) => {
    const asked = round(count, (draw) => drills[id].generate(1, draw).facts[fact]);
    expect(new Set(asked).size).toBe(count);
  });

  it("tables: all 143 questions (13 to 25 × 2 to 12) once per round", () => {
    const asked = round(143, (draw) => drills.tables.generate(1, draw).display);
    expect(new Set(asked).size).toBe(143);
  });

  it("random picks, for comparison, usually miss some in one round", () => {
    // Why the deck exists: 9 independent picks from 9 forms rarely cover all 9
    const forms = formsForLevel(1);
    let fullRounds = 0;
    for (let i = 0; i < 1000; i++) {
      const asked = forms.map(() => drills["fraction-to-percent"].generate(1).display);
      if (new Set(asked).size === forms.length) fullRounds++;
    }
    expect(fullRounds).toBeLessThan(50);
  });
});
