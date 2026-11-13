import { ChevronRight } from "lucide-react";
import { chapters } from "@/content/coaching";
import { TopBar } from "@/components/ui/TopBar";

interface ChapterListProps {
  onHome: () => void;
  onOpen: (chapterId: string) => void;
}

export function ChapterList({ onHome, onOpen }: ChapterListProps) {
  return (
    <>
      <TopBar title="My CAT coaching tricks" backLabel="Home" onBack={onHome} />
      <div className="w-full max-w-md space-y-3">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onOpen(chapter.id)}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:border-neon-indigo/50 transition-colors"
          >
            <span className="flex-1 min-w-0">
              <span className="block text-lg font-semibold text-text-primary">{chapter.title}</span>
              <span className="block text-sm text-text-muted">{chapter.summary}</span>
              <span className="block text-xs text-text-muted mt-1">{chapter.tricks.length} tricks</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-text-muted" />
          </button>
        ))}
        <p className="text-xs text-text-muted text-center">More chapters as the classes cover them.</p>
      </div>
    </>
  );
}
