import { motion } from "framer-motion";

interface StatsPreviewProps {
  total: number;
  correct: number;
  bestStreak: number;
}

export function StatsPreview({ total, correct, bestStreak }: StatsPreviewProps) {
  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-2 p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20"
    >
      <div className="text-center">
        <div className="text-lg font-bold text-text-primary">{total}</div>
        <div className="text-xs text-text-muted">Total</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-success">{Math.round((correct / total) * 100)}%</div>
        <div className="text-xs text-text-muted">Accuracy</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-neon-indigo-glow">{bestStreak}</div>
        <div className="text-xs text-text-muted">Best Streak</div>
      </div>
    </motion.div>
  );
}
