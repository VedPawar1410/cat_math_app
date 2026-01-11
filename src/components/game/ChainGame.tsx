"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Link2,
  Trophy,
  Clock,
  Target,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  SkipForward,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { NumPad } from "@/components/ui/NumPad";
import { useChainStore } from "@/lib/chainStore";
import { getChainDifficultyDescription, ChainDifficulty } from "@/lib/engines/chainEngine";

type FeedbackState = "neutral" | "correct" | "incorrect";

export function ChainGame() {
  const {
    difficulty,
    setDifficulty,
    phase,
    chain,
    currentStepIndex,
    stepResults,
    totalGamesPlayed,
    totalChainsCompleted,
    bestScore,
    startGame,
    submitAnswer,
    skipStep,
    endGame,
    resetGame,
    getCurrentStep,
    getProgress,
    getSessionStats,
  } = useChainStore();

  const [inputValue, setInputValue] = useState("");
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("neutral");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);

  const currentStep = getCurrentStep();
  const progress = getProgress();
  const sessionStats = getSessionStats();

  // Timer for the game
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "playing") {
      interval = setInterval(() => {
        const state = useChainStore.getState();
        if (state.gameStartTime) {
          setElapsedTime(Math.floor((Date.now() - state.gameStartTime) / 1000));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Reset input on step change
  useEffect(() => {
    setInputValue("");
    setFeedbackState("neutral");
    setStepStartTime(Date.now());
  }, [currentStepIndex]);

  const handleStartGame = useCallback(() => {
    startGame();
    setElapsedTime(0);
    setInputValue("");
    setFeedbackState("neutral");
  }, [startGame]);

  const handleSubmitAnswer = useCallback(() => {
    if (!inputValue.trim() || feedbackState !== "neutral") return;

    const answer = parseInt(inputValue, 10);
    if (isNaN(answer)) return;

    const isCorrect = submitAnswer(answer);
    setFeedbackState(isCorrect ? "correct" : "incorrect");

    // Auto-advance after feedback
    setTimeout(() => {
      setInputValue("");
      setFeedbackState("neutral");
    }, isCorrect ? 600 : 1000);
  }, [inputValue, feedbackState, submitAnswer]);

  const handleSkip = useCallback(() => {
    if (feedbackState !== "neutral") return;
    skipStep();
    setInputValue("");
  }, [feedbackState, skipStep]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (feedbackState !== "neutral") return;
      setInputValue((prev) => prev + digit);
    },
    [feedbackState]
  );

  const handleDelete = useCallback(() => {
    if (feedbackState !== "neutral") return;
    setInputValue((prev) => prev.slice(0, -1));
  }, [feedbackState]);

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as ChainDifficulty;
    setDifficulty(newDiff);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "setup") {
        if (e.key === "Enter") handleStartGame();
        return;
      }
      if (phase === "complete" || phase === "review") {
        if (e.key === "Enter" || e.key === "Escape") {
          resetGame();
        }
        return;
      }
      if (phase !== "playing") return;

      if (e.key === "Escape") {
        endGame();
        return;
      }

      if (feedbackState !== "neutral") return;

      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter" && inputValue.trim()) {
        handleSubmitAnswer();
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    phase,
    feedbackState,
    inputValue,
    handleStartGame,
    handleSubmitAnswer,
    handleDigit,
    handleDelete,
    handleSkip,
    resetGame,
    endGame,
  ]);

  const inputStyles = {
    neutral: "border-soft-slate/30",
    correct: "border-success bg-success/10 text-success",
    incorrect: "border-error bg-error/10 text-error animate-shake",
  };

  // Calculate correct count for display
  const correctCount = useMemo(
    () => stepResults.filter((r) => r.isCorrect).length,
    [stepResults]
  );

  // Auto-end game when entering review phase
  useEffect(() => {
    if (phase === "review") {
      endGame();
    }
  }, [phase, endGame]);

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <GameCard>
        <GameCardHeader
          title="Addition Chain"
          subtitle="Continuous chain of additions"
          icon={<Link2 className="w-5 h-5" />}
        />

        <GameCardContent>
          {/* How it works */}
          <div className="p-3 bg-neon-indigo/10 rounded-xl border border-neon-indigo/20">
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="text-neon-indigo font-medium">How it works:</span>{" "}
              Each answer becomes the starting number for the next addition.
              Complete the chain to score!
            </p>
            <div className="mt-2 text-xs text-text-muted font-mono">
              35 + 12 = 47 → 47 + 22 = 69 → 69 + 14 = 83 → ...
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Difficulty
            </label>
            <div className="flex items-center gap-3 bg-charcoal-light rounded-xl p-3">
              <button
                onClick={() => adjustDifficulty(-1)}
                disabled={difficulty === 1}
                className="p-2 rounded-lg bg-charcoal-medium text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-text-primary">
                  Level {difficulty}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {getChainDifficultyDescription(difficulty)}
                </div>
              </div>

              <button
                onClick={() => adjustDifficulty(1)}
                disabled={difficulty === 5}
                className="p-2 rounded-lg bg-charcoal-medium text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chain info */}
          <div className="p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Link2 className="w-4 h-4 text-neon-indigo" />
              <span>Chain length: 10-20 steps</span>
            </div>
          </div>

          {/* Stats preview */}
          {totalGamesPlayed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2 p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {totalGamesPlayed}
                </div>
                <div className="text-xs text-text-muted">Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-success">
                  {totalChainsCompleted}
                </div>
                <div className="text-xs text-text-muted">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-indigo">
                  {bestScore}
                </div>
                <div className="text-xs text-text-muted">Best Score</div>
              </div>
            </motion.div>
          )}
        </GameCardContent>

        <GameCardFooter>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStartGame}
            icon={<Play className="w-5 h-5" />}
          >
            Start Chain
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // PLAYING PHASE
  if (phase === "playing" && currentStep) {
    return (
      <GameCard>
        {/* Game header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-1.5 text-neon-indigo">
              <Link2 className="w-4 h-4" />
              <span className="font-mono text-sm font-bold">
                {progress.current}/{progress.total}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="text-sm text-text-secondary">
            <span className="text-success font-bold">{correctCount}</span>
            <span className="mx-1">/</span>
            <span>{stepResults.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-charcoal-light rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-indigo to-neon-indigo-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step indicator */}
        <div className="text-center mb-2">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Step {currentStep.stepNumber}
          </span>
        </div>

        {/* Question display */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center py-4"
        >
          <div className="text-3xl sm:text-4xl font-bold font-mono text-text-primary tracking-tight">
            {currentStep.previousResult.toLocaleString()}
            <span className="mx-3 text-neon-indigo">+</span>
            {currentStep.addend.toLocaleString()}
          </div>
        </motion.div>

        {/* Answer display */}
        <div className="mt-4">
          <div className="w-full max-w-xs mx-auto">
            <div
              className={`
                w-full px-4 py-3
                text-2xl sm:text-3xl font-mono font-bold
                text-center
                bg-charcoal-light
                border-2 rounded-xl
                min-h-[56px]
                flex items-center justify-center
                transition-all duration-200
                ${inputStyles[feedbackState]}
              `}
            >
              {inputValue || (
                <span className="text-text-muted/50">= ?</span>
              )}
            </div>

            {/* Feedback message */}
            <AnimatePresence>
              {feedbackState !== "neutral" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-2"
                >
                  <p
                    className={`text-sm font-medium ${
                      feedbackState === "correct" ? "text-success" : "text-error"
                    }`}
                  >
                    {feedbackState === "correct"
                      ? "Correct! 🔗"
                      : `Answer: ${currentStep.result.toLocaleString()}`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* NumPad */}
        <NumPad
          onDigit={handleDigit}
          onDecimal={() => {}}
          onDelete={handleDelete}
          onEnter={handleSubmitAnswer}
          disabled={feedbackState !== "neutral"}
          showDecimal={false}
          showNegative={false}
        />

        {/* Action buttons */}
        <GameCardFooter className="flex justify-between mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => endGame()}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            End
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={feedbackState !== "neutral"}
            icon={<SkipForward className="w-4 h-4" />}
          >
            Skip
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // REVIEW / COMPLETE PHASE
  if (phase === "review" || phase === "complete") {
    const stats = sessionStats;

    return (
      <GameCard>
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-indigo/20 mb-4"
          >
            <Trophy className="w-8 h-8 text-neon-indigo" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary">
            Chain Complete!
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {stats?.completed
              ? "You finished the entire chain!"
              : "Good effort on the chain!"}
          </p>
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score highlight */}
            <div className="text-center p-4 bg-gradient-to-br from-neon-indigo/20 to-transparent rounded-xl border border-neon-indigo/30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-neon-indigo-glow" />
                <span className="text-sm font-medium text-neon-indigo-glow uppercase tracking-wider">
                  Final Score
                </span>
              </div>
              <div className="text-4xl font-bold text-text-primary">
                {stats.finalScore}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-charcoal-light rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-4 h-4 text-success" />
                  <span className="text-xs text-text-muted">Accuracy</span>
                </div>
                <div className="text-xl font-bold text-success">
                  {stats.accuracy}%
                </div>
              </div>
              <div className="p-3 bg-charcoal-light rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-neon-indigo" />
                  <span className="text-xs text-text-muted">Avg Time</span>
                </div>
                <div className="text-xl font-bold text-neon-indigo">
                  {stats.averageTimePerStep}s
                </div>
              </div>
              <div className="p-3 bg-charcoal-light rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs text-text-muted">Correct</span>
                </div>
                <div className="text-xl font-bold text-text-primary">
                  {stats.correctSteps}/{stats.totalSteps}
                </div>
              </div>
              <div className="p-3 bg-charcoal-light rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-text-muted">Best Score</span>
                </div>
                <div className="text-xl font-bold text-amber-400">
                  {Math.max(bestScore, stats.finalScore)}
                </div>
              </div>
            </div>

            {/* Step results preview */}
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-charcoal-light/50 rounded-xl">
              {stepResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${
                    result.isCorrect
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  <span className="font-mono text-xs">
                    {result.step.previousResult} + {result.step.addend}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {result.userAnswer ?? "—"} / {result.step.result}
                    </span>
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <GameCardFooter className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={resetGame}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleStartGame}
            icon={<Play className="w-4 h-4" />}
          >
            Play Again
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // Fallback
  return null;
}
