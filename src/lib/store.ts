import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameMode = "addition" | "subtraction" | "percentage" | "ratio";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  averageTime: number;
  sessionTimes: number[];
}

interface GameState {
  // Game settings
  mode: GameMode;
  difficulty: Difficulty;
  
  // Session state
  isPlaying: boolean;
  currentQuestion: string | null;
  currentAnswer: number | null;
  questionStartTime: number | null;
  
  // Stats
  stats: GameStats;
  
  // Actions
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  startGame: () => void;
  endGame: () => void;
  setQuestion: (question: string, answer: number) => void;
  submitAnswer: (userAnswer: number) => boolean;
  resetStats: () => void;
}

const initialStats: GameStats = {
  totalQuestions: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  averageTime: 0,
  sessionTimes: [],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: "addition",
      difficulty: 1,
      isPlaying: false,
      currentQuestion: null,
      currentAnswer: null,
      questionStartTime: null,
      stats: initialStats,

      setMode: (mode) => set({ mode }),
      setDifficulty: (difficulty) => set({ difficulty }),

      startGame: () =>
        set({
          isPlaying: true,
          questionStartTime: Date.now(),
        }),

      endGame: () =>
        set({
          isPlaying: false,
          currentQuestion: null,
          currentAnswer: null,
          questionStartTime: null,
        }),

      setQuestion: (question, answer) =>
        set({
          currentQuestion: question,
          currentAnswer: answer,
          questionStartTime: Date.now(),
        }),

      submitAnswer: (userAnswer) => {
        const state = get();
        const isCorrect = userAnswer === state.currentAnswer;
        const timeTaken = state.questionStartTime
          ? (Date.now() - state.questionStartTime) / 1000
          : 0;

        set((s) => {
          const newSessionTimes = [...s.stats.sessionTimes, timeTaken];
          const newTotalQuestions = s.stats.totalQuestions + 1;
          const newCorrectAnswers = s.stats.correctAnswers + (isCorrect ? 1 : 0);
          const newCurrentStreak = isCorrect ? s.stats.currentStreak + 1 : 0;
          const newBestStreak = Math.max(s.stats.bestStreak, newCurrentStreak);
          const newAverageTime =
            newSessionTimes.reduce((a, b) => a + b, 0) / newSessionTimes.length;

          return {
            stats: {
              totalQuestions: newTotalQuestions,
              correctAnswers: newCorrectAnswers,
              currentStreak: newCurrentStreak,
              bestStreak: newBestStreak,
              averageTime: newAverageTime,
              sessionTimes: newSessionTimes,
            },
          };
        });

        return isCorrect;
      },

      resetStats: () => set({ stats: initialStats }),
    }),
    {
      name: "cat-fast-storage",
      partialize: (state) => ({
        stats: state.stats,
        difficulty: state.difficulty,
        mode: state.mode,
      }),
    }
  )
);

