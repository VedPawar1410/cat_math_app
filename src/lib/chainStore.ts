/**
 * Continuous Addition Chain Store
 * 
 * Standalone Zustand store for the Chain game feature.
 * Completely independent from the main game store.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ChainDifficulty,
  ChainStep,
  GeneratedChain,
  ChainStats,
  generateDefaultChain,
  calculateChainStats,
} from "./engines/chainEngine";

export type ChainGamePhase = "setup" | "playing" | "review" | "complete";

interface ChainStepResult {
  step: ChainStep;
  userAnswer: number | null;
  isCorrect: boolean;
  timeMs: number;
}

interface ChainHistoryEntry {
  date: number;
  difficulty: ChainDifficulty;
  stats: ChainStats;
}

interface ChainGameState {
  // Game configuration
  difficulty: ChainDifficulty;
  
  // Current game state
  phase: ChainGamePhase;
  chain: GeneratedChain | null;
  currentStepIndex: number;
  stepResults: ChainStepResult[];
  
  // Timing
  gameStartTime: number | null;
  stepStartTime: number | null;
  
  // Persistent stats
  totalGamesPlayed: number;
  totalChainsCompleted: number;
  bestScore: number;
  history: ChainHistoryEntry[];
  
  // Actions
  setDifficulty: (difficulty: ChainDifficulty) => void;
  startGame: () => void;
  submitAnswer: (answer: number) => boolean;
  skipStep: () => void;
  nextStep: () => void;
  reviewChain: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Computed getters
  getCurrentStep: () => ChainStep | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getSessionStats: () => ChainStats | null;
}

export const useChainStore = create<ChainGameState>()(
  persist(
    (set, get) => ({
      // Initial state
      difficulty: 2,
      phase: "setup",
      chain: null,
      currentStepIndex: 0,
      stepResults: [],
      gameStartTime: null,
      stepStartTime: null,
      totalGamesPlayed: 0,
      totalChainsCompleted: 0,
      bestScore: 0,
      history: [],

      setDifficulty: (difficulty) => set({ difficulty }),

      startGame: () => {
        const { difficulty } = get();
        const chain = generateDefaultChain(difficulty);
        const now = Date.now();
        
        set({
          phase: "playing",
          chain,
          currentStepIndex: 0,
          stepResults: [],
          gameStartTime: now,
          stepStartTime: now,
        });
      },

      submitAnswer: (answer) => {
        const { chain, currentStepIndex, stepResults, stepStartTime } = get();
        if (!chain || currentStepIndex >= chain.steps.length) return false;
        
        const currentStep = chain.steps[currentStepIndex];
        const isCorrect = answer === currentStep.result;
        const timeMs = stepStartTime ? Date.now() - stepStartTime : 0;
        
        const newResult: ChainStepResult = {
          step: currentStep,
          userAnswer: answer,
          isCorrect,
          timeMs,
        };
        
        const newResults = [...stepResults, newResult];
        const isLastStep = currentStepIndex >= chain.steps.length - 1;
        
        set({
          stepResults: newResults,
          phase: isLastStep ? "review" : "playing",
          currentStepIndex: isLastStep ? currentStepIndex : currentStepIndex + 1,
          stepStartTime: isLastStep ? null : Date.now(),
        });
        
        return isCorrect;
      },

      skipStep: () => {
        const { chain, currentStepIndex, stepResults, stepStartTime } = get();
        if (!chain || currentStepIndex >= chain.steps.length) return;
        
        const currentStep = chain.steps[currentStepIndex];
        const timeMs = stepStartTime ? Date.now() - stepStartTime : 0;
        
        const newResult: ChainStepResult = {
          step: currentStep,
          userAnswer: null,
          isCorrect: false,
          timeMs,
        };
        
        const newResults = [...stepResults, newResult];
        const isLastStep = currentStepIndex >= chain.steps.length - 1;
        
        set({
          stepResults: newResults,
          phase: isLastStep ? "review" : "playing",
          currentStepIndex: isLastStep ? currentStepIndex : currentStepIndex + 1,
          stepStartTime: isLastStep ? null : Date.now(),
        });
      },

      nextStep: () => {
        const { chain, currentStepIndex } = get();
        if (!chain) return;
        
        if (currentStepIndex < chain.steps.length - 1) {
          set({
            currentStepIndex: currentStepIndex + 1,
            stepStartTime: Date.now(),
          });
        }
      },

      reviewChain: () => {
        set({ phase: "review" });
      },

      endGame: () => {
        const state = get();
        const { chain, stepResults, gameStartTime, difficulty, bestScore, totalGamesPlayed, totalChainsCompleted, history } = state;
        
        if (!chain || stepResults.length === 0) {
          set({ phase: "setup" });
          return;
        }
        
        const totalTimeMs = gameStartTime ? Date.now() - gameStartTime : 0;
        const correctSteps = stepResults.filter((r) => r.isCorrect).length;
        const completed = stepResults.length === chain.steps.length;
        
        const stats = calculateChainStats(
          stepResults.length,
          correctSteps,
          totalTimeMs,
          completed
        );
        
        const newHistoryEntry: ChainHistoryEntry = {
          date: Date.now(),
          difficulty,
          stats,
        };
        
        set({
          phase: "complete",
          totalGamesPlayed: totalGamesPlayed + 1,
          totalChainsCompleted: completed ? totalChainsCompleted + 1 : totalChainsCompleted,
          bestScore: Math.max(bestScore, stats.finalScore),
          history: [...history, newHistoryEntry].slice(-20), // Keep last 20 games
        });
      },

      resetGame: () => {
        set({
          phase: "setup",
          chain: null,
          currentStepIndex: 0,
          stepResults: [],
          gameStartTime: null,
          stepStartTime: null,
        });
      },

      getCurrentStep: () => {
        const { chain, currentStepIndex } = get();
        if (!chain || currentStepIndex >= chain.steps.length) return null;
        return chain.steps[currentStepIndex];
      },

      getProgress: () => {
        const { chain, currentStepIndex } = get();
        if (!chain) return { current: 0, total: 0, percentage: 0 };
        
        const total = chain.steps.length;
        const current = currentStepIndex + 1;
        const percentage = Math.round((current / total) * 100);
        
        return { current, total, percentage };
      },

      getSessionStats: () => {
        const { chain, stepResults, gameStartTime } = get();
        if (!chain || stepResults.length === 0) return null;
        
        const totalTimeMs = gameStartTime ? Date.now() - gameStartTime : 0;
        const correctSteps = stepResults.filter((r) => r.isCorrect).length;
        const completed = stepResults.length === chain.steps.length;
        
        return calculateChainStats(
          stepResults.length,
          correctSteps,
          totalTimeMs,
          completed
        );
      },
    }),
    {
      name: "cat-fast-chain-storage",
      partialize: (state) => ({
        difficulty: state.difficulty,
        totalGamesPlayed: state.totalGamesPlayed,
        totalChainsCompleted: state.totalChainsCompleted,
        bestScore: state.bestScore,
        history: state.history,
      }),
    }
  )
);
