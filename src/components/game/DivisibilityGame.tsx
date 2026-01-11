"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Divide,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Target,
  Trophy,
} from "lucide-react";
import { GameCard, GameCardHeader, GameCardContent, GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { NumPad } from "@/components/ui/NumPad";
import { useDivisibilityStore } from "@/lib/divisibilityStore";
import {
  getDivisibilityDifficultyDescription,
  getDivisibilityHint,
  explainRemainder,
  DivisibilityDifficulty,
} from "@/lib/engines/divisibilityEngine";

export function DivisibilityGame() {
  const {
    difficulty,
    setDifficulty,
    acceptNegativeRemainders,
    setAcceptNegativeRemainders,
    phase,
    currentProblem,
    problemCount,
    maxProblems,
    setMaxProblems,
    results,
    userDivisibilityAnswer,
    divisibilityResult,
    totalGamesPlayed,
    bestAccuracy,
    startGame,
    submitDivisibilityAnswer,
    submitRemainderAnswer,
    nextProblem,
    endGame,
    resetGame,
    getProgress,
    getSessionAccuracy,
  } = useDivisibilityStore();

  const [remainderInput, setRemainderInput] = useState("");
  const [remainderResult, setRemainderResult] = useState<"correct" | "incorrect" | "pending">("pending");
  const [showHint, setShowHint] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const progress = getProgress();
  const sessionAccuracy = getSessionAccuracy();

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase !== "setup" && phase !== "summary") {
      interval = setInterval(() => {
        const state = useDivisibilityStore.getState();
        if (state.gameStartTime) {
          setElapsedTime(Math.floor((Date.now() - state.gameStartTime) / 1000));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Reset remainder input when moving to new problem
  useEffect(() => {
    setRemainderInput("");
    setRemainderResult("pending");
    setShowHint(false);
  }, [problemCount]);

  const handleStartGame = useCallback(() => {
    startGame();
    setElapsedTime(0);
    setRemainderInput("");
    setRemainderResult("pending");
  }, [startGame]);

  const handleDivisibilityAnswer = useCallback(
    (isDivisible: boolean) => {
      submitDivisibilityAnswer(isDivisible);
    },
    [submitDivisibilityAnswer]
  );

  const handleRemainderSubmit = useCallback(() => {
    if (remainderInput === "" && currentProblem?.isDivisible) {
      // If divisible and user submits empty, treat as 0
      const isCorrect = submitRemainderAnswer(0);
      setRemainderResult(isCorrect ? "correct" : "incorrect");
      return;
    }

    const remainder = parseInt(remainderInput, 10);
    if (isNaN(remainder)) return;

    const isCorrect = submitRemainderAnswer(remainder);
    setRemainderResult(isCorrect ? "correct" : "incorrect");
  }, [remainderInput, currentProblem, submitRemainderAnswer]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (phase !== "remainder" || remainderResult !== "pending") return;
      
      // Handle negative sign
      if (digit === "-") {
        if (remainderInput === "") {
          setRemainderInput("-");
        } else if (remainderInput === "-") {
          setRemainderInput("");
        }
        return;
      }
      
      setRemainderInput((prev) => prev + digit);
    },
    [phase, remainderResult, remainderInput]
  );

  const handleDelete = useCallback(() => {
    if (phase !== "remainder" || remainderResult !== "pending") return;
    setRemainderInput((prev) => prev.slice(0, -1));
  }, [phase, remainderResult]);

  const handleNextOrEnd = useCallback(() => {
    if (problemCount >= maxProblems) {
      endGame();
    } else {
      nextProblem();
    }
  }, [problemCount, maxProblems, endGame, nextProblem]);

  const adjustDifficulty = (delta: number) => {
    const newDiff = Math.max(1, Math.min(5, difficulty + delta)) as DivisibilityDifficulty;
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

      if (phase === "summary") {
        if (e.key === "Enter" || e.key === "Escape") resetGame();
        return;
      }

      if (phase === "divisibility") {
        if (e.key === "y" || e.key === "Y" || e.key === "1") {
          handleDivisibilityAnswer(true);
        } else if (e.key === "n" || e.key === "N" || e.key === "0") {
          handleDivisibilityAnswer(false);
        }
        return;
      }

      if (phase === "remainder") {
        if (remainderResult !== "pending") return;
        
        if (e.key >= "0" && e.key <= "9") {
          handleDigit(e.key);
        } else if (e.key === "-") {
          handleDigit("-");
        } else if (e.key === "Backspace") {
          handleDelete();
        } else if (e.key === "Enter") {
          handleRemainderSubmit();
        }
        return;
      }

      if (phase === "feedback") {
        if (e.key === "Enter" || e.key === " ") {
          handleNextOrEnd();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    phase,
    remainderResult,
    handleStartGame,
    handleDivisibilityAnswer,
    handleDigit,
    handleDelete,
    handleRemainderSubmit,
    handleNextOrEnd,
    resetGame,
  ]);

  // Hint for current divisor
  const currentHint = useMemo(() => {
    if (!currentProblem) return null;
    return getDivisibilityHint(currentProblem.divisor);
  }, [currentProblem]);

  // Stats from results
  const correctDivCount = useMemo(
    () => results.filter((r) => r.divisibilityCorrect).length,
    [results]
  );
  const correctRemCount = useMemo(
    () => results.filter((r) => r.remainderCorrect).length,
    [results]
  );

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <GameCard>
        <GameCardHeader
          title="Divisibility"
          subtitle="Remainders & factors"
          icon={<Divide className="w-5 h-5" />}
        />

        <GameCardContent>
          {/* Description */}
          <div className="p-3 bg-neon-indigo/10 rounded-xl border border-neon-indigo/20">
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="text-neon-indigo font-medium">Practice:</span>{" "}
              Determine if numbers are divisible and calculate remainders.
            </p>
            <div className="mt-2 text-xs text-text-muted font-mono">
              87 ÷ 5 → Divisible? No → Remainder: 2
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
                <div className="text-2xl font-bold text-text-primary">Level {difficulty}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {getDivisibilityDifficultyDescription(difficulty)}
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

          {/* Problem count selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Problems</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setMaxProblems(count)}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-medium transition-all
                    ${maxProblems === count
                      ? "bg-neon-indigo text-white"
                      : "bg-charcoal-medium text-text-secondary hover:text-text-primary"
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Negative remainder toggle */}
          <div className="flex items-center justify-between p-3 bg-charcoal-light/50 rounded-xl">
            <div>
              <div className="text-sm font-medium text-text-primary">Accept negative remainders</div>
              <div className="text-xs text-text-muted">e.g., 52 ÷ 7 = -2 or 3</div>
            </div>
            <button
              onClick={() => setAcceptNegativeRemainders(!acceptNegativeRemainders)}
              className={`
                w-12 h-6 rounded-full transition-all duration-200
                ${acceptNegativeRemainders ? "bg-neon-indigo" : "bg-charcoal-medium"}
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded-full bg-white shadow-md transform transition-transform
                  ${acceptNegativeRemainders ? "translate-x-6" : "translate-x-0.5"}
                `}
              />
            </button>
          </div>

          {/* Stats */}
          {totalGamesPlayed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{totalGamesPlayed}</div>
                <div className="text-xs text-text-muted">Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-indigo">{bestAccuracy}%</div>
                <div className="text-xs text-text-muted">Best</div>
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
            Start Practice
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // DIVISIBILITY QUESTION PHASE
  if (phase === "divisibility" && currentProblem) {
    return (
      <GameCard>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-text-secondary text-sm">
            <span className="font-mono">{formatTime(elapsedTime)}</span>
            <span className="text-neon-indigo font-medium">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="text-sm text-text-muted">{sessionAccuracy}% accuracy</div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-charcoal-light rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-indigo to-neon-indigo-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Step 1: Is it divisible?
          </div>
          <motion.div
            key={problemCount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-bold font-mono text-text-primary"
          >
            {currentProblem.dividend}
            <span className="mx-3 text-neon-indigo">÷</span>
            {currentProblem.divisor}
          </motion.div>
        </div>

        {/* Hint button */}
        {currentHint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-neon-indigo transition-colors mx-auto"
            >
              <HelpCircle className="w-4 h-4" />
              {showHint ? "Hide hint" : "Show hint"}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-charcoal-light rounded-xl text-sm text-text-secondary"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{currentHint}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Yes/No buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="secondary"
            size="lg"
            className="bg-success/20 hover:bg-success/30 border-success/30 text-success"
            onClick={() => handleDivisibilityAnswer(true)}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            Yes (Y)
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="bg-error/20 hover:bg-error/30 border-error/30 text-error"
            onClick={() => handleDivisibilityAnswer(false)}
            icon={<XCircle className="w-5 h-5" />}
          >
            No (N)
          </Button>
        </div>

        <GameCardFooter className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={endGame} icon={<RotateCcw className="w-4 h-4" />}>
            End Session
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // REMAINDER PHASE
  if (phase === "remainder" && currentProblem) {
    const divCorrect = divisibilityResult === "correct";

    return (
      <GameCard>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-text-secondary text-sm">
            <span className="font-mono">{formatTime(elapsedTime)}</span>
            <span className="text-neon-indigo font-medium">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div
            className={`text-sm font-medium ${divCorrect ? "text-success" : "text-error"}`}
          >
            {divCorrect ? "✓ Correct" : "✗ Incorrect"}
          </div>
        </div>

        {/* Divisibility result feedback */}
        <div
          className={`p-3 rounded-xl mb-4 ${
            divCorrect ? "bg-success/10 border border-success/30" : "bg-error/10 border border-error/30"
          }`}
        >
          <div className="text-sm">
            <span className="text-text-muted">You said: </span>
            <span className={divCorrect ? "text-success" : "text-error"}>
              {userDivisibilityAnswer ? "Divisible" : "Not divisible"}
            </span>
            {!divCorrect && (
              <span className="text-text-muted">
                {" "}
                (Answer: {currentProblem.isDivisible ? "Yes" : "No"})
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-4">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Step 2: What is the remainder?
          </div>
          <div className="text-3xl font-bold font-mono text-text-primary">
            {currentProblem.dividend}
            <span className="mx-2 text-neon-indigo">÷</span>
            {currentProblem.divisor}
            <span className="mx-2 text-text-muted">=</span>
            <span className="text-text-muted">?</span>
          </div>
        </div>

        {/* Remainder input */}
        <div className="w-full max-w-xs mx-auto mb-4">
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
              ${remainderResult === "correct" ? "border-success bg-success/10 text-success" : ""}
              ${remainderResult === "incorrect" ? "border-error bg-error/10 text-error animate-shake" : ""}
              ${remainderResult === "pending" ? "border-soft-slate/30" : ""}
            `}
          >
            {remainderInput || <span className="text-text-muted/50">Remainder</span>}
          </div>
          {acceptNegativeRemainders && remainderResult === "pending" && (
            <p className="text-xs text-text-muted text-center mt-2">
              Negative remainders accepted (use − key)
            </p>
          )}
        </div>

        {/* NumPad */}
        <NumPad
          onDigit={handleDigit}
          onDecimal={() => {}}
          onDelete={handleDelete}
          onEnter={handleRemainderSubmit}
          disabled={remainderResult !== "pending"}
          showDecimal={false}
          showNegative={acceptNegativeRemainders}
        />

        <GameCardFooter className="flex justify-center mt-2">
          <Button variant="ghost" size="sm" onClick={endGame} icon={<RotateCcw className="w-4 h-4" />}>
            End Session
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // FEEDBACK PHASE
  if (phase === "feedback" && currentProblem) {
    const lastResult = results[results.length - 1];
    const bothCorrect = lastResult?.divisibilityCorrect && lastResult?.remainderCorrect;

    return (
      <GameCard>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary font-mono">{formatTime(elapsedTime)}</span>
          <span className="text-sm text-neon-indigo font-medium">
            {progress.current}/{progress.total}
          </span>
        </div>

        {/* Result summary */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
              ${bothCorrect ? "bg-success/20" : "bg-amber-500/20"}
            `}
          >
            {bothCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <Target className="w-8 h-8 text-amber-400" />
            )}
          </motion.div>
          <h3 className="text-xl font-bold text-text-primary mb-1">
            {bothCorrect ? "Perfect!" : "Keep practicing!"}
          </h3>
        </div>

        {/* Problem breakdown */}
        <div className="space-y-3 mb-6">
          <div className="text-center font-mono text-2xl text-text-primary mb-4">
            {currentProblem.display}
          </div>

          {/* Explanation */}
          <div className="p-3 bg-charcoal-light rounded-xl">
            <pre className="text-sm text-text-secondary font-mono whitespace-pre-wrap">
              {explainRemainder(currentProblem)}
            </pre>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-xl text-center ${
                lastResult?.divisibilityCorrect
                  ? "bg-success/10 border border-success/30"
                  : "bg-error/10 border border-error/30"
              }`}
            >
              <div className="text-xs text-text-muted mb-1">Divisibility</div>
              <div
                className={`font-medium ${
                  lastResult?.divisibilityCorrect ? "text-success" : "text-error"
                }`}
              >
                {lastResult?.divisibilityCorrect ? "Correct ✓" : "Incorrect ✗"}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl text-center ${
                lastResult?.remainderCorrect
                  ? "bg-success/10 border border-success/30"
                  : "bg-error/10 border border-error/30"
              }`}
            >
              <div className="text-xs text-text-muted mb-1">Remainder</div>
              <div
                className={`font-medium ${
                  lastResult?.remainderCorrect ? "text-success" : "text-error"
                }`}
              >
                {lastResult?.remainderCorrect
                  ? "Correct ✓"
                  : `${lastResult?.userRemainderAnswer} → ${currentProblem.remainder}`}
              </div>
            </div>
          </div>
        </div>

        <GameCardFooter>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleNextOrEnd}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            {problemCount >= maxProblems ? "See Results" : "Next Problem"}
          </Button>
        </GameCardFooter>
      </GameCard>
    );
  }

  // SUMMARY PHASE
  if (phase === "summary") {
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
          <h2 className="text-2xl font-bold text-text-primary">Session Complete!</h2>
          <p className="text-sm text-text-muted mt-1">
            {sessionAccuracy >= 80
              ? "Excellent work!"
              : sessionAccuracy >= 60
              ? "Good progress!"
              : "Keep practicing!"}
          </p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Accuracy highlight */}
          <div className="text-center p-4 bg-gradient-to-br from-neon-indigo/20 to-transparent rounded-xl border border-neon-indigo/30">
            <div className="text-sm font-medium text-neon-indigo-glow uppercase tracking-wider mb-1">
              Overall Accuracy
            </div>
            <div className="text-4xl font-bold text-text-primary">{sessionAccuracy}%</div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-charcoal-light rounded-xl text-center">
              <div className="text-xs text-text-muted mb-1">Divisibility</div>
              <div className="text-xl font-bold text-success">
                {correctDivCount}/{results.length}
              </div>
            </div>
            <div className="p-3 bg-charcoal-light rounded-xl text-center">
              <div className="text-xs text-text-muted mb-1">Remainders</div>
              <div className="text-xl font-bold text-neon-indigo">
                {correctRemCount}/{results.length}
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-charcoal-light/50 rounded-xl">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm ${
                  result.divisibilityCorrect && result.remainderCorrect
                    ? "bg-success/10"
                    : "bg-charcoal-light"
                }`}
              >
                <span className="font-mono text-xs text-text-secondary">
                  {result.problem.dividend} ÷ {result.problem.divisor}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      result.divisibilityCorrect ? "text-success" : "text-error"
                    }
                  >
                    {result.divisibilityCorrect ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      result.remainderCorrect ? "text-success" : "text-error"
                    }
                  >
                    R={result.problem.remainder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

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

  return null;
}
