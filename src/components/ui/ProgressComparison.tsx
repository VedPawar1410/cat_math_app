import { describeComparison, useProgressStore } from "@/lib/progressStore";

/** One line on the results screen: how this session compares with recent ones. */
export function ProgressComparison() {
  const latest = useProgressStore((state) => state.latest);
  if (!latest) return null;

  const { faster, speed, accuracy } = describeComparison(latest);

  return (
    <div className="p-3 bg-charcoal-light rounded-xl text-center">
      <p className={`text-sm font-medium ${faster ? "text-success" : "text-text-primary"}`}>{speed}</p>
      <p className="text-xs text-text-muted mt-1">{accuracy}</p>
    </div>
  );
}
