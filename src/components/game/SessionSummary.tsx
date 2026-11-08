import { ArrowRight, Play, Trophy } from "lucide-react";
import { GameCardFooter } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import type { SessionResult } from "@/hooks/useSessionRecorder";

interface SessionSummaryProps {
  result: SessionResult;
  onBack: () => void;
  onPlayAgain: () => void;
}

export function SessionSummary({ result, onBack, onPlayAgain }: SessionSummaryProps) {
  const accuracy = Math.round((result.correct / result.answered) * 100);
  const tiles = [
    { label: "Correct", value: `${result.correct}/${result.answered}` },
    { label: "Avg Time", value: `${result.averageSeconds}s` },
    { label: "Best Streak", value: String(result.bestStreak) },
  ];

  return (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-indigo/20 mb-4">
          <Trophy className="w-8 h-8 text-neon-indigo-glow" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Session Finished</h2>
        <p className="text-sm text-text-muted mt-1">
          {accuracy >= 80 ? "Excellent work!" : accuracy >= 60 ? "Good progress!" : "Keep practicing!"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center p-4 bg-gradient-to-br from-neon-indigo/20 to-transparent rounded-xl border border-neon-indigo/30">
          <div className="text-sm font-medium text-neon-indigo-glow uppercase tracking-wider mb-1">
            Accuracy
          </div>
          <div className="text-4xl font-bold text-text-primary">{accuracy}%</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="p-3 bg-charcoal-light rounded-xl text-center">
              <div className="text-xs text-text-muted mb-1">{tile.label}</div>
              <div className="text-xl font-bold text-text-primary">{tile.value}</div>
            </div>
          ))}
        </div>
      </div>

      <GameCardFooter className="flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={onBack}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={onPlayAgain}
          icon={<Play className="w-4 h-4" />}
        >
          Play Again
        </Button>
      </GameCardFooter>
    </>
  );
}
