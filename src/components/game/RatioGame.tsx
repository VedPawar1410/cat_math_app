"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Flame, Scale, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import {
  generateRatioComparison,
  RatioComparisonProblem,
  RatioDifficulty,
  getRatioDifficultyDescription,
} from "@/lib/engines/ratioEngine";

type FeedbackState = "neutral" | "correct" | "incorrect";

export function RatioGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<RatioDifficulty>(1);
  const [problem, setProblem] = useState<RatioComparisonProblem | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("neutral");
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, startTime]);

  const generateNewProblem = useCallback(() => {
    const newProblem = generateRatioComparison(difficulty);
    setProblem(newProblem);
    setFeedbackState("neutral");
    setSelectedAnswer(null);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setQuestionCount(0);
    setSessionCorrect(0);
    setCurrentStreak(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    generateNewProblem();
  }, [generateNewProblem]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setProblem(null);
    setFeedbackState("neutral");
    setSelectedAnswer(null);
    setQuestionCount(0);
    setSessionCorrect(0);
    setCurrentStreak(0);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  const handleAnswer = useCallback((answer: "A" | "B") => {
    if (!problem || feedbackState !== "neutral") return;

    setSelectedAnswer(answer);
    const isCorrect = answer === problem.correctAnswer;
    setFeedbackState(isCorrect ? "correct" : "incorrect");
    setQuestionCount((c) => c + 1);

    if (isCorrect) {
      setSessionCorrect((c) => c + 1);
      setCurrentStreak((c) => c + 1);
    } else {
      setCurrentStreak(0);
    }

    // Auto-advance to next question
    setTimeout(() => {
      generateNewProblem();
    }, isCorrect ? 800 : 1200);
  }, [problem, feedbackState, generateNewProblem]);

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as RatioDifficulty;
    setDifficulty(newDiff);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcuts for ratio selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.key === "Enter") startGame();
        return;
      }
      if (feedbackState !== "neutral") return;
      
      if (e.key === "1" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        handleAnswer("A");
      } else if (e.key === "2" || e.key === "ArrowRight" || e.key === "b" || e.key === "B") {
        handleAnswer("B");
      } else if (e.key === "Escape") {
        resetGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, feedbackState, startGame, handleAnswer, resetGame]);

  return (
    <GameCard>
      {!isPlaying ? (
        <>
          <GameCardHeader
            title="Ratio Comparison"
            subtitle="Which ratio is larger?"
            icon={<Scale className="w-5 h-5" />}
          />

          <GameCardContent>
            {/* Instructions */}
            <div className="p-3 rounded-xl bg-charcoal-light/50 border border-soft-slate/20">
              <p className="text-sm text-text-secondary">
                Compare two ratios and click the <span className="text-neon-indigo font-medium">larger one</span>. 
                Use percentage estimation to compare.
              </p>
              <p className="text-xs text-text-muted mt-2">
                Tip: Use keys <kbd className="px-1 py-0.5 rounded bg-charcoal-medium text-[10px]">1</kbd> or <kbd className="px-1 py-0.5 rounded bg-charcoal-medium text-[10px]">←</kbd> for left, <kbd className="px-1 py-0.5 rounded bg-charcoal-medium text-[10px]">2</kbd> or <kbd className="px-1 py-0.5 rounded bg-charcoal-medium text-[10px]">→</kbd> for right
              </p>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Difficulty</label>
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
                    {getRatioDifficultyDescription(difficulty)}
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
          </GameCardContent>

          <GameCardFooter>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={startGame}
              icon={<Play className="w-5 h-5" />}
            >
              Start Practice
            </Button>
          </GameCardFooter>
        </>
      ) : (
        <>
          {/* Game header with stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neon-indigo">
                <Flame className="w-4 h-4" />
                <span className="font-mono text-sm font-bold">{currentStreak}</span>
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              <span className="text-success font-bold">{sessionCorrect}</span>
              <span className="mx-1">/</span>
              <span>{questionCount}</span>
            </div>
          </div>

          {/* Question prompt */}
          <div className="text-center mb-4">
            <p className="text-text-secondary text-sm">Click the larger ratio</p>
          </div>

          {/* Ratio comparison display */}
          <AnimatePresence mode="wait">
            {problem && (
              <motion.div
                key={`${problem.ratioA.display}-${problem.ratioB.display}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {/* Ratio A */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => handleAnswer("A")}
                  disabled={feedbackState !== "neutral"}
                  className={`
                    relative p-4 sm:p-6 rounded-xl
                    border-2 transition-all duration-200
                    ${feedbackState === "neutral" 
                      ? "bg-charcoal-light border-soft-slate/30 hover:border-neon-indigo hover:bg-charcoal-medium cursor-pointer" 
                      : selectedAnswer === "A"
                        ? feedbackState === "correct"
                          ? "bg-success/20 border-success"
                          : "bg-error/20 border-error animate-shake"
                        : problem.correctAnswer === "A"
                          ? "bg-success/10 border-success/50"
                          : "bg-charcoal-light border-soft-slate/30 opacity-50"
                    }
                    disabled:cursor-default
                  `}
                >
                  {/* Keyboard hint */}
                  <span className="absolute top-2 left-2 text-[10px] font-mono text-text-muted bg-charcoal-medium px-1.5 py-0.5 rounded">
                    1
                  </span>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary font-mono">
                      {problem.ratioA.numerator}
                    </span>
                    <div className="w-full h-0.5 bg-text-muted/50 my-2 rounded-full" />
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary font-mono">
                      {problem.ratioA.denominator}
                    </span>
                  </div>

                  {/* Show percentage on feedback */}
                  {feedbackState !== "neutral" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm font-mono text-text-secondary"
                    >
                      {(problem.ratioA.value * 100).toFixed(1)}%
                    </motion.div>
                  )}
                </motion.button>

                {/* Ratio B */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => handleAnswer("B")}
                  disabled={feedbackState !== "neutral"}
                  className={`
                    relative p-4 sm:p-6 rounded-xl
                    border-2 transition-all duration-200
                    ${feedbackState === "neutral"
                      ? "bg-charcoal-light border-soft-slate/30 hover:border-neon-indigo hover:bg-charcoal-medium cursor-pointer"
                      : selectedAnswer === "B"
                        ? feedbackState === "correct"
                          ? "bg-success/20 border-success"
                          : "bg-error/20 border-error animate-shake"
                        : problem.correctAnswer === "B"
                          ? "bg-success/10 border-success/50"
                          : "bg-charcoal-light border-soft-slate/30 opacity-50"
                    }
                    disabled:cursor-default
                  `}
                >
                  {/* Keyboard hint */}
                  <span className="absolute top-2 right-2 text-[10px] font-mono text-text-muted bg-charcoal-medium px-1.5 py-0.5 rounded">
                    2
                  </span>

                  <div className="flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary font-mono">
                      {problem.ratioB.numerator}
                    </span>
                    <div className="w-full h-0.5 bg-text-muted/50 my-2 rounded-full" />
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary font-mono">
                      {problem.ratioB.denominator}
                    </span>
                  </div>

                  {/* Show percentage on feedback */}
                  {feedbackState !== "neutral" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm font-mono text-text-secondary"
                    >
                      {(problem.ratioB.value * 100).toFixed(1)}%
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level indicator */}
          {problem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-center mt-4"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-medium text-text-muted border border-soft-slate/30">
                Level {problem.difficulty} · {problem.percentageDiff.toFixed(1)}% difference
              </span>
            </motion.div>
          )}

          {/* Feedback message */}
          <AnimatePresence>
            {feedbackState !== "neutral" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mt-4"
              >
                <p className={`text-sm font-medium ${
                  feedbackState === "correct" ? "text-success" : "text-error"
                }`}>
                  {feedbackState === "correct" ? "Correct! 🎉" : "Not quite!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset button */}
          <GameCardFooter className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              End Session
            </Button>
          </GameCardFooter>
        </>
      )}
    </GameCard>
  );
}

