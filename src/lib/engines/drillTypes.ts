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
  generate: (level: number) => DrillQuestion;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
