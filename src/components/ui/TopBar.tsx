import { ChevronLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  backLabel: string;
  onBack: () => void;
}

/**
 * Back control and screen title. Sticky below the notch so the way out stays on
 * screen on long pages; the installed iPhone app has no back button of its own.
 * Hidden during a session (app-chrome), where the End button is the way out.
 */
export function TopBar({ title, backLabel, onBack }: TopBarProps) {
  return (
    <div className="app-chrome sticky top-[var(--sat)] z-20 w-full max-w-md mb-3 py-2 bg-charcoal/90 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg pl-1.5 pr-3 py-1.5 text-sm font-medium bg-charcoal-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <h1 className="text-base font-semibold text-text-primary truncate">{title}</h1>
      </div>
    </div>
  );
}
