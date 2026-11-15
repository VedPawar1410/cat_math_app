/**
 * Types for the "My CAT coaching tricks" track. Content comes only from my class
 * notes; a chapter is one data file listed in ./index.ts.
 */

/** Every practice drill the track can launch. A typo here fails type-checking. */
export type DrillId =
  | "fraction-to-percent"
  | "percent-to-fraction"
  | "squares"
  | "square-roots"
  | "cubes"
  | "cube-roots"
  | "tables"
  | "percent-of"
  | "more-less";

/** A fraction k/n with its percentage written as in my notes (truncated to 2 decimals). */
export interface FractionForm {
  k: number;
  n: number;
  /** As written in class, e.g. "16.66" for 1/6. A test checks it against long division. */
  percent: string;
  /** Where it came from, e.g. "Class Q3". */
  source?: string;
}

export interface WorkedExample {
  question: string;
  steps: string[];
  answer: string;
  /** e.g. "Class Q3" or "Handout Q1(c)". */
  source: string;
}

export interface ContentTable {
  title: string;
  columns: [string, string];
  rows: [string, string][];
}

/** Reference grids the Learn view computes instead of storing. */
export type ReferenceGrid = "squares" | "cubes" | "tables";

export interface Trick {
  id: string;
  title: string;
  summary: string;
  rule: string[];
  tables?: ContentTable[];
  referenceGrids?: ReferenceGrid[];
  examples: WorkedExample[];
  traps: string[];
  drills: DrillId[];
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  /** Which class the content comes from. */
  source: string;
  tricks: Trick[];
  /** Listed in class but not taught yet. */
  comingLater: string[];
}
