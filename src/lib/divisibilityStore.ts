/**
 * Divisibility & Remainder Practice Store
 * 
 * Standalone Zustand store for the Divisibility game feature.
 * Completely independent from other game stores.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DivisibilityDifficulty,
  DivisibilityProblem,
  generateDefaultProblem,
  validateDivisibilityAnswer,
  validateRemainderAnswer,
} from "./engines/divisibilityEngine";

export type DivisibilityPhase = "setup" | "divisibility" | "remainder" | "feedback" | "summary";

export type AnswerResult = "correct" | "incorrect" | "pending";

interface ProblemResult {
  problem: DivisibilityProblem;
  userDivisibilityAnswer: boolean | null;
  userRemainderAnswer: number | null;
  divisibilityCorrect: boolean;
  remainderCorrect: boolean;
  timeMs: number;
}

interface DivisibilityGameState {
  // Configuration
  difficulty: DivisibilityDifficulty;
  acceptNegativeRemainders: boolean;
  
  // Game state
  phase: DivisibilityPhase;
  currentProblem: DivisibilityProblem | null;
  problemCount: number;
  maxProblems: number;
  results: ProblemResult[];
  
  // Current problem state
  userDivisibilityAnswer: boolean | null;
  divisibilityResult: AnswerResult;
  
  // Timing
  gameStartTime: number | null;
  problemStartTime: number | null;
  
  // Persistent stats
  totalGamesPlayed: number;
  totalProblemsAttempted: number;
  totalCorrectDivisibility: number;
  totalCorrectRemainder: number;
  bestAccuracy: number;
  
  // Actions
  setDifficulty: (difficulty: DivisibilityDifficulty) => void;
  setAcceptNegativeRemainders: (accept: boolean) => void;
  setMaxProblems: (count: number) => void;
  startGame: () => void;
  submitDivisibilityAnswer: (isDivisible: boolean) => boolean;
  submitRemainderAnswer: (remainder: number) => boolean;
  nextProblem: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Getters
  getCurrentProblem: () => DivisibilityProblem | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getSessionAccuracy: () => number;
}

export const useDivisibilityStore = create<DivisibilityGameState>()(
  persist(
    (set, get) => ({
      // Initial state
      difficulty: 2,
      acceptNegativeRemainders: true,
      phase: "setup",
      currentProblem: null,
      problemCount: 0,
      maxProblems: 10,
      results: [],
      userDivisibilityAnswer: null,
      divisibilityResult: "pending",
      gameStartTime: null,
      problemStartTime: null,
      totalGamesPlayed: 0,
      totalProblemsAttempted: 0,
      totalCorrectDivisibility: 0,
      totalCorrectRemainder: 0,
      bestAccuracy: 0,

      setDifficulty: (difficulty) => set({ difficulty }),
      
      setAcceptNegativeRemainders: (accept) => 
        set({ acceptNegativeRemainders: accept }),
      
      setMaxProblems: (count) => set({ maxProblems: count }),

      startGame: () => {
        const { difficulty } = get();
        const problem = generateDefaultProblem(difficulty);
        const now = Date.now();
        
        set({
          phase: "divisibility",
          currentProblem: problem,
          problemCount: 1,
          results: [],
          userDivisibilityAnswer: null,
          divisibilityResult: "pending",
          gameStartTime: now,
          problemStartTime: now,
        });
      },

      submitDivisibilityAnswer: (isDivisible) => {
        const { currentProblem } = get();
        if (!currentProblem) return false;
        
        const isCorrect = validateDivisibilityAnswer(currentProblem, isDivisible);
        
        set({
          userDivisibilityAnswer: isDivisible,
          divisibilityResult: isCorrect ? "correct" : "incorrect",
          phase: "remainder",
        });
        
        return isCorrect;
      },

      submitRemainderAnswer: (remainder) => {
        const {
          currentProblem,
          userDivisibilityAnswer,
          divisibilityResult,
          problemStartTime,
          results,
          acceptNegativeRemainders,
        } = get();
        
        if (!currentProblem || userDivisibilityAnswer === null) return false;
        
        const isCorrect = validateRemainderAnswer(
          currentProblem,
          remainder,
          acceptNegativeRemainders
        );
        
        const timeMs = problemStartTime ? Date.now() - problemStartTime : 0;
        
        const result: ProblemResult = {
          problem: currentProblem,
          userDivisibilityAnswer,
          userRemainderAnswer: remainder,
          divisibilityCorrect: divisibilityResult === "correct",
          remainderCorrect: isCorrect,
          timeMs,
        };
        
        set({
          results: [...results, result],
          phase: "feedback",
        });
        
        return isCorrect;
      },

      nextProblem: () => {
        const { problemCount, maxProblems, difficulty } = get();
        
        if (problemCount >= maxProblems) {
          // End the game
          get().endGame();
          return;
        }
        
        const problem = generateDefaultProblem(difficulty);
        
        set({
          phase: "divisibility",
          currentProblem: problem,
          problemCount: problemCount + 1,
          userDivisibilityAnswer: null,
          divisibilityResult: "pending",
          problemStartTime: Date.now(),
        });
      },

      endGame: () => {
        const {
          results,
          totalGamesPlayed,
          totalProblemsAttempted,
          totalCorrectDivisibility,
          totalCorrectRemainder,
          bestAccuracy,
        } = get();
        
        const correctDiv = results.filter((r) => r.divisibilityCorrect).length;
        const correctRem = results.filter((r) => r.remainderCorrect).length;
        const totalAnswers = results.length * 2;
        const sessionAccuracy =
          totalAnswers > 0
            ? Math.round(((correctDiv + correctRem) / totalAnswers) * 100)
            : 0;
        
        set({
          phase: "summary",
          totalGamesPlayed: totalGamesPlayed + 1,
          totalProblemsAttempted: totalProblemsAttempted + results.length,
          totalCorrectDivisibility: totalCorrectDivisibility + correctDiv,
          totalCorrectRemainder: totalCorrectRemainder + correctRem,
          bestAccuracy: Math.max(bestAccuracy, sessionAccuracy),
        });
      },

      resetGame: () => {
        set({
          phase: "setup",
          currentProblem: null,
          problemCount: 0,
          results: [],
          userDivisibilityAnswer: null,
          divisibilityResult: "pending",
          gameStartTime: null,
          problemStartTime: null,
        });
      },

      getCurrentProblem: () => get().currentProblem,

      getProgress: () => {
        const { problemCount, maxProblems } = get();
        return {
          current: problemCount,
          total: maxProblems,
          percentage: Math.round((problemCount / maxProblems) * 100),
        };
      },

      getSessionAccuracy: () => {
        const { results } = get();
        if (results.length === 0) return 0;
        
        const correctDiv = results.filter((r) => r.divisibilityCorrect).length;
        const correctRem = results.filter((r) => r.remainderCorrect).length;
        const totalAnswers = results.length * 2;
        
        return Math.round(((correctDiv + correctRem) / totalAnswers) * 100);
      },
    }),
    {
      name: "cat-fast-divisibility-storage",
      partialize: (state) => ({
        difficulty: state.difficulty,
        acceptNegativeRemainders: state.acceptNegativeRemainders,
        maxProblems: state.maxProblems,
        totalGamesPlayed: state.totalGamesPlayed,
        totalProblemsAttempted: state.totalProblemsAttempted,
        totalCorrectDivisibility: state.totalCorrectDivisibility,
        totalCorrectRemainder: state.totalCorrectRemainder,
        bestAccuracy: state.bestAccuracy,
      }),
    }
  )
);
