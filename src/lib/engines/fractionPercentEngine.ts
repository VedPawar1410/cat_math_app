import { classForms, percentChart } from "@/content/coaching/percentages";
import type { FractionForm } from "@/content/coaching/types";
import { describeExact, gradeFraction, gradePercent, isCutOff } from "./percentMath";
import { pick, type DrillDefinition, type DrillLevel, type DrillQuestion } from "./drillTypes";

/** Fraction to % and back, using the chart and the multiples used in class. */

const LEVELS: DrillLevel[] = [
  { level: 1, label: "1/2 to 1/10" },
  { level: 2, label: "1/11 to 1/20" },
  { level: 3, label: "Multiples used in class" },
];

export function formsForLevel(level: number): FractionForm[] {
  if (level === 1) return percentChart.filter((form) => form.n <= 10);
  if (level === 2) return percentChart.filter((form) => form.n > 10);
  return classForms;
}

function exactNote(form: FractionForm): string {
  return isCutOff(form) ? ` (cut off; exactly ${describeExact(form)}%)` : "";
}

export function generateFractionToPercent(level: number): DrillQuestion {
  const form = pick(formsForLevel(level));
  return {
    display: `${form.k}/${form.n}`,
    spoken: `${form.k} over ${form.n}, as a percentage`,
    answerKind: "percent",
    answer: `${form.percent}%`,
    grade: (input) => gradePercent(input, form),
    explanation: `${form.k}/${form.n} = ${form.percent}%${exactNote(form)}`,
    facts: { k: form.k, n: form.n, percent: form.percent },
  };
}

export function generatePercentToFraction(level: number): DrillQuestion {
  const form = pick(formsForLevel(level));
  return {
    display: `${form.percent}%`,
    spoken: `${form.percent} percent, as a fraction`,
    answerKind: "fraction",
    answer: `${form.k}/${form.n}`,
    grade: (input) => gradeFraction(input, form),
    explanation: `${form.percent}% = ${form.k}/${form.n}`,
    facts: { k: form.k, n: form.n, percent: form.percent },
  };
}

export const fractionToPercentDrill: DrillDefinition = {
  id: "fraction-to-percent",
  title: "Fraction to %",
  levels: LEVELS,
  generate: generateFractionToPercent,
};

export const percentToFractionDrill: DrillDefinition = {
  id: "percent-to-fraction",
  title: "% to fraction",
  levels: LEVELS,
  generate: generatePercentToFraction,
};
