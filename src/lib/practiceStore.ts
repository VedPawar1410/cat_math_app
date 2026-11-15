import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DrillId } from "@/content/coaching/types";

export type CoachingPracticeMode = `coach-${DrillId}`;
export type PracticeMode = "percentage" | "ratio" | CoachingPracticeMode;
type Level = 1 | 2 | 3 | 4 | 5;

export interface PracticeRecord {
  difficulty: Level;
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
}

/** Percentage and Ratio always have a record; a coaching drill gets one once it's played. */
type Records = Record<"percentage" | "ratio", PracticeRecord> &
  Partial<Record<CoachingPracticeMode, PracticeRecord>>;

interface PracticeState {
  records: Records;
  setDifficulty: (mode: PracticeMode, difficulty: Level) => void;
  recordAnswer: (mode: PracticeMode, isCorrect: boolean, streak: number) => void;
}

export const newRecord: PracticeRecord = {
  difficulty: 1,
  totalQuestions: 0,
  correctAnswers: 0,
  bestStreak: 0,
};

/** Saved level and lifetime stats for Percentage, Ratio and each coaching drill. */
export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      records: { percentage: newRecord, ratio: newRecord },

      setDifficulty: (mode, difficulty) =>
        set((state) => ({
          records: { ...state.records, [mode]: { ...(state.records[mode] ?? newRecord), difficulty } },
        })),

      recordAnswer: (mode, isCorrect, streak) =>
        set((state) => {
          const record = state.records[mode] ?? newRecord;
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
