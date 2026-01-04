"use client";

import { useState, useEffect, useCallback, useRef, KeyboardEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Flame, Percent, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import {
  generatePercentageProblem,
  isPercentageCorrect,
  PercentageProblem,
  PercentageDifficulty,
  getPercentageDifficultyDescription,
} from "@/lib/engines/percentageEngine";

type FeedbackState = "neutral" | "correct" | "incorrect";

export function PercentageGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<PercentageDifficulty>(1);
  const [problem, setProblem] = useState<PercentageProblem | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("neutral");
  const [value, setValue] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus input
  useEffect(() => {
    if (isPlaying && feedbackState === "neutral" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying, feedbackState, problem]);

  const generateNewProblem = useCallback(() => {
    const newProblem = generatePercentageProblem(difficulty);
    setProblem(newProblem);
    setFeedbackState("neutral");
    setValue("");
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
    setValue("");
    setQuestionCount(0);
    setSessionCorrect(0);
    setCurrentStreak(0);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  const handleAnswer = useCallback(() => {
    if (!problem || !value.trim()) return;

    const userAnswer = parseFloat(value);
    if (isNaN(userAnswer)) return;

    const isCorrect = isPercentageCorrect(userAnswer, problem.answer, problem.decimalPlaces);
    setFeedbackState(isCorrect ? "correct" : "incorrect");
    setQuestionCount((c) => c + 1);

    if (isCorrect) {
      setSessionCorrect((c) => c + 1);
      setCurrentStreak((c) => c + 1);
    } else {
      setCurrentStreak(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      generateNewProblem();
    }, isCorrect ? 1000 : 1500);
  }, [problem, value, generateNewProblem]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow numbers, decimal point, and negative sign
    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
    // Only allow one decimal point
    const parts = newValue.split(".");
    if (parts.length > 2) return;
    // Limit decimal places
    if (parts[1] && parts[1].length > 2) return;
    setValue(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && feedbackState === "neutral") {
      handleAnswer();
    }
    if (e.key === "Escape") {
      resetGame();
    }
  };

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as PercentageDifficulty;
    setDifficulty(newDiff);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcut to start game
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" && !isPlaying) {
        startGame();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isPlaying, startGame]);

  const inputStyles = {
    neutral: "border-soft-slate/30 focus:border-neon-indigo",
    correct: "border-success bg-success/10 text-success",
    incorrect: "border-error bg-error/10 text-error animate-shake",
  };

  return (
    <GameCard>
      {!isPlaying ? (
        <>
          <GameCardHeader
            title="Percentage Rule"
            subtitle="Calculate ratio as percentage"
            icon={<Percent className="w-5 h-5" />}
          />

          <GameCardContent>
            {/* Instructions */}
            <div className="p-3 rounded-xl bg-charcoal-light/50 border border-soft-slate/20">
              <p className="text-sm text-text-secondary">
                Calculate the percentage value of the given ratio. 
                Answer to <span className="text-neon-indigo font-medium">
                  {difficulty <= 2 ? "1" : "2"} decimal place{difficulty <= 2 ? "" : "s"}
                </span>.
              </p>
              <p className="text-xs text-text-muted mt-2">
                Example: 53/81 = 65.43%
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
                    {getPercentageDifficultyDescription(difficulty)}
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

          {/* Question display */}
          <AnimatePresence mode="wait">
            {problem && (
              <motion.div
                key={problem.question}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                {/* Fraction display */}
                <div className="inline-flex flex-col items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary font-mono"
                  >
                    {problem.numerator}
                  </motion.span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.15 }}
                    className="w-full h-1 bg-neon-indigo rounded-full my-2"
                  />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary font-mono"
                  >
                    {problem.denominator}
                  </motion.span>
                </div>

                {/* = ? % */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-center gap-2 mt-4 text-2xl text-text-muted"
                >
                  <span>=</span>
                  <span className="text-neon-indigo">?</span>
                  <span>%</span>
                </motion.div>

                {/* Level badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3"
                >
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-medium text-text-muted border border-soft-slate/30">
                    Level {problem.difficulty} · {problem.decimalPlaces} decimal{problem.decimalPlaces > 1 ? "s" : ""}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full max-w-xs mx-auto mt-4"
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={feedbackState !== "neutral"}
                placeholder="Enter percentage"
                autoComplete="off"
                className={`
                  w-full px-4 py-4 pr-12
                  text-2xl sm:text-3xl font-mono font-bold
                  text-center
                  bg-charcoal-light
                  border-2 rounded-xl
                  transition-all duration-200
                  placeholder:text-text-muted/50 placeholder:text-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-neon-indigo/30
                  ${inputStyles[feedbackState]}
                `}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-text-muted font-bold">
                %
              </span>
            </div>

            {/* Feedback message */}
            <AnimatePresence>
              {feedbackState !== "neutral" && problem && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-3"
                >
                  <p className={`text-sm font-medium ${
                    feedbackState === "correct" ? "text-success" : "text-error"
                  }`}>
                    {feedbackState === "correct" ? "Correct! 🎉" : `Answer: ${problem.answer}%`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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

