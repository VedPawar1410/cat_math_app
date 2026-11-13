import { useCallback, useMemo, useSyncExternalStore } from "react";
import { parseRoute, routeToHash, type Route } from "@/lib/route";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash;

interface NavigateOptions {
  /** Replace the current history entry, e.g. when switching tabs. */
  replace?: boolean;
}

/** The current screen, from the URL hash, and a way to move to another one. */
export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const route = useMemo(() => parseRoute(hash), [hash]);

  const navigate = useCallback((next: Route, { replace = false }: NavigateOptions = {}) => {
    const target = routeToHash(next) || `${window.location.pathname}${window.location.search}`;
    if (replace) {
      window.history.replaceState(null, "", target);
    } else {
      window.history.pushState(null, "", target);
    }
    // pushState and replaceState don't fire hashchange, so tell listeners ourselves
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return { route, navigate };
}
