import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";

interface HomeScreenProps {
  onArunSharma: () => void;
  onCoaching: () => void;
}

const choiceClass =
  "w-full glass-card rounded-2xl p-5 flex items-center gap-4 text-left hover:border-neon-indigo/50 transition-colors";

export function HomeScreen({ onArunSharma, onCoaching }: HomeScreenProps) {
  return (
    <div className="w-full max-w-md space-y-3">
      <button type="button" onClick={onArunSharma} className={choiceClass}>
        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-neon-indigo/20 text-neon-indigo-glow">
          <BookOpen className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-semibold text-text-primary">Arun Sharma</span>
          <span className="block text-sm text-text-muted">
            Five drill modes: mental math, percentages, ratios, chains and remainders
          </span>
        </span>
        <ChevronRight className="w-5 h-5 shrink-0 text-text-muted" />
      </button>

      <button type="button" onClick={onCoaching} className={choiceClass}>
        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-neon-indigo/20 text-neon-indigo-glow">
          <GraduationCap className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-semibold text-text-primary">My CAT coaching tricks</span>
          <span className="block text-sm text-text-muted">
            Tricks from my classes, chapter by chapter, with Learn and Practice
          </span>
        </span>
        <ChevronRight className="w-5 h-5 shrink-0 text-text-muted" />
      </button>
    </div>
  );
}
