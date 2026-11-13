// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DrillGame } from "../DrillGame";
import { gradeFraction, gradePercent } from "@/lib/engines/percentMath";
import { drills } from "@/lib/engines/drills";
import type { DrillDefinition, DrillQuestion } from "@/lib/engines/drillTypes";
import { usePracticeStore } from "@/lib/practiceStore";
import { useProgressStore } from "@/lib/progressStore";

const press = (key: string) => fireEvent.keyDown(window, { key });
const type = (value: string) => value.split("").forEach(press);
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const status = () => screen.getByRole("status").textContent;

/** A drill that always asks the same question, so the screen can be checked exactly. */
function fixedDrill(question: Omit<DrillQuestion, "facts">): DrillDefinition {
  return {
    id: "fraction-to-percent",
    title: "Fixed drill",
    levels: [
      { level: 1, label: "First" },
      { level: 2, label: "Second" },
    ],
    generate: () => ({ ...question, facts: {} }),
  };
}

const threeSevenths = fixedDrill({
  display: "3/7",
  spoken: "3 over 7, as a percentage",
  answerKind: "percent",
  answer: "42.85%",
  grade: (input) => gradePercent(input, { k: 3, n: 7 }),
  explanation: "3/7 = 42.85% (cut off; exactly 42.857…%)",
});

const fourThirds = fixedDrill({
  display: "133.33%",
  spoken: "133.33 percent, as a fraction",
  answerKind: "fraction",
  answer: "4/3",
  grade: (input) => gradeFraction(input, { k: 4, n: 3 }),
  explanation: "133.33% = 4/3",
});

function start(drill: DrillDefinition) {
  render(<DrillGame drill={drill} trickTitle="The % chart" onBack={() => {}} />);
  press("Enter");
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  usePracticeStore.setState(usePracticeStore.getInitialState(), true);
  useProgressStore.setState(useProgressStore.getInitialState(), true);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("DrillGame", () => {
  it("announces the question and marks a right answer", () => {
    start(threeSevenths);
    expect(status()).toBe("3 over 7, as a percentage");
    type("42.85");
    press("Enter");
    expect(screen.getByText("Correct!")).toBeTruthy();
    expect(status()).toBe("Correct.");
  });

  it("explains the 3 × 14.28 trap", () => {
    start(threeSevenths);
    type("42.84");
    press("Enter");
    // On screen, and in the live region (which starts "Incorrect.")
    expect(screen.getByText(/^That's 3 × 14\.28/)).toBeTruthy();
    expect(status()).toMatch(/^Incorrect\. That's 3 × 14\.28/);
  });

  it("shows the answer and working after a wrong answer, and Enter skips ahead", () => {
    start(threeSevenths);
    type("50");
    press("Enter");
    expect(screen.getByText(/Answer: 42\.85%/)).toBeTruthy();
    press("Enter");
    expect(screen.queryByText(/Answer: 42\.85%/)).toBeNull();
    expect(screen.getByText("Answer")).toBeTruthy(); // empty answer box again
  });

  it("takes a fraction typed with the / key", () => {
    start(fourThirds);
    type("4/3");
    expect(screen.getByText("4/3")).toBeTruthy();
    press("Enter");
    expect(screen.getByText("Correct!")).toBeTruthy();
  });

  it("takes a fraction from the on-screen / key, and accepts an equivalent fraction", () => {
    start(fourThirds);
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Fraction bar" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: /Enter/ }));
    expect(screen.getByText("Correct!")).toBeTruthy();
  });

  it("ignores keys that don't fit the answer", () => {
    start(threeSevenths);
    type("4/2");
    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Fraction bar" })).toBeNull();
  });

  it("keeps the End button on screen and shows the summary", () => {
    start(threeSevenths);
    for (const answer of ["42.85", "42.86", "1"]) {
      type(answer);
      press("Enter");
      advance(4000);
    }
    fireEvent.click(screen.getByRole("button", { name: "End session" }));
    expect(screen.getByText("Session Finished")).toBeTruthy();
    expect(screen.getByText("2/3")).toBeTruthy();
    expect(useProgressStore.getState().rows.at(-1)?.mode).toBe("coach-fraction-to-percent");
  });

  it("remembers the chosen level for the drill", () => {
    const { unmount } = render(<DrillGame drill={threeSevenths} trickTitle="t" onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Level 2/ }));
    unmount();
    render(<DrillGame drill={threeSevenths} trickTitle="t" onBack={() => {}} />);
    expect(screen.getByRole("button", { name: /Level 2/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it.each(Object.keys(drills))("the real %s drill starts and asks a question", (id) => {
    start(drills[id as keyof typeof drills]);
    expect(screen.getByRole("button", { name: "End session" })).toBeTruthy();
    expect(status()?.length).toBeGreaterThan(0);
  });
});
