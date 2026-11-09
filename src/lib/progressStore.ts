import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProgressMode =
  | "math-addition"
  | "math-subtraction"
  | "math-mixed"
  | "percentage"
  | "ratio"
  | "chain"
  | "divisibility";

export interface SessionRow {
  date: number;
  mode: ProgressMode;
  level: number;
  answered: number;
  correct: number;
  medianSeconds: number;
}

export interface SessionComparison {
  medianSeconds: number;
  accuracy: number;
  previousSessions: number;
  previousMedianSeconds: number | null;
  previousAccuracy: number | null;
}

export interface FinishedSession {
  mode: ProgressMode;
  level: number;
  timesMs: number[];
  correct: number;
}

const MAX_ROWS = 500;
const COMPARE_WINDOW = 5;
/** Shorter sessions are too noisy to count as a point on the trend. */
export const MIN_ANSWERS = 3;

function middle(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function accuracyOf(rows: SessionRow[]): number {
  const answered = rows.reduce((sum, row) => sum + row.answered, 0);
  const correct = rows.reduce((sum, row) => sum + row.correct, 0);
  return answered === 0 ? 0 : Math.round((correct / answered) * 100);
}

/** Median, not mean: one long pause shouldn't look like getting slower. */
export function medianSeconds(timesMs: number[]): number {
  return roundToTenth(middle(timesMs) / 1000);
}

/** Levels are kept apart so moving up a level doesn't look like slowing down. */
export function rowsFor(rows: SessionRow[], mode: ProgressMode, level: number): SessionRow[] {
  return rows.filter((row) => row.mode === mode && row.level === level);
}

export function compareWithPrevious(previous: SessionRow[], row: SessionRow): SessionComparison {
  const recent = previous.slice(-COMPARE_WINDOW);
  const hasHistory = recent.length > 0;
  return {
    medianSeconds: row.medianSeconds,
    accuracy: accuracyOf([row]),
    previousSessions: recent.length,
    previousMedianSeconds: hasHistory
      ? roundToTenth(middle(recent.map((r) => r.medianSeconds)))
      : null,
    previousAccuracy: hasHistory ? accuracyOf(recent) : null,
  };
}

export function describeComparison(comparison: SessionComparison) {
  const { medianSeconds: median, accuracy, previousSessions, previousMedianSeconds, previousAccuracy } = comparison;

  if (previousMedianSeconds === null) {
    return {
      faster: false,
      speed: `First timed session at this level: ${median}s median`,
      accuracy: `Accuracy ${accuracy}%`,
    };
  }

  const difference = roundToTenth(median - previousMedianSeconds);
  const against =
    previousSessions === 1 ? "your last session" : `your last ${previousSessions} sessions`;
  const pace =
    difference === 0
      ? "Same pace as"
      : difference < 0
        ? `${roundToTenth(-difference)}s faster than`
        : `${difference}s slower than`;

  return {
    faster: difference < 0,
    speed: `${median}s median. ${pace} ${against} at this level`,
    accuracy: `Accuracy ${accuracy}%, ${previousSessions === 1 ? "was" : "usually"} ${previousAccuracy}%`,
  };
}

/** Compares the start and end of a run. Returns null until there's a trend to show. */
export function summariseProgress(sessions: SessionRow[]) {
  if (sessions.length < 2) return null;
  const window = Math.min(3, Math.floor(sessions.length / 2));
  const first = sessions.slice(0, window);
  const last = sessions.slice(-window);
  return {
    sessions: sessions.length,
    startSeconds: roundToTenth(middle(first.map((r) => r.medianSeconds))),
    latestSeconds: roundToTenth(middle(last.map((r) => r.medianSeconds))),
    startAccuracy: accuracyOf(first),
    latestAccuracy: accuracyOf(last),
  };
}

interface ProgressState {
  rows: SessionRow[];
  latest: SessionComparison | null;
  logSession: (session: FinishedSession) => void;
}

/** One row per finished session, across every mode. Stored on this device only. */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      rows: [],
      latest: null,

      logSession: ({ mode, level, timesMs, correct }) => {
        if (timesMs.length < MIN_ANSWERS) {
          set({ latest: null });
          return;
        }

        const row: SessionRow = {
          date: Date.now(),
          mode,
          level,
          answered: timesMs.length,
          correct,
          medianSeconds: medianSeconds(timesMs),
        };

        set((state) => ({
          rows: [...state.rows, row].slice(-MAX_ROWS),
          latest: compareWithPrevious(rowsFor(state.rows, mode, level), row),
        }));
      },
    }),
    {
      name: "cat-fast-progress-storage",
      // "latest" only describes the session that just ended
      partialize: (state) => ({ rows: state.rows }),
    }
  )
);
