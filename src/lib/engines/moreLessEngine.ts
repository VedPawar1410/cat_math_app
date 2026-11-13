import { formatPercent, gradePercent, simplify, type Fraction } from "./percentMath";
import { pick, randomInt, type DrillDefinition, type DrillLevel, type DrillQuestion } from "./drillTypes";

/**
 * More vs less. Level 1 is the chart ladder (1/n more goes with 1/(n+1) less),
 * level 2 mixes in percentages outside the chart that need the long way, and
 * level 3 compares two numbers with the base rule.
 */

const LEVELS: DrillLevel[] = [
  { level: 1, label: "Chart ladder" },
  { level: 2, label: "Ladder or the long way" },
  { level: 3, label: "Two numbers, base rule" },
];

/** Percentages that are not chart entries, so the ladder doesn't apply. */
export const OFF_CHART = [15, 30, 35, 40, 45, 60];

type Word = "more" | "less";
const opposite = (word: Word): Word => (word === "more" ? "less" : "more");

function percentQuestion(display: string, answer: Fraction, explanation: string, facts: DrillQuestion["facts"]): DrillQuestion {
  const value = simplify(answer);
  return {
    display,
    spoken: display,
    answerKind: "percent",
    answer: `${formatPercent(value)}%`,
    grade: (input) => gradePercent(input, value),
    explanation,
    facts: { ...facts, answerK: value.k, answerN: value.n },
  };
}

function ladderQuestion(): DrillQuestion {
  const given: Word = pick(["more", "less"] as const);
  const asked = opposite(given);
  // Stay inside the chart: 1/2 more needs 1/3 less, 1/20 less needs 1/19 more
  const n = given === "more" ? randomInt(2, 19) : randomInt(3, 20);
  const step = given === "more" ? n + 1 : n - 1;
  const givenPercent = formatPercent({ k: 1, n });
  return percentQuestion(
    `A is ${givenPercent}% ${given} than B. B is ${asked} than A by what %?`,
    { k: 1, n: step },
    `${givenPercent}% is 1/${n}. Asked for ${asked}: one step ${asked === "more" ? "up" : "down"} to 1/${step} = ${formatPercent({ k: 1, n: step })}%`,
    { kind: "ladder", given, givenK: 1, givenN: n }
  );
}

function longWayQuestion(): DrillQuestion {
  const given: Word = pick(["more", "less"] as const);
  const asked = opposite(given);
  const x = pick(OFF_CHART);
  const a = given === "more" ? 100 + x : 100 - x;
  const answer = simplify({ k: x, n: a });
  return percentQuestion(
    `A is ${x}% ${given} than B. B is ${asked} than A by what %?`,
    answer,
    `${x}% isn't in the chart, so no ladder: B = 100, A = ${a}, ${x} ÷ ${a} = ${answer.k}/${answer.n} = ${formatPercent(answer)}%`,
    { kind: "long", given, givenK: x, givenN: 100 }
  );
}

function twoNumbersQuestion(): DrillQuestion {
  const n = randomInt(2, 12);
  const scale = randomInt(2, 15);
  const low = n * scale;
  const high = (n + 1) * scale;
  const lowIsA = Math.random() < 0.5;
  const [aValue, bValue] = lowIsA ? [low, high] : [high, low];
  const lowName = lowIsA ? "A" : "B";
  const highName = lowIsA ? "B" : "A";
  const setup = `A = ${aValue}, B = ${bValue}.`;
  const diff = high - low;

  const variant = pick(["less", "more", "low-of-high", "high-of-low"] as const);
  if (variant === "less") {
    return percentQuestion(
      `${setup} ${lowName} is less than ${highName} by what %?`,
      { k: diff, n: high },
      `"Less" divides by the higher value: ${diff} ÷ ${high}`,
      { kind: "pair", variant, low, high }
    );
  }
  if (variant === "more") {
    return percentQuestion(
      `${setup} ${highName} is more than ${lowName} by what %?`,
      { k: diff, n: low },
      `"More" divides by the lesser value: ${diff} ÷ ${low}`,
      { kind: "pair", variant, low, high }
    );
  }
  if (variant === "low-of-high") {
    return percentQuestion(
      `${setup} ${lowName} is what % of ${highName}?`,
      { k: low, n: high },
      `"What % of" needs no difference: ${low} ÷ ${high}`,
      { kind: "pair", variant, low, high }
    );
  }
  return percentQuestion(
    `${setup} ${highName} is what % of ${lowName}?`,
    { k: high, n: low },
    `"What % of" needs no difference: ${high} ÷ ${low}`,
    { kind: "pair", variant, low, high }
  );
}

export function generateMoreLess(level: number): DrillQuestion {
  if (level === 1) return ladderQuestion();
  if (level === 2) return Math.random() < 0.5 ? ladderQuestion() : longWayQuestion();
  return twoNumbersQuestion();
}

export const moreLessDrill: DrillDefinition = {
  id: "more-less",
  title: "More vs less",
  levels: LEVELS,
  generate: generateMoreLess,
};
