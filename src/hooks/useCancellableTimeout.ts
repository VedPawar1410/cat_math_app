import { useCallback, useEffect, useRef } from "react";

/**
 * A single delayed action that can be cancelled, and is cancelled automatically
 * when the component unmounts. Scheduling again replaces any pending action.
 */
export function useCancellableTimeout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const schedule = useCallback(
    (action: () => void, delayMs: number) => {
      cancel();
      timer.current = setTimeout(action, delayMs);
    },
    [cancel]
  );

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}
