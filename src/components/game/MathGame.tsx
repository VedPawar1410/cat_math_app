"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Flame, Target, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { MathQuestion } from "./MathQuestion";
import { AnswerInput } from "./AnswerInput";
import { generateProblem, MathProblem, Operation, Difficulty, getDifficultyDescription } from "@/lib/engines/mathEngine";
import { useGameStore } from "@/lib/store";

type FeedbackState = "neutral" | "correct" | "incorrect";

export function MathGame() {
  const { stats, difficulty, setDifficulty, submitAnswer } = useGameStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("neutral");
  const [operation, setOperation] = useState<Operation | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
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
    const newProblem = generateProblem(operation, difficulty);
    setProblem(newProblem);
    setFeedbackState("neutral");
  }, [operation, difficulty]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setQuestionCount(0);
    setSessionCorrect(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    generateNewProblem();
  }, [generateNewProblem]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setProblem(null);
    setFeedbackState("neutral");
    setQuestionCount(0);
    setSessionCorrect(0);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  const handleAnswer = useCallback((answer: number) => {
    if (!problem) return;

    const isCorrect = answer === problem.answer;
    setFeedbackState(isCorrect ? "correct" : "incorrect");
    setQuestionCount((c) => c + 1);
    
    if (isCorrect) {
      setSessionCorrect((c) => c + 1);
    }

    // Update global store
    useGameStore.getState().setQuestion(problem.question, problem.answer);
    submitAnswer(answer);

    // Move to next question after brief delay
    setTimeout(() => {
      generateNewProblem();
    }, isCorrect ? 800 : 1200);
  }, [problem, generateNewProblem, submitAnswer]);

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as Difficulty;
    setDifficulty(newDiff);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcut to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isPlaying) {
        startGame();
      }
      if (e.key === "Escape" && isPlaying) {
        resetGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, startGame, resetGame]);

  return (
    <GameCard>
      {!isPlaying ? (
        <>
          <GameCardHeader
            title="Mental Math"
            subtitle="Addition & Subtraction"
            icon={<Target className="w-5 h-5" />}
          />

          <GameCardContent>
            {/* Operation selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Operation</label>
              <div className="grid grid-cols-3 gap-2">
                {(["addition", "subtraction", "mixed"] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${operation === op
                        ? "bg-neon-indigo text-white"
                        : "bg-charcoal-medium text-text-secondary hover:text-text-primary hover:bg-soft-slate/50"
                      }
                    `}
                  >
                    {op === "addition" ? "+" : op === "subtraction" ? "−" : "Mixed"}
                  </button>
                ))}
              </div>
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
                    {getDifficultyDescription(difficulty)}
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

            {/* Stats preview */}
            {stats.totalQuestions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2 p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-text-primary">{stats.totalQuestions}</div>
                  <div className="text-xs text-text-muted">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">
                    {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%
                  </div>
                  <div className="text-xs text-text-muted">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-neon-indigo">{stats.bestStreak}</div>
                  <div className="text-xs text-text-muted">Best Streak</div>
                </div>
              </motion.div>
            )}
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
              {/* Timer */}
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
              
              {/* Streak */}
              <div className="flex items-center gap-1.5 text-neon-indigo">
                <Flame className="w-4 h-4" />
                <span className="font-mono text-sm font-bold">{stats.currentStreak}</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-sm text-text-secondary">
              <span className="text-success font-bold">{sessionCorrect}</span>
              <span className="mx-1">/</span>
              <span>{questionCount}</span>
            </div>
          </div>

          {/* Question display */}
          {problem && <MathQuestion problem={problem} />}

          {/* Answer input */}
          <div className="mt-6">
            <AnswerInput
              onSubmit={handleAnswer}
              feedbackState={feedbackState}
              disabled={feedbackState !== "neutral"}
            />
          </div>

          {/* Reset button */}
          <GameCardFooter className="flex justify-center">
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

