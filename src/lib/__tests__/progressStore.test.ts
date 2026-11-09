import { beforeEach, describe, expect, it, vi } from "vitest";

// The stores persist to localStorage, which doesn't exist in Node
vi.hoisted(() => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
});

import {
  compareWithPrevious,
  describeComparison,
  medianSeconds,
  rowsFor,
  summariseProgress,
  useProgressStore,
  type SessionRow,
} from "../progressStore";
import { useChainStore } from "../chainStore";
import { useDivisibilityStore } from "../divisibilityStore";

function row(medianSeconds: number, overrides: Partial<SessionRow> = {}): SessionRow {
  return { date: 1, mode: "ratio", level: 1, answered: 10, correct: 8, medianSeconds, ...overrides };
}

const log = useProgressStore.getState().logSession;
const threeAnswers = [1000, 2000, 3000];

beforeEach(() => {
  useProgressStore.setState(useProgressStore.getInitialState(), true);
  useChainStore.setState(useChainStore.getInitialState(), true);
  useDivisibilityStore.setState(useDivisibilityStore.getInitialState(), true);
});

describe("medianSeconds", () => {
  it("isn't moved by one long pause", () => {
    expect(medianSeconds([1000, 1200, 300000])).toBe(1.2);
  });

  it("averages the middle two for an even count", () => {
    expect(medianSeconds([1000, 2000, 3000, 9000])).toBe(2.5);
  });
});

describe("logSession", () => {
  it("records one row with the median and tallies", () => {
    log({ mode: "ratio", level: 2, timesMs: threeAnswers, correct: 2 });
    expect(useProgressStore.getState().rows).toMatchObject([
      { mode: "ratio", level: 2, answered: 3, correct: 2, medianSeconds: 2 },
    ]);
  });

  it("ignores sessions too short to mean anything, and clears the last comparison", () => {
    log({ mode: "ratio", level: 1, timesMs: threeAnswers, correct: 3 });
    expect(useProgressStore.getState().latest).not.toBeNull();

    log({ mode: "ratio", level: 1, timesMs: [1000, 1000], correct: 2 });
    expect(useProgressStore.getState().rows).toHaveLength(1);
    expect(useProgressStore.getState().latest).toBeNull();
  });

  it("keeps only the newest 500 sessions", () => {
    useProgressStore.setState({ rows: Array.from({ length: 500 }, () => row(5)) });
    log({ mode: "ratio", level: 1, timesMs: threeAnswers, correct: 3 });

    const { rows } = useProgressStore.getState();
    expect(rows).toHaveLength(500);
    expect(rows[499].medianSeconds).toBe(2);
  });

  it("compares only against the same mode and level", () => {
    useProgressStore.setState({
      rows: [row(9, { level: 3 }), row(9, { mode: "percentage" }), row(4)],
    });
    log({ mode: "ratio", level: 1, timesMs: threeAnswers, correct: 3 });

    expect(useProgressStore.getState().latest).toMatchObject({
      previousSessions: 1,
      previousMedianSeconds: 4,
    });
  });
});

describe("rowsFor", () => {
  it("keeps levels apart so a harder level doesn't look like slowing down", () => {
    const rows = [row(2, { level: 1 }), row(8, { level: 5 })];
    expect(rowsFor(rows, "ratio", 5).map((r) => r.medianSeconds)).toEqual([8]);
  });
});

describe("compareWithPrevious", () => {
  it("uses only the 5 most recent sessions", () => {
    const old = row(100);
    const recent = [row(3), row(3), row(3), row(3), row(3)];
    const comparison = compareWithPrevious([old, ...recent], row(2));
    expect(comparison.previousSessions).toBe(5);
    expect(comparison.previousMedianSeconds).toBe(3);
  });
});

describe("describeComparison", () => {
  const base = { medianSeconds: 2.4, accuracy: 90, previousSessions: 5, previousAccuracy: 80 };

  it("says when a session is faster", () => {
    const text = describeComparison({ ...base, previousMedianSeconds: 3 });
    expect(text.faster).toBe(true);
    expect(text.speed).toBe("2.4s median. 0.6s faster than your last 5 sessions at this level");
    expect(text.accuracy).toBe("Accuracy 90%, usually 80%");
  });

  it("says when a session is slower", () => {
    const text = describeComparison({ ...base, previousMedianSeconds: 2 });
    expect(text.faster).toBe(false);
    expect(text.speed).toContain("0.4s slower than");
  });

  it("says when the pace is the same", () => {
    expect(describeComparison({ ...base, previousMedianSeconds: 2.4 }).speed).toContain("Same pace as");
  });

  it("doesn't invent a comparison for the first session", () => {
    const text = describeComparison({
      medianSeconds: 2.4,
      accuracy: 90,
      previousSessions: 0,
      previousMedianSeconds: null,
      previousAccuracy: null,
    });
    expect(text.speed).toBe("First timed session at this level: 2.4s median");
  });

  it("uses singular wording for one earlier session", () => {
    const text = describeComparison({ ...base, previousSessions: 1, previousMedianSeconds: 3 });
    expect(text.speed).toContain("your last session at");
    expect(text.accuracy).toContain("was 80%");
  });
});

describe("summariseProgress", () => {
  it("needs at least two sessions", () => {
    expect(summariseProgress([row(3)])).toBeNull();
  });

  it("compares the start of the run with the end", () => {
    const sessions = [row(5), row(5), row(5), row(3), row(2), row(2), row(2)];
    expect(summariseProgress(sessions)).toMatchObject({
      sessions: 7,
      startSeconds: 5,
      latestSeconds: 2,
    });
  });

  it("reports accuracy alongside speed", () => {
    const sessions = [row(5, { correct: 5 }), row(3, { correct: 9 })];
    expect(summariseProgress(sessions)).toMatchObject({ startAccuracy: 50, latestAccuracy: 90 });
  });
});

describe("game stores log finished sessions", () => {
  const step = (userAnswer: number | null, isCorrect: boolean, timeMs: number) => ({
    step: {} as never,
    userAnswer,
    isCorrect,
    timeMs,
  });

  it("Chain leaves skipped steps out of the times", () => {
    useChainStore.setState({
      difficulty: 3,
      chain: { steps: [{}, {}, {}, {}] } as never,
      stepResults: [step(1, true, 1000), step(2, true, 2000), step(null, false, 90000), step(4, false, 3000)],
      gameStartTime: Date.now(),
    });
    useChainStore.getState().endGame();

    expect(useProgressStore.getState().rows).toMatchObject([
      { mode: "chain", level: 3, answered: 3, correct: 2, medianSeconds: 2 },
    ]);
  });

  it("Divisibility counts a problem as correct only when both parts are", () => {
    const result = (divisibilityCorrect: boolean, remainderCorrect: boolean, timeMs: number) => ({
      problem: {} as never,
      userDivisibilityAnswer: true,
      userRemainderAnswer: 0,
      divisibilityCorrect,
      remainderCorrect,
      timeMs,
    });
    useDivisibilityStore.setState({
      difficulty: 4,
      results: [result(true, true, 1000), result(true, false, 2000), result(false, false, 3000)],
    });
    useDivisibilityStore.getState().endGame();

    expect(useProgressStore.getState().rows).toMatchObject([
      { mode: "divisibility", level: 4, answered: 3, correct: 1, medianSeconds: 2 },
    ]);
  });
});
