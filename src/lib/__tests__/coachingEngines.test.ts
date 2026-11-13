import { describe, expect, it } from "vitest";
import {
  describeExact,
  formatPercent,
  fractionsEqual,
  gradeFraction,
  gradeInteger,
  gradePercent,
  parseFraction,
  roundedHundredths,
  truncatedHundredths,
  formatHundredths,
} from "../engines/percentMath";
import { formsForLevel, generateFractionToPercent, generatePercentToFraction } from "../engines/fractionPercentEngine";
import {
  generateCube,
  generateCubeRoot,
  generateSquare,
  generateSquareRoot,
  generateTable,
} from "../engines/memoryBankEngine";
import { generatePercentOf } from "../engines/percentOfEngine";
import { generateMoreLess, OFF_CHART } from "../engines/moreLessEngine";
import { drills, findDrill } from "../engines/drills";
import { roundedPercent, sameRatio, timesByAdding, truncatedPercent } from "./exactArithmetic";

const SAMPLES = 2000;
const sample = <T,>(make: () => T, count = SAMPLES) => Array.from({ length: count }, make);

describe("percentMath", () => {
  it("cuts off and rounds like exact long division, for every k/n up to 1/200", () => {
    for (let n = 1; n <= 200; n++) {
      for (let k = 1; k <= 3 * n; k++) {
        expect(formatHundredths(truncatedHundredths({ k, n }))).toBe(truncatedPercent(k, n));
        expect(formatHundredths(roundedHundredths({ k, n }))).toBe(roundedPercent(k, n));
      }
    }
  });

  it.each([
    ["42.85", true],
    ["42.86", true],
    ["42.857", true],
    ["42.84", false],
    ["42.8", false],
    ["43", false],
    ["", false],
    ["4285", false],
    ["abc", false],
  ])("grades %s for 3/7 as correct = %s", (input, correct) => {
    expect(gradePercent(input, { k: 3, n: 7 }).correct).toBe(correct);
  });

  it("explains the 3 × 14.28 slip", () => {
    const grade = gradePercent("42.84", { k: 3, n: 7 });
    expect(grade.trap).toContain("3 × 14.28");
    expect(grade.trap).toContain("42.857…");
  });

  it("accepts the chart value or the rounded value for 1/6, and nothing else", () => {
    expect(gradePercent("16.66", { k: 1, n: 6 }).correct).toBe(true);
    expect(gradePercent("16.67", { k: 1, n: 6 }).correct).toBe(true);
    expect(gradePercent("16.666", { k: 1, n: 6 }).correct).toBe(true);
    expect(gradePercent("16.65", { k: 1, n: 6 }).correct).toBe(false);
    expect(gradePercent("25", { k: 1, n: 4 }).correct).toBe(true);
    expect(gradePercent("25.00", { k: 1, n: 4 }).correct).toBe(true);
  });

  it("doesn't flag a correct multiple as a trap", () => {
    // 2 × 33.33 = 66.66 is also the cut-off value of 2/3
    expect(gradePercent("66.66", { k: 2, n: 3 })).toEqual({ correct: true });
    expect(gradePercent("133.32", { k: 4, n: 3 }).trap).toBeDefined();
  });

  it("describes exact values", () => {
    expect(describeExact({ k: 3, n: 7 })).toBe("42.857…");
    expect(describeExact({ k: 1, n: 8 })).toBe("12.5");
  });

  it("compares fractions by cross-multiplying", () => {
    expect(parseFraction("4/3")).toEqual({ k: 4, n: 3 });
    expect(parseFraction(" 8 / 6 ")).toEqual({ k: 8, n: 6 });
    expect(parseFraction("4/0")).toBeNull();
    expect(parseFraction("0/3")).toBeNull();
    expect(parseFraction("1.5/3")).toBeNull();
    for (let a = 1; a <= 30; a++) {
      for (let b = 1; b <= 30; b++) {
        expect(fractionsEqual({ k: a, n: b }, { k: 4, n: 3 })).toBe(sameRatio(a, b, 4, 3));
      }
    }
    expect(gradeFraction("8/6", { k: 4, n: 3 }).correct).toBe(true);
    expect(gradeFraction("3/4", { k: 4, n: 3 }).correct).toBe(false);
  });

  it("grades whole numbers strictly", () => {
    expect(gradeInteger("48", 48).correct).toBe(true);
    expect(gradeInteger("48.0", 48).correct).toBe(false);
    expect(gradeInteger("-48", 48).correct).toBe(false);
  });
});

describe("fraction and % drills", () => {
  it.each([1, 2, 3])("level %i asks only its own forms and accepts the shown answer", (level) => {
    const allowed = new Set(formsForLevel(level).map((form) => `${form.k}/${form.n}`));
    for (const question of sample(() => generateFractionToPercent(level))) {
      const { k, n, percent } = question.facts as { k: number; n: number; percent: string };
      expect(allowed.has(`${k}/${n}`)).toBe(true);
      expect(percent).toBe(truncatedPercent(k, n));
      expect(question.grade(percent).correct).toBe(true);
      expect(question.grade(roundedPercent(k, n)).correct).toBe(true);
    }
  });

  it("keeps the levels apart: 1/2 to 1/10, then 1/11 to 1/20, then the class forms", () => {
    expect(formsForLevel(1).map((f) => f.n)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(formsForLevel(2).map((f) => f.n)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(formsForLevel(3).map((f) => `${f.k}/${f.n}`)).toContain("4/3");
  });

  it.each([1, 2, 3])("level %i % to fraction accepts equivalent fractions", (level) => {
    for (const question of sample(() => generatePercentToFraction(level), 500)) {
      const { k, n } = question.facts as { k: number; n: number };
      expect(question.grade(`${k}/${n}`).correct).toBe(true);
      expect(question.grade(`${k * 3}/${n * 3}`).correct).toBe(true);
      expect(question.grade(`${k + 1}/${n}`).correct).toBe(false);
    }
  });
});

describe("memory bank drills", () => {
  it("squares 6 to 30, checked by repeated addition", () => {
    for (const question of sample(generateSquare)) {
      const base = Number(question.facts.base);
      expect(base).toBeGreaterThanOrEqual(6);
      expect(base).toBeLessThanOrEqual(30);
      expect(question.answer).toBe(String(timesByAdding(base, base)));
    }
  });

  it("square roots multiply back to the number shown", () => {
    for (const question of sample(generateSquareRoot)) {
      const root = Number(question.answer);
      expect(timesByAdding(root, root)).toBe(Number(question.facts.radicand));
      expect(root).toBeGreaterThanOrEqual(6);
      expect(root).toBeLessThanOrEqual(30);
    }
  });

  it("cubes 2 to 15 and cube roots, checked by repeated addition", () => {
    for (const question of sample(generateCube)) {
      const base = Number(question.facts.base);
      expect(question.answer).toBe(String(timesByAdding(timesByAdding(base, base), base)));
      expect(base).toBeGreaterThanOrEqual(2);
      expect(base).toBeLessThanOrEqual(15);
    }
    for (const question of sample(generateCubeRoot)) {
      const root = Number(question.answer);
      expect(timesByAdding(timesByAdding(root, root), root)).toBe(Number(question.facts.radicand));
    }
  });

  it("tables 13 to 25 times 2 to 12", () => {
    for (const question of sample(generateTable)) {
      const base = Number(question.facts.base);
      const times = Number(question.facts.times);
      expect(base).toBeGreaterThanOrEqual(13);
      expect(base).toBeLessThanOrEqual(25);
      expect(times).toBeGreaterThanOrEqual(2);
      expect(times).toBeLessThanOrEqual(12);
      expect(question.answer).toBe(String(timesByAdding(base, times)));
    }
  });
});

describe("x% of N drill", () => {
  it.each([1, 2])("level %i: answer × n = N × k, a whole number, with the % shown cut off", (level) => {
    for (const question of sample(() => generatePercentOf(level))) {
      const { k, n, number, percent } = question.facts as { k: number; n: number; number: number; percent: string };
      expect(/^\d+$/.test(question.answer)).toBe(true);
      expect(sameRatio(Number(question.answer), number, k, n)).toBe(true);
      expect(percent).toBe(truncatedPercent(k, n));
      expect(question.display.startsWith(`${percent}% of `)).toBe(true);
    }
  });

  it("level 3: a% of e is the whole-number answer", () => {
    for (const question of sample(() => generatePercentOf(3))) {
      const { tenths, e } = question.facts as { tenths: number; e: number };
      // (tenths / 10)% of e = answer  ⇔  answer × 1000 = tenths × e
      expect(BigInt(question.answer) * BigInt(1000)).toBe(BigInt(tenths) * BigInt(e));
      expect(question.grade(question.answer).correct).toBe(true);
    }
  });

  it("includes the class examples' percentages", () => {
    const seen = new Set(sample(() => generatePercentOf(2), 4000).map((q) => q.facts.percent));
    for (const percent of ["44.44", "62.5", "87.5", "56.66", "143.33", "67.5"]) {
      expect(seen.has(percent)).toBe(true);
    }
  });
});

describe("more vs less drill", () => {
  /** Works the question with concrete numbers: B = 100 × given denominator. */
  function expectedFromNumbers(given: string, givenK: number, givenN: number): [bigint, bigint] {
    const b = BigInt(givenN) * BigInt(100);
    const diff = (b * BigInt(givenK)) / BigInt(givenN);
    const a = given === "more" ? b + diff : b - diff;
    return [diff, a];
  }

  it.each([1, 2])("level %i matches the answer worked with real numbers", (level) => {
    for (const question of sample(() => generateMoreLess(level))) {
      const f = question.facts as Record<string, number | string>;
      const [diff, a] = expectedFromNumbers(String(f.given), Number(f.givenK), Number(f.givenN));
      expect(sameRatio(Number(f.answerK), Number(f.answerN), diff, a)).toBe(true);
      expect(question.grade(question.answer.replace("%", "")).correct).toBe(true);
    }
  });

  it("level 1 uses only the chart: the given and the answer are both 1/2 to 1/20", () => {
    for (const question of sample(() => generateMoreLess(1))) {
      const f = question.facts as Record<string, number | string>;
      expect(f.kind).toBe("ladder");
      expect(Number(f.givenN)).toBeGreaterThanOrEqual(2);
      expect(Number(f.givenN)).toBeLessThanOrEqual(20);
      expect(Number(f.answerK)).toBe(1);
      expect(Number(f.answerN)).toBeGreaterThanOrEqual(2);
      expect(Number(f.answerN)).toBeLessThanOrEqual(20);
    }
  });

  it("level 2 includes off-chart values like 30% less, which is 3/7 more", () => {
    const questions = sample(() => generateMoreLess(2));
    const longWay = questions.filter((q) => q.facts.kind === "long");
    expect(longWay.length).toBeGreaterThan(0);
    for (const question of longWay) expect(OFF_CHART).toContain(Number(question.facts.givenK));

    const thirtyLess = longWay.find((q) => q.facts.givenK === 30 && q.facts.given === "less");
    expect(thirtyLess?.answer).toBe("42.85%");
    expect(thirtyLess?.grade("42.84").trap).toContain("3 × 14.28");
  });

  it("level 3 applies the base rule to two numbers", () => {
    for (const question of sample(() => generateMoreLess(3))) {
      const { variant, low, high, answerK, answerN } = question.facts as Record<string, number | string>;
      const l = Number(low);
      const h = Number(high);
      const expected: Record<string, [number, number]> = {
        less: [h - l, h],
        more: [h - l, l],
        "low-of-high": [l, h],
        "high-of-low": [h, l],
      };
      const [num, den] = expected[String(variant)];
      expect(sameRatio(Number(answerK), Number(answerN), num, den)).toBe(true);
    }
  });

  it("shows answers in the chart's cut-off form", () => {
    for (const question of sample(() => generateMoreLess(1), 200)) {
      const value = { k: Number(question.facts.answerK), n: Number(question.facts.answerN) };
      expect(question.answer).toBe(`${formatPercent(value)}%`);
      expect(question.answer).toBe(`${truncatedPercent(value.k, value.n)}%`);
    }
  });
});

describe("drill registry", () => {
  it("has a working definition for every drill id", () => {
    for (const [id, drill] of Object.entries(drills)) {
      expect(drill.id).toBe(id);
      expect(drill.levels.length).toBeGreaterThan(0);
      for (const { level } of drill.levels) {
        const question = drill.generate(level);
        expect(question.display.length).toBeGreaterThan(0);
        expect(question.grade(question.answer.replace("%", "")).correct).toBe(true);
      }
    }
    expect(findDrill("percent-of")?.title).toBe("x% of N");
    expect(findDrill("toString")).toBeUndefined();
  });
});
