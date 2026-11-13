"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Clock, Flame, Play, Target } from "lucide-react";
import { GameCard, GameCardContent, GameCardFooter, GameCardHeader } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { NumPad } from "@/components/ui/NumPad";
import { EndSessionButton } from "@/components/ui/EndSessionButton";
import { ScreenReaderStatus } from "@/components/ui/ScreenReaderStatus";
import { StatsPreview } from "@/components/ui/StatsPreview";
import { ProgressChart } from "@/components/ui/ProgressChart";
import { TopBar } from "@/components/ui/TopBar";
import { SessionSummary } from "@/components/game/SessionSummary";
import { useCancellableTimeout } from "@/hooks/useCancellableTimeout";
import { useSessionRecorder, type SessionResult } from "@/hooks/useSessionRecorder";
import { newRecord, usePracticeStore, type CoachingPracticeMode } from "@/lib/practiceStore";
import type { DrillDefinition, DrillQuestion } from "@/lib/engines/drillTypes";

type Feedback = "neutral" | "correct" | "incorrect";

const MAX_INPUT = 8;
// A wrong answer shows the working, so it stays up longer; Enter or Next skips ahead
const NEXT_DELAY_MS = { correct: 900, incorrect: 3500 };

interface DrillGameProps {
  drill: DrillDefinition;
  trickTitle: string;
  onBack: () => void;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** One timed practice session for any coaching drill, in the same shell as the other games. */
export function DrillGame({ drill, trickTitle, onBack }: DrillGameProps) {
  const mode: CoachingPracticeMode = `coach-${drill.id}`;
  const record = usePracticeStore((state) => state.records[mode]) ?? newRecord;
  const setSavedLevel = usePracticeStore((state) => state.setDifficulty);
  const saveAnswer = usePracticeStore((state) => state.recordAnswer);
  const level = drill.levels.some((option) => option.level === record.difficulty)
    ? record.difficulty
    : drill.levels[0].level;

  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("neutral");
  const [trap, setTrap] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState<SessionResult | null>(null);
  const { schedule: scheduleNext, cancel: cancelNext } = useCancellableTimeout();
  const { startSession, markQuestionShown, recordAnswer, finishSession } = useSessionRecorder();

  useEffect(() => {
    if (!isPlaying || !startTime) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, startTime]);

  const nextQuestion = useCallback(() => {
    cancelNext();
    setQuestion(drill.generate(level));
    markQuestionShown();
    setFeedback("neutral");
    setTrap(null);
    setInput("");
  }, [cancelNext, drill, level, markQuestionShown]);

  const startGame = useCallback(() => {
    startSession();
    setSummary(null);
    setIsPlaying(true);
    setAnswered(0);
    setCorrectCount(0);
    setStreak(0);
    setStartTime(Date.now());
    setElapsed(0);
    nextQuestion();
  }, [startSession, nextQuestion]);

  const resetGame = useCallback(() => {
    cancelNext();
    setIsPlaying(false);
    setQuestion(null);
    setFeedback("neutral");
    setTrap(null);
    setInput("");
    setStartTime(null);
    setElapsed(0);
  }, [cancelNext]);

  const endSession = useCallback(() => {
    setSummary(finishSession(mode, level));
    resetGame();
  }, [finishSession, mode, level, resetGame]);

  const submit = useCallback(() => {
    if (!question || feedback !== "neutral" || input === "") return;
    const grade = question.grade(input);
    const nextStreak = grade.correct ? streak + 1 : 0;
    recordAnswer(grade.correct);
    saveAnswer(mode, grade.correct, nextStreak);
    setFeedback(grade.correct ? "correct" : "incorrect");
    setTrap(grade.trap ?? null);
    setAnswered((count) => count + 1);
    if (grade.correct) setCorrectCount((count) => count + 1);
    setStreak(nextStreak);
    scheduleNext(nextQuestion, grade.correct ? NEXT_DELAY_MS.correct : NEXT_DELAY_MS.incorrect);
  }, [question, feedback, input, streak, recordAnswer, saveAnswer, mode, scheduleNext, nextQuestion]);

  const typeKey = useCallback(
    (key: string) => {
      if (feedback !== "neutral" || !question) return;
      setInput((current) => {
        if (current.length >= MAX_INPUT) return current;
        if (key === ".") {
          if (question.answerKind !== "percent" || current.includes(".")) return current;
          return current === "" ? "0." : `${current}.`;
        }
        if (key === "/") {
          if (question.answerKind !== "fraction" || current === "" || current.includes("/")) return current;
          return `${current}/`;
        }
        return /^\d$/.test(key) ? current + key : current;
      });
    },
    [feedback, question]
  );

  const deleteKey = useCallback(() => {
    if (feedback === "neutral") setInput((current) => current.slice(0, -1));
  }, [feedback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (summary) {
        if (event.key === "Enter" || event.key === "Escape") setSummary(null);
        return;
      }
      if (!isPlaying) {
        if (event.key === "Enter") startGame();
        return;
      }
      if (event.key === "Escape") {
        endSession();
        return;
      }
      if (feedback !== "neutral") {
        if (event.key === "Enter") nextQuestion();
        return;
      }
      if (event.key === "Enter") submit();
      else if (event.key === "Backspace") deleteKey();
      else if (/^[\d./]$/.test(event.key)) typeKey(event.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [summary, isPlaying, feedback, startGame, endSession, nextQuestion, submit, deleteKey, typeKey]);

  let announcement = "";
  if (summary) {
    announcement = `Session finished. ${summary.correct} of ${summary.answered} correct.`;
  } else if (question) {
    if (feedback === "correct") announcement = "Correct.";
    else if (feedback === "incorrect") announcement = `Incorrect. ${trap ?? `The answer is ${question.answer}. ${question.explanation}`}`;
    else announcement = question.spoken;
  }

  const boxStyle =
    feedback === "correct"
      ? "border-success bg-success/10 text-success"
      : feedback === "incorrect"
        ? "border-error bg-error/10 text-error animate-shake"
        : "border-soft-slate/30";
  const longPrompt = (question?.display.length ?? 0) > 12;

  return (
    <>
      <TopBar title={drill.title} backLabel="Learn" onBack={onBack} />

      <div className="w-full max-w-md">
        <GameCard>
          <ScreenReaderStatus message={announcement} />
          {summary ? (
            <SessionSummary result={summary} onBack={() => setSummary(null)} onPlayAgain={startGame} />
          ) : !isPlaying ? (
            <>
              <GameCardHeader title={drill.title} subtitle={trickTitle} icon={<Target className="w-5 h-5" />} />
              <GameCardContent>
                {drill.levels.length > 1 ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-text-secondary">Level</span>
                    <div className="grid gap-2">
                      {drill.levels.map((option) => (
                        <button
                          key={option.level}
                          type="button"
                          aria-pressed={option.level === level}
                          onClick={() => setSavedLevel(mode, option.level as 1 | 2 | 3)}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            option.level === level
                              ? "bg-neon-indigo text-white"
                              : "bg-charcoal-medium text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <span className="font-semibold">Level {option.level}</span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">{drill.levels[0].label}</p>
                )}

                <StatsPreview total={record.totalQuestions} correct={record.correctAnswers} bestStreak={record.bestStreak} />
                <ProgressChart mode={mode} level={level} />
              </GameCardContent>

              <GameCardFooter>
                <Button variant="primary" size="lg" className="w-full" onClick={startGame} icon={<Play className="w-5 h-5" />}>
                  Start Practice
                </Button>
              </GameCardFooter>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-sm">{formatTime(elapsed)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neon-indigo-glow">
                    <Flame className="w-4 h-4" />
                    <span className="font-mono text-sm font-bold">{streak}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-text-secondary">
                    <span className="text-success font-bold">{correctCount}</span>
                    <span className="mx-1">/</span>
                    <span>{answered}</span>
                  </div>
                  <EndSessionButton onClick={endSession} />
                </div>
              </div>

              {question && (
                <p
                  className={`text-center font-bold text-text-primary py-2 ${
                    longPrompt ? "text-lg leading-snug" : "text-4xl sm:text-5xl font-mono"
                  }`}
                >
                  {question.display}
                </p>
              )}

              <div className="mt-2 w-full max-w-xs mx-auto">
                <div
                  className={`relative w-full px-4 py-3 text-2xl sm:text-3xl font-mono font-bold text-center bg-charcoal-light border-2 rounded-xl min-h-[56px] flex items-center justify-center transition-all duration-200 ${boxStyle}`}
                >
                  {input || <span className="text-text-muted">{question?.answerKind === "fraction" ? "a/b" : "Answer"}</span>}
                  {question?.answerKind === "percent" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-text-muted">%</span>
                  )}
                </div>

                {/* Reserved space so the numpad stays put when feedback appears */}
                <div className="min-h-[3.25rem] mt-1 text-center text-sm">
                  {feedback === "correct" && <p className="font-medium text-success">Correct!</p>}
                  {feedback === "incorrect" && question && (
                    <>
                      <p className={trap ? "text-amber-400" : "text-error"}>
                        {trap ?? `Answer: ${question.answer}. ${question.explanation}`}
                      </p>
                      <button
                        type="button"
                        onClick={nextQuestion}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary underline"
                      >
                        Next <ArrowRight className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <NumPad
                onDigit={typeKey}
                onDecimal={() => typeKey(".")}
                onDelete={deleteKey}
                onEnter={submit}
                disabled={feedback !== "neutral"}
                showDecimal={question?.answerKind === "percent"}
                showSlash={question?.answerKind === "fraction"}
              />
            </>
          )}
        </GameCard>
      </div>
    </>
  );
}
