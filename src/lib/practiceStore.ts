import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PracticeMode = "percentage" | "ratio";
type Level = 1 | 2 | 3 | 4 | 5;

interface PracticeRecord {
  difficulty: Level;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
}

interface PracticeState {
  records: Record<PracticeMode, PracticeRecord>;
  setDifficulty: (mode: PracticeMode, difficulty: Level) => void;
  recordAnswer: (mode: PracticeMode, isCorrect: boolean, streak: number) => void;
}

const newRecord: PracticeRecord = {
  difficulty: 1,
  totalQuestions: 0,
  correctAnswers: 0,
  bestStreak: 0,
};

/** Saved level and lifetime stats for the Percentage and Ratio modes. */
export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      records: { percentage: newRecord, ratio: newRecord },

      setDifficulty: (mode, difficulty) =>
        set((state) => ({
          records: { ...state.records, [mode]: { ...state.records[mode], difficulty } },
        })),

      recordAnswer: (mode, isCorrect, streak) =>
        set((state) => {
          const record = state.records[mode];
          return {
            records: {
              ...state.records,
              [mode]: {
                ...record,
                totalQuestions: record.totalQuestions + 1,
                correctAnswers: record.correctAnswers + (isCorrect ? 1 : 0),
                bestStreak: Math.max(record.bestStreak, streak),
              },
            },
          };
        }),
    }),
    { name: "cat-fast-practice-storage" }
  )
);
