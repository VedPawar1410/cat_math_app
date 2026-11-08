import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { useGameStore } from "../store";
import { usePracticeStore } from "../practiceStore";
import { useChainStore } from "../chainStore";
import { useDivisibilityStore } from "../divisibilityStore";

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState(), true);
  usePracticeStore.setState(usePracticeStore.getInitialState(), true);
  useChainStore.setState(useChainStore.getInitialState(), true);
  useDivisibilityStore.setState(useDivisibilityStore.getInitialState(), true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGameStore", () => {
  it("times a question from when it was shown", () => {
    vi.useFakeTimers();
    const store = useGameStore.getState();
    store.setQuestion("2 + 2", 4);
    vi.advanceTimersByTime(1500);
    store.submitAnswer(4);
    expect(useGameStore.getState().stats.sessionTimes.at(-1)).toBe(1.5);
  });

  it("keeps the best streak after a wrong answer", () => {
    const store = useGameStore.getState();
    store.setQuestion("2 + 2", 4);
    store.submitAnswer(4);
    store.submitAnswer(4);
    store.submitAnswer(5);
    const { stats } = useGameStore.getState();
    expect(stats).toMatchObject({
      totalQuestions: 3,
      correctAnswers: 2,
      currentStreak: 0,
      bestStreak: 2,
    });
  });
});

describe("usePracticeStore", () => {
  it("saves the level separately for each mode", () => {
    usePracticeStore.getState().setDifficulty("percentage", 3);
    usePracticeStore.getState().setDifficulty("ratio", 2);
    const { records } = usePracticeStore.getState();
    expect(records.percentage.difficulty).toBe(3);
    expect(records.ratio.difficulty).toBe(2);
  });

  it("adds up answers and keeps the highest streak", () => {
    const { recordAnswer } = usePracticeStore.getState();
    recordAnswer("ratio", true, 1);
    recordAnswer("ratio", true, 2);
    recordAnswer("ratio", false, 0);
    expect(usePracticeStore.getState().records.ratio).toMatchObject({
      totalQuestions: 3,
      correctAnswers: 2,
      bestStreak: 2,
    });
    expect(usePracticeStore.getState().records.percentage.totalQuestions).toBe(0);
  });
});

describe("useChainStore", () => {
  it("moves on with the correct running total after a wrong answer", () => {
    const store = useChainStore.getState();
    store.startGame();
    const first = useChainStore.getState().chain!.steps[0];

    expect(store.submitAnswer(first.result + 1)).toBe(false);

    const state = useChainStore.getState();
    expect(state.currentStepIndex).toBe(1);
    expect(state.chain!.steps[1].previousResult).toBe(first.result);
    expect(state.stepResults[0]).toMatchObject({ isCorrect: false, userAnswer: first.result + 1 });
  });

  it("records a skip as unanswered", () => {
    useChainStore.getState().startGame();
    useChainStore.getState().skipStep();
    expect(useChainStore.getState().stepResults[0]).toMatchObject({
      userAnswer: null,
      isCorrect: false,
    });
  });

  it("counts a chain as completed only when every step was reached", () => {
    useChainStore.getState().startGame();
    useChainStore.getState().skipStep();
    useChainStore.getState().endGame();
    expect(useChainStore.getState()).toMatchObject({
      phase: "complete",
      totalGamesPlayed: 1,
      totalChainsCompleted: 0,
    });

    useChainStore.getState().startGame();
    const total = useChainStore.getState().chain!.totalLength;
    for (let i = 0; i < total; i++) useChainStore.getState().skipStep();
    expect(useChainStore.getState().phase).toBe("review");
    useChainStore.getState().endGame();
    expect(useChainStore.getState().totalChainsCompleted).toBe(1);
  });

  it("returns to setup without recording a game if nothing was answered", () => {
    useChainStore.getState().startGame();
    useChainStore.getState().endGame();
    expect(useChainStore.getState()).toMatchObject({ phase: "setup", totalGamesPlayed: 0 });
  });
});

describe("useDivisibilityStore", () => {
  it("returns to setup without recording a game if nothing was answered", () => {
    useDivisibilityStore.getState().startGame();
    useDivisibilityStore.getState().endGame();
    expect(useDivisibilityStore.getState()).toMatchObject({ phase: "setup", totalGamesPlayed: 0 });
  });

  it("shows the summary and records the game once something was answered", () => {
    useDivisibilityStore.getState().startGame();
    const problem = useDivisibilityStore.getState().currentProblem!;
    useDivisibilityStore.getState().submitDivisibilityAnswer(problem.isDivisible);
    useDivisibilityStore.getState().submitRemainderAnswer(problem.remainder);
    useDivisibilityStore.getState().endGame();
    expect(useDivisibilityStore.getState()).toMatchObject({
      phase: "summary",
      totalGamesPlayed: 1,
      bestAccuracy: 100,
    });
  });
});
