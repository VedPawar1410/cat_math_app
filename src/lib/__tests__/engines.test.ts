import { describe, expect, it } from "vitest";
import { generateProblem } from "../engines/mathEngine";
import {
  calculatePercentage,
  generatePercentageProblem,
  isPercentageCorrect,
} from "../engines/percentageEngine";
import { generateRatioComparison } from "../engines/ratioEngine";
import { calculateChainStats, generateDefaultChain } from "../engines/chainEngine";
import { generateDefaultProblem, validateRemainderAnswer } from "../engines/divisibilityEngine";

const LEVELS = [1, 2, 3, 4, 5] as const;
const SAMPLES = 2000;

describe("mathEngine", () => {
  it.each(LEVELS)("level %i gives correct, non-negative answers", (level) => {
    for (let i = 0; i < SAMPLES; i++) {
      const p = generateProblem("mixed", level);
      const expected =
        p.operation === "addition" ? p.operand1 + p.operand2 : p.operand1 - p.operand2;
      expect(p.answer).toBe(expected);
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("percentageEngine", () => {
  it.each([
    [23, 80, 1, 28.8],
    [41, 80, 1, 51.3],
    [51, 80, 1, 63.8],
    [41, 160, 2, 25.63],
    [169, 160, 2, 105.63],
  ] as const)("rounds exact halves up: %i/%i to %i decimals", (n, d, places, expected) => {
    expect(calculatePercentage(n, d, places)).toBe(expected);
  });

  it("matches exact whole-number rounding for every ratio the game can ask", () => {
    for (const places of [1, 2] as const) {
      const scale = 100 * 10 ** places;
      for (let d = 40; d <= 250; d++) {
        for (let n = 10; n <= 300; n++) {
          const exact = Math.floor((2 * n * scale + d) / (2 * d)) / 10 ** places;
          expect(calculatePercentage(n, d, places)).toBeCloseTo(exact, 6);
        }
      }
    }
  });

  it("accepts the rounded answer and rejects the next value up", () => {
    const answer = calculatePercentage(23, 80, 1);
    expect(isPercentageCorrect(28.8, answer, 1)).toBe(true);
    expect(isPercentageCorrect(28.9, answer, 1)).toBe(false);
  });

  it.each(LEVELS)("level %i uses the advertised decimals and range", (level) => {
    for (let i = 0; i < SAMPLES; i++) {
      const p = generatePercentageProblem(level);
      expect(p.decimalPlaces).toBe(level <= 2 ? 1 : 2);
      expect(p.answer).toBe(calculatePercentage(p.numerator, p.denominator, p.decimalPlaces));
      if (level <= 3) expect(p.answer).toBeLessThan(100);
    }
  });
});

describe("ratioEngine", () => {
  const bands = { 1: [15, 40], 2: [8, 15], 3: [4, 8], 4: [2, 4], 5: [0.5, 2] } as const;

  it.each(LEVELS)("level %i marks the truly larger ratio, with no ties", (level) => {
    for (let i = 0; i < SAMPLES; i++) {
      const { ratioA: a, ratioB: b, correctAnswer } = generateRatioComparison(level);
      const cross = a.numerator * b.denominator - b.numerator * a.denominator;
      expect(cross).not.toBe(0);
      expect(correctAnswer).toBe(cross > 0 ? "A" : "B");
    }
  });

  it.each(LEVELS)("level %i stays in its difficulty band", (level) => {
    const [min, max] = bands[level];
    let inBand = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const { percentageDiff } = generateRatioComparison(level);
      if (percentageDiff >= min && percentageDiff <= max) inBand++;
    }
    expect(inBand / SAMPLES).toBeGreaterThan(0.95);
  });
});

describe("chainEngine", () => {
  it.each(LEVELS)("level %i links each step to the previous result", (level) => {
    for (let i = 0; i < 300; i++) {
      const chain = generateDefaultChain(level);
      expect(chain.totalLength).toBeGreaterThanOrEqual(10);
      expect(chain.totalLength).toBeLessThanOrEqual(20);
      chain.steps.forEach((step, index) => {
        expect(step.result).toBe(step.previousResult + step.addend);
        if (index > 0) expect(step.previousResult).toBe(chain.steps[index - 1].result);
      });
      expect(chain.finalResult).toBe(chain.steps[chain.steps.length - 1].result);
    }
  });

  it("scores base, accuracy, speed and completion", () => {
    const stats = calculateChainStats(10, 10, 10_000, true);
    expect(stats.accuracy).toBe(100);
    expect(stats.averageTimePerStep).toBe(1);
    expect(stats.finalScore).toBe(100 + 200 + 40 + 50);
  });
});

describe("divisibilityEngine", () => {
  it.each(LEVELS)("level %i gives a valid quotient and remainder", (level) => {
    for (let i = 0; i < SAMPLES; i++) {
      const p = generateDefaultProblem(level);
      expect(p.dividend).toBe(p.divisor * p.quotient + p.remainder);
      expect(p.remainder).toBeGreaterThanOrEqual(0);
      expect(p.remainder).toBeLessThan(p.divisor);
      expect(p.isDivisible).toBe(p.remainder === 0);
    }
  });

  it("only accepts a negative remainder when that option is on", () => {
    let p = generateDefaultProblem(3);
    while (p.isDivisible) p = generateDefaultProblem(3);
    const negative = p.remainder - p.divisor;

    expect(validateRemainderAnswer(p, p.remainder, false)).toBe(true);
    expect(validateRemainderAnswer(p, negative, true)).toBe(true);
    expect(validateRemainderAnswer(p, negative, false)).toBe(false);
    expect(validateRemainderAnswer(p, 0, true)).toBe(false);
  });
});
