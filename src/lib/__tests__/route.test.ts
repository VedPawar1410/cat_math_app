import { describe, expect, it } from "vitest";
import { ARUN_MODES, isCoachingRoute, parseRoute, routeToHash, type Route } from "../route";

describe("route", () => {
  it.each(["", "#"])("opens the home screen for %j", (hash) => {
    expect(parseRoute(hash)).toEqual({ screen: "home" });
  });

  it.each(ARUN_MODES)("keeps old #mode=%s links working", (mode) => {
    expect(parseRoute(`#mode=${mode}`)).toEqual({ screen: "arun", mode });
  });

  it("reads the coaching screens", () => {
    expect(parseRoute("#coaching")).toEqual({ screen: "chapters" });
    expect(parseRoute("#coaching=percentages")).toEqual({ screen: "chapter", chapterId: "percentages" });
    expect(parseRoute("#coaching=percentages/x-percent-of-n")).toEqual({
      screen: "trick",
      chapterId: "percentages",
      trickId: "x-percent-of-n",
    });
    expect(parseRoute("#coaching=percentages/x-percent-of-n/practice/percent-of")).toEqual({
      screen: "drill",
      chapterId: "percentages",
      trickId: "x-percent-of-n",
      drillId: "percent-of",
    });
  });

  it.each([
    "#mode=nope",
    "#mode=",
    "#coaching=",
    "#coaching=percentages/x/y",
    "#coaching=percentages/x/notpractice/y",
    "#coaching=Percentages",
    "#coaching=a b",
    "#coaching=../etc",
    "#something",
  ])("sends %j to the home screen", (hash) => {
    expect(parseRoute(hash)).toEqual({ screen: "home" });
  });

  it("round-trips every kind of route", () => {
    const routes: Route[] = [
      { screen: "home" },
      ...ARUN_MODES.map((mode) => ({ screen: "arun" as const, mode })),
      { screen: "chapters" },
      { screen: "chapter", chapterId: "percentages" },
      { screen: "trick", chapterId: "percentages", trickId: "percent-chart" },
      { screen: "drill", chapterId: "percentages", trickId: "percent-chart", drillId: "fraction-to-percent" },
    ];
    for (const route of routes) expect(parseRoute(routeToHash(route))).toEqual(route);
    expect(routeToHash({ screen: "home" })).toBe("");
  });

  it("tells coaching screens apart", () => {
    expect(isCoachingRoute({ screen: "chapters" })).toBe(true);
    expect(isCoachingRoute({ screen: "arun", mode: "math" })).toBe(false);
    expect(isCoachingRoute({ screen: "home" })).toBe(false);
  });
});
