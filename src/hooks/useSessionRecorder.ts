import { useCallback, useRef } from "react";
import { medianSeconds, useProgressStore, type ProgressMode } from "@/lib/progressStore";

export interface SessionResult {
  answered: number;
  correct: number;
  bestStreak: number;
  medianSeconds: number;
}

const newTotals = () => ({ correct: 0, streak: 0, bestStreak: 0, answerTimes: [] as number[] });

/**
 * Tallies one practice session for the end-of-session summary. Uses refs because
 * nothing on screen depends on these numbers until the session ends.
 */
export function useSessionRecorder() {
  const totals = useRef(newTotals());
  const questionShownAt = useRef(0);

  const startSession = useCallback(() => {
    totals.current = newTotals();
  }, []);

  const markQuestionShown = useCallback(() => {
    questionShownAt.current = Date.now();
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    const session = totals.current;
    session.answerTimes.push(Date.now() - questionShownAt.current);
    session.streak = isCorrect ? session.streak + 1 : 0;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    if (isCorrect) session.correct += 1;
  }, []);

  // Returns null when nothing was answered, so there is no empty summary to show
  const finishSession = useCallback(
    (mode: ProgressMode, level: number): SessionResult | null => {
      const { correct, bestStreak, answerTimes } = totals.current;
      useProgressStore.getState().logSession({ mode, level, timesMs: answerTimes, correct });
      if (answerTimes.length === 0) return null;
      return {
        answered: answerTimes.length,
        correct,
        bestStreak,
        medianSeconds: medianSeconds(answerTimes),
      };
    },
    []
  );

  return { startSession, markQuestionShown, recordAnswer, finishSession };
}
