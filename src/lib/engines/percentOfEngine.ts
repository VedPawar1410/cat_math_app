import { classForms, percentChart } from "@/content/coaching/percentages";
import { gradeInteger } from "./percentMath";
import { pick, randomInt, type DrillDefinition, type DrillLevel, type DrillQuestion } from "./drillTypes";

/** x% of N with chart-friendly percentages and whole-number answers. */

interface PercentForm {
  k: number;
  n: number;
  percent: string;
  hint: string;
}

const LEVELS: DrillLevel[] = [
  { level: 1, label: "Chart fractions" },
  { level: 2, label: "Class multiples and splits" },
  { level: 3, label: "Swap rule" },
];

const chartForms: PercentForm[] = percentChart.map((form) => ({
  ...form,
  hint: `${form.percent}% = 1/${form.n}`,
}));

/** The class forms, plus the splits worked in class and on the handout. */
export const multipleForms: PercentForm[] = [
  ...classForms.map((form) => ({ ...form, hint: `${form.percent}% = ${form.k}/${form.n}` })),
  { k: 17, n: 30, percent: "56.66", hint: "56.66% = 50% + 1/15" },
  { k: 43, n: 30, percent: "143.33", hint: "143.33% = 100% + 10% + 1/3" },
  { k: 27, n: 40, percent: "67.5", hint: "67.5% = 62.5% + 5% = 5/8 + 1/20" },
];

/** Easy percentages for the swap rule: e% = p/q. */
const SWAP_TARGETS = [
  { e: 25, p: 1, q: 4 },
  { e: 50, p: 1, q: 2 },
  { e: 125, p: 5, q: 4 },
  { e: 150, p: 3, q: 2 },
  { e: 250, p: 5, q: 2 },
];

const withCommas = (value: number) => value.toLocaleString("en-US");

function fromForm(form: PercentForm, maxNumber: number): DrillQuestion {
  const multiple = randomInt(Math.ceil(20 / form.n), Math.floor(maxNumber / form.n));
  const number = form.n * multiple;
  const answer = form.k * multiple;
  return {
    display: `${form.percent}% of ${withCommas(number)}`,
    spoken: `${form.percent} percent of ${number}`,
    answerKind: "integer",
    answer: String(answer),
    grade: (input) => gradeInteger(input, answer),
    explanation: `${form.hint}, so ${form.k}/${form.n} × ${withCommas(number)} = ${withCommas(answer)}`,
    facts: { k: form.k, n: form.n, number, percent: form.percent },
  };
}

function formatTenths(tenths: number): string {
  const whole = Math.floor(tenths / 10);
  return tenths % 10 === 0 ? String(whole) : `${whole}.${tenths % 10}`;
}

function swapQuestion(): DrillQuestion {
  for (;;) {
    const { e, p, q } = pick(SWAP_TARGETS);
    const answer = randomInt(6, 120);
    // a% of e = answer, so a = answer × q / p; keep a to at most one decimal place
    const tenths = (answer * q * 10) / p;
    if (!Number.isInteger(tenths) || tenths < 110 || tenths > 999) continue;
    const a = formatTenths(tenths);
    return {
      display: `${a}% of ${e}`,
      spoken: `${a} percent of ${e}`,
      answerKind: "integer",
      answer: String(answer),
      grade: (input) => gradeInteger(input, answer),
      explanation: `Swap: ${a}% of ${e} = ${e}% of ${a} = ${p}/${q} × ${a} = ${answer}`,
      facts: { tenths, e },
    };
  }
}

export function generatePercentOf(level: number): DrillQuestion {
  if (level === 1) return fromForm(pick(chartForms), 1000);
  if (level === 2) return fromForm(pick(multipleForms), 3000);
  return swapQuestion();
}

export const percentOfDrill: DrillDefinition = {
  id: "percent-of",
  title: "x% of N",
  levels: LEVELS,
  generate: generatePercentOf,
};
