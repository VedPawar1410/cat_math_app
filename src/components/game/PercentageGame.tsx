"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Flame, Percent, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { NumPad } from "@/components/ui/NumPad";
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
  const [inputValue, setInputValue] = useState("");
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
    const newProblem = generatePercentageProblem(difficulty);
    setProblem(newProblem);
    setFeedbackState("neutral");
    setInputValue("");
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
    setInputValue("");
    setQuestionCount(0);
    setSessionCorrect(0);
    setCurrentStreak(0);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (!problem || !inputValue.trim()) return;

    const userAnswer = parseFloat(inputValue);
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
  }, [problem, inputValue, generateNewProblem]);

  const handleDigit = useCallback((digit: string) => {
    if (feedbackState !== "neutral") return;
    setInputValue((prev) => prev + digit);
  }, [feedbackState]);

  const handleDecimal = useCallback(() => {
    if (feedbackState !== "neutral") return;
    // Only allow one decimal point
    if (inputValue.includes(".")) return;
    // Don't allow more than 2 decimal places
    setInputValue((prev) => (prev === "" ? "0." : prev + "."));
  }, [feedbackState, inputValue]);

  const handleDelete = useCallback(() => {
    if (feedbackState !== "neutral") return;
    setInputValue((prev) => prev.slice(0, -1));
  }, [feedbackState]);

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as PercentageDifficulty;
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
      if (!isPlaying) {
        if (e.key === "Enter") startGame();
        return;
      }
      if (e.key === "Escape") {
        resetGame();
        return;
      }
      if (feedbackState !== "neutral") return;

      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter" && inputValue.trim()) {
        handleSubmitAnswer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, feedbackState, inputValue, startGame, resetGame, handleDigit, handleDecimal, handleDelete, handleSubmitAnswer]);

  const inputStyles = {
    neutral: "border-soft-slate/30",
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
                className="text-center py-4"
              >
                {/* Fraction display */}
                <div className="inline-flex flex-col items-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-bold text-text-primary font-mono"
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
                    className="text-4xl sm:text-5xl font-bold text-text-primary font-mono"
                  >
                    {problem.denominator}
                  </motion.span>
                </div>

                {/* = ? % */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-center gap-2 mt-3 text-xl text-text-muted"
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
                  className="mt-2"
                >
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-medium text-text-muted border border-soft-slate/30">
                    Level {problem.difficulty} · {problem.decimalPlaces} decimal{problem.decimalPlaces > 1 ? "s" : ""}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer display */}
          <div className="mt-2">
            <div className="w-full max-w-xs mx-auto">
              <div className="relative">
                <div
                  className={`
                    w-full px-4 py-3 pr-10
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
                  {inputValue || <span className="text-text-muted/50">0.00</span>}
                </div>
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
                    className="text-center mt-2"
                  >
                    <p className={`text-sm font-medium ${
                      feedbackState === "correct" ? "text-success" : "text-error"
                    }`}>
                      {feedbackState === "correct" ? "Correct! 🎉" : `Answer: ${problem.answer}%`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* NumPad */}
          <NumPad
            onDigit={handleDigit}
            onDecimal={handleDecimal}
            onDelete={handleDelete}
            onEnter={handleSubmitAnswer}
            disabled={feedbackState !== "neutral"}
            showDecimal={true}
          />

          {/* Reset button */}
          <GameCardFooter className="flex justify-center mt-2">
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
