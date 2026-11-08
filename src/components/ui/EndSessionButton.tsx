import { X } from "lucide-react";

/**
 * The way out of a session on a phone, where there is no Esc key. Lives at the
 * top of the card so it can't end up below the fold. globals.css also watches
 * for data-session-active to hide the page header while a session is running.
 */
export function EndSessionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-session-active
      onClick={onClick}
      aria-label="End session"
      className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-charcoal-medium text-text-secondary hover:text-text-primary transition-colors"
    >
      <X className="w-3.5 h-3.5" />
      End
    </button>
  );
}
