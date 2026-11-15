import { ChevronRight, Clock } from "lucide-react";
import type { Chapter } from "@/content/coaching/types";
import { TopBar } from "@/components/ui/TopBar";

interface TrickListProps {
  chapter: Chapter;
  onBack: () => void;
  onOpen: (trickId: string) => void;
}

export function TrickList({ chapter, onBack, onOpen }: TrickListProps) {
  return (
    <>
      <TopBar title={chapter.title} backLabel="Chapters" onBack={onBack} />
      <div className="w-full max-w-md space-y-3">
        <p className="text-xs text-text-muted">From the {chapter.source}</p>

        {chapter.tricks.map((trick) => (
          <button
            key={trick.id}
            type="button"
            onClick={() => onOpen(trick.id)}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:border-neon-indigo/50 transition-colors"
          >
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-text-primary">{trick.title}</span>
              <span className="block text-sm text-text-muted">{trick.summary}</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-text-muted" />
          </button>
        ))}

        {chapter.comingLater.length > 0 && (
          <section className="p-4 rounded-2xl border border-soft-slate/30">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <Clock className="w-4 h-4" />
              Coming later
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-text-muted list-disc pl-5">
              {chapter.comingLater.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
