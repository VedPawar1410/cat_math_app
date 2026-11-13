/**
 * Every screen lives in the URL hash, so the app stays on "/" and the service
 * worker's cached home page covers all of it offline. "#mode=ratio" links from
 * before the coaching track still open the Arun Sharma modes.
 */

export const ARUN_MODES = ["math", "percentage", "ratio", "chain", "divisibility"] as const;
export type ArunMode = (typeof ARUN_MODES)[number];

export type Route =
  | { screen: "home" }
  | { screen: "arun"; mode: ArunMode }
  | { screen: "chapters" }
  | { screen: "chapter"; chapterId: string }
  | { screen: "trick"; chapterId: string; trickId: string }
  | { screen: "drill"; chapterId: string; trickId: string; drillId: string };

export type CoachingRoute = Extract<Route, { screen: "chapters" | "chapter" | "trick" | "drill" }>;

const HOME: Route = { screen: "home" };
const ID = /^[a-z0-9-]+$/;

function isArunMode(value: string): value is ArunMode {
  return (ARUN_MODES as readonly string[]).includes(value);
}

export function isCoachingRoute(route: Route): route is CoachingRoute {
  return route.screen === "chapters" || route.screen === "chapter" || route.screen === "trick" || route.screen === "drill";
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, "");
  if (raw === "") return HOME;

  if (raw.startsWith("mode=")) {
    const mode = raw.slice("mode=".length);
    return isArunMode(mode) ? { screen: "arun", mode } : HOME;
  }

  if (raw === "coaching") return { screen: "chapters" };

  if (raw.startsWith("coaching=")) {
    const parts = raw.slice("coaching=".length).split("/");
    if (!parts.every((part) => ID.test(part))) return HOME;
    const [chapterId, trickId, practice, drillId] = parts;
    if (parts.length === 1) return { screen: "chapter", chapterId };
    if (parts.length === 2) return { screen: "trick", chapterId, trickId };
    if (parts.length === 4 && practice === "practice") return { screen: "drill", chapterId, trickId, drillId };
  }

  return HOME;
}

/** The hash for a route; "" for the home screen. */
export function routeToHash(route: Route): string {
  switch (route.screen) {
    case "home":
      return "";
    case "arun":
      return `#mode=${route.mode}`;
    case "chapters":
      return "#coaching";
    case "chapter":
      return `#coaching=${route.chapterId}`;
    case "trick":
      return `#coaching=${route.chapterId}/${route.trickId}`;
    case "drill":
      return `#coaching=${route.chapterId}/${route.trickId}/practice/${route.drillId}`;
  }
}
