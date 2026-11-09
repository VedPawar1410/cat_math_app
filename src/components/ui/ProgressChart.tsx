import {
  rowsFor,
  summariseProgress,
  useProgressStore,
  type ProgressMode,
} from "@/lib/progressStore";

interface ProgressChartProps {
  mode: ProgressMode;
  level: number;
}

const WIDTH = 300;
const HEIGHT = 64;
const PADDING = 6;
const MAX_POINTS = 30;

/** Median time per question across recent sessions at the selected mode and level. */
export function ProgressChart({ mode, level }: ProgressChartProps) {
  const rows = useProgressStore((state) => state.rows);
  const sessions = rowsFor(rows, mode, level).slice(-MAX_POINTS);
  const summary = summariseProgress(sessions);
  if (!summary) return null;

  const times = sessions.map((session) => session.medianSeconds);
  const slowest = Math.max(...times);
  const fastest = Math.min(...times);
  const range = slowest - fastest || 1;

  const points = times.map((time, index) => ({
    x: PADDING + (index * (WIDTH - PADDING * 2)) / (times.length - 1),
    y: PADDING + ((slowest - time) / range) * (HEIGHT - PADDING * 2),
  }));
  const lastPoint = points[points.length - 1];

  const description = `Median time per question went from ${summary.startSeconds} to ${summary.latestSeconds} seconds over ${summary.sessions} sessions at level ${level}. Accuracy went from ${summary.startAccuracy} to ${summary.latestAccuracy} percent.`;

  return (
    <div className="mt-4 p-3 bg-charcoal-light/50 rounded-xl border border-soft-slate/20">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-text-primary">
          {summary.startSeconds}s → {summary.latestSeconds}s
        </span>
        <span className="text-xs text-text-muted">median, {summary.sessions} sessions</span>
      </div>

      <div className="flex gap-2 mt-2">
        <div className="flex flex-col justify-between text-xs tabular-nums text-text-muted" aria-hidden="true">
          <span>{slowest}s</span>
          <span>{fastest}s</span>
        </div>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-0 h-auto flex-1"
          role="img"
          aria-label={description}
        >
          <polyline
            points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
            fill="none"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="stroke-neon-indigo-glow"
          />
          <circle cx={lastPoint.x} cy={lastPoint.y} r="4" className="fill-neon-indigo-glow" />
        </svg>
      </div>

      <p className="text-xs text-text-muted mt-2">
        Accuracy {summary.startAccuracy}% → {summary.latestAccuracy}% · lower line is faster
      </p>
    </div>
  );
}
