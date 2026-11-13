import { describe, expect, it } from "vitest";
import { chapters, findChapter } from "../coaching";
import { classForms, percentChart } from "../coaching/percentages";
import { findDrill } from "@/lib/engines/drills";

/**
 * Digit-by-digit long division, kept independent of the engines' formula, so the
 * values typed from my notes are checked against exact arithmetic.
 */
function truncatedPercent(k: number, n: number): string {
  let remainder = k * 100;
  const whole = Math.floor(remainder / n);
  remainder %= n;
  let decimals = "";
  for (let i = 0; i < 2; i++) {
    remainder *= 10;
    decimals += Math.floor(remainder / n);
    remainder %= n;
  }
  const trimmed = decimals.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : String(whole);
}

describe("coaching content", () => {
  it("has unique chapter ids and unique trick ids within each chapter", () => {
    const chapterIds = chapters.map((chapter) => chapter.id);
    expect(new Set(chapterIds).size).toBe(chapterIds.length);
    for (const chapter of chapters) {
      const trickIds = chapter.tricks.map((trick) => trick.id);
      expect(new Set(trickIds).size).toBe(trickIds.length);
    }
  });

  it("gives every trick a rule and at least one drill", () => {
    for (const chapter of chapters) {
      for (const trick of chapter.tricks) {
        expect(trick.rule.length).toBeGreaterThan(0);
        expect(trick.drills.length).toBeGreaterThan(0);
      }
    }
  });

  it("only refers to drills that exist", () => {
    for (const chapter of chapters) {
      for (const trick of chapter.tricks) {
        for (const drill of trick.drills) expect(findDrill(drill)).toBeDefined();
      }
    }
  });

  it("finds chapters by id", () => {
    expect(findChapter("percentages")?.title).toBe("Percentages");
    expect(findChapter("nope")).toBeUndefined();
  });

  it("covers 1/2 to 1/20 in order", () => {
    expect(percentChart.map((form) => form.n)).toEqual(
      Array.from({ length: 19 }, (_, i) => i + 2)
    );
  });

  it.each([...percentChart, ...classForms])(
    "$k/$n is written as its truncated value ($percent%)",
    ({ k, n, percent }) => {
      expect(percent).toBe(truncatedPercent(k, n));
    }
  );

  it("matches the values in my class notes", () => {
    const byFraction = Object.fromEntries(
      [...percentChart, ...classForms].map((form) => [`${form.k}/${form.n}`, form.percent])
    );
    expect(byFraction).toMatchObject({
      "1/6": "16.66",
      "1/7": "14.28",
      "1/17": "5.88",
      "1/18": "5.55",
      "1/19": "5.26",
      "4/9": "44.44",
      "5/8": "62.5",
      "4/3": "133.33",
    });
  });
});
