// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { ChainGame } from "../ChainGame";
import { DivisibilityGame } from "../DivisibilityGame";
import { MathGame } from "../MathGame";
import { PercentageGame } from "../PercentageGame";
import { RatioGame } from "../RatioGame";
import { useCancellableTimeout } from "@/hooks/useCancellableTimeout";
import { useChainStore } from "@/lib/chainStore";
import { useDivisibilityStore } from "@/lib/divisibilityStore";
import { usePracticeStore } from "@/lib/practiceStore";
import { useGameStore } from "@/lib/store";

// The games listen for keys on window, as a real keyboard session does
const press = (key: string) => fireEvent.keyDown(window, { key });
const type = (value: string | number) => String(value).split("").forEach(press);
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const status = () => screen.getByRole("status").textContent;

const answerWithKeypad = () => {
  type(1);
  press("Enter");
};

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  useGameStore.setState(useGameStore.getInitialState(), true);
  usePracticeStore.setState(usePracticeStore.getInitialState(), true);
  useChainStore.setState(useChainStore.getInitialState(), true);
  useDivisibilityStore.setState(useDivisibilityStore.getInitialState(), true);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ChainGame", () => {
  const startChain = () => {
    render(<ChainGame />);
    press("Enter");
    return useChainStore.getState().chain!.steps;
  };

  it("shows the sum for the step just answered, not the next one", () => {
    const [first, second] = startChain();
    type(first.result + 1);
    press("Enter");

    const worked = `${first.previousResult.toLocaleString()} + ${first.addend.toLocaleString()} = ${first.result.toLocaleString()}`;
    expect(screen.getByText(worked)).toBeTruthy();
    expect(screen.queryByText(new RegExp(`= ${second.result.toLocaleString()}$`))).toBeNull();
  });

  it("keeps what is typed for the next step when the feedback timer fires", () => {
    const [first] = startChain();
    type(first.result);
    press("Enter");
    type("98765");
    advance(2000);
    expect(screen.getByText("98765")).toBeTruthy();
  });

  it("hides the feedback message after its delay", () => {
    const [first] = startChain();
    type(first.result);
    press("Enter");
    expect(screen.getByText(/Correct!/)).toBeTruthy();
    advance(700);
    expect(screen.queryByText(/Correct!/)).toBeNull();
  });

  it("announces the verdict together with the next question", () => {
    const [first, second] = startChain();
    expect(status()).toBe(`${first.previousResult} plus ${first.addend}`);
    type(first.result + 1);
    press("Enter");
    expect(status()).toBe(
      `Incorrect. The answer was ${first.result}. ${second.previousResult} plus ${second.addend}`
    );
  });

  it("says the chain ended when it was stopped early", () => {
    const [first] = startChain();
    type(first.result);
    press("Enter");
    press("Escape");
    expect(screen.getByText("Chain Ended")).toBeTruthy();
    expect(screen.queryByText("Chain Complete!")).toBeNull();
  });
});

describe.each([
  ["Math", MathGame, answerWithKeypad],
  ["Percentage", PercentageGame, answerWithKeypad],
  ["Ratio", RatioGame, () => press("1")],
] as const)("%s session", (_name, Game, answer) => {
  it("doesn't swap the question after a quick end and restart", () => {
    render(<Game />);
    press("Enter");
    answer();
    press("Escape"); // ends during the feedback delay
    expect(screen.getByText("Session Finished")).toBeTruthy();

    press("Enter"); // close the summary
    press("Enter"); // start again
    const question = status();
    advance(3000);
    expect(status()).toBe(question);
  });

  it("goes straight back to setup when nothing was answered", () => {
    render(<Game />);
    press("Enter");
    press("Escape");
    expect(screen.getByText("Start Practice")).toBeTruthy();
    expect(screen.queryByText("Session Finished")).toBeNull();
  });

  it("has a tappable End button during play that shows the summary", () => {
    render(<Game />);
    press("Enter");
    answer();
    fireEvent.click(screen.getByRole("button", { name: "End session" }));
    expect(screen.getByText("Session Finished")).toBeTruthy();
  });
});

describe("End button in the step-based modes", () => {
  const endButton = () => screen.getByRole("button", { name: "End session" });

  it("Chain: ends the chain early", () => {
    render(<ChainGame />);
    press("Enter");
    type(1);
    press("Enter");
    fireEvent.click(endButton());
    expect(screen.getByText("Chain Ended")).toBeTruthy();
  });

  it("Divisibility: is available on all three steps of a problem", () => {
    render(<DivisibilityGame />);
    press("Enter");
    expect(endButton()).toBeTruthy(); // Is it divisible?
    press("n");
    expect(endButton()).toBeTruthy(); // What is the remainder?
    type(9);
    press("Enter");
    fireEvent.click(endButton()); // Feedback
    expect(screen.getByText("Session Ended")).toBeTruthy();
  });
});

describe("installed app layout", () => {
  it("doesn't set overflow in standalone mode, which stops the app scrolling", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const standalone = css.match(/display-mode:\s*standalone\)\s*\{[\s\S]*?\n\}/)?.[0];
    expect(standalone).toBeTruthy();
    expect(standalone).not.toMatch(/overflow:\s*(hidden|auto|scroll)/);
  });
});

describe("MathGame", () => {
  it("reports how long the question actually took", () => {
    render(<MathGame />);
    press("Enter");
    advance(2000);
    // Always wrong: a fixed guess like 1 can be right (45 - 44)
    type(useGameStore.getState().currentAnswer! + 1);
    press("Enter");
    press("Escape");
    expect(screen.getByText("2s")).toBeTruthy();
    expect(screen.getByText("0/1")).toBeTruthy();
  });

  it("doesn't queue a new question after leaving the mode", () => {
    const { unmount } = render(<MathGame />);
    press("Enter");
    answerWithKeypad();
    const question = useGameStore.getState().currentQuestion;
    unmount();
    advance(3000);
    expect(useGameStore.getState().currentQuestion).toBe(question);
  });
});

describe("PercentageGame", () => {
  it("remembers the chosen level after leaving the mode", () => {
    const { unmount } = render(<PercentageGame />);
    fireEvent.click(screen.getByRole("button", { name: "Raise difficulty" }));
    expect(screen.getByText("Level 2")).toBeTruthy();
    unmount();
    render(<PercentageGame />);
    expect(screen.getByText("Level 2")).toBeTruthy();
  });
});

describe("DivisibilityGame", () => {
  it("starts each problem with an empty remainder", () => {
    render(<DivisibilityGame />);
    press("Enter");
    press("n");
    type(9);
    press("Enter"); // submit the remainder
    press("Enter"); // next problem
    press("n");
    expect(screen.getByText("Remainder")).toBeTruthy();
  });

  it("Esc with nothing answered returns to setup without recording a game", () => {
    render(<DivisibilityGame />);
    press("Enter");
    press("Escape");
    expect(screen.getByText("Start Practice")).toBeTruthy();
    expect(useDivisibilityStore.getState().totalGamesPlayed).toBe(0);
  });
});

describe("useCancellableTimeout", () => {
  it("runs the scheduled action after the delay", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useCancellableTimeout());
    result.current.schedule(action, 500);
    vi.advanceTimersByTime(499);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does nothing once cancelled", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useCancellableTimeout());
    result.current.schedule(action, 500);
    result.current.cancel();
    vi.advanceTimersByTime(1000);
    expect(action).not.toHaveBeenCalled();
  });

  it("replaces a pending action when scheduled again", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useCancellableTimeout());
    result.current.schedule(first, 500);
    result.current.schedule(second, 500);
    vi.advanceTimersByTime(1000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("cancels when the component unmounts", () => {
    const action = vi.fn();
    const { result, unmount } = renderHook(() => useCancellableTimeout());
    result.current.schedule(action, 500);
    unmount();
    vi.advanceTimersByTime(1000);
    expect(action).not.toHaveBeenCalled();
  });
});
