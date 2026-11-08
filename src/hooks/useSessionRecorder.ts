import { useCallback, useRef } from "react";

export interface SessionResult {
  answered: number;
  correct: number;
  bestStreak: number;
  averageSeconds: number;
}

const emptyTotals = { answered: 0, correct: 0, streak: 0, bestStreak: 0, answerMs: 0 };

/**
 * Tallies one practice session for the end-of-session summary. Uses refs because
 * nothing on screen depends on these numbers until the session ends.
 */
export function useSessionRecorder() {
  const totals = useRef({ ...emptyTotals });
  const questionShownAt = useRef(0);

  const startSession = useCallback(() => {
    totals.current = { ...emptyTotals };
  }, []);

  const markQuestionShown = useCallback(() => {
    questionShownAt.current = Date.now();
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    const session = totals.current;
    session.answered += 1;
    session.answerMs += Date.now() - questionShownAt.current;
    session.streak = isCorrect ? session.streak + 1 : 0;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    if (isCorrect) session.correct += 1;
  }, []);

  // Returns null when nothing was answered, so there is no empty summary to show
  const finishSession = useCallback((): SessionResult | null => {
    const { answered, correct, bestStreak, answerMs } = totals.current;
    if (answered === 0) return null;
    return {
      answered,
      correct,
      bestStreak,
      averageSeconds: Math.round(answerMs / answered / 100) / 10,
    };
  }, []);

  return { startSession, markQuestionShown, recordAnswer, finishSession };
}
