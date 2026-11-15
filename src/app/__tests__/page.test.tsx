// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Home from "../page";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("home screen and tracks", () => {
  it("opens on a choice between the two tracks", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /Arun Sharma/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /My CAT coaching tricks/ })).toBeTruthy();
  });

  it("Arun Sharma opens the five modes, and Home comes back", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Arun Sharma/ }));
    expect(window.location.hash).toBe("#mode=math");
    expect(await screen.findByText("Addition & Subtraction")).toBeTruthy();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "Ratio" }));
    expect(window.location.hash).toBe("#mode=ratio");
    expect(await screen.findByText("Ratio Comparison")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(window.location.hash).toBe("");
    expect(await screen.findByRole("button", { name: /My CAT coaching tricks/ })).toBeTruthy();
  });

  it("switching tabs doesn't add history entries", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Arun Sharma/ }));
    const length = window.history.length;
    fireEvent.click(screen.getByRole("button", { name: "Chain" }));
    fireEvent.click(screen.getByRole("button", { name: "Divide" }));
    expect(window.history.length).toBe(length);
  });

  it("My CAT coaching tricks opens the chapter list", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /My CAT coaching tricks/ }));
    expect(window.location.hash).toBe("#coaching");
    expect(await screen.findByRole("button", { name: /Percentages/ })).toBeTruthy();
  });

  it("a chapter lists its tricks and what's coming later", async () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /My CAT coaching tricks/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Percentages/ }));
    expect(window.location.hash).toBe("#coaching=percentages");
    for (const title of ["The % chart (1/2 to 1/20)", "Memory bank", "x% of N", "More vs less"]) {
      expect(screen.getByRole("button", { name: new RegExp(title.replace(/[()%/]/g, ".")) })).toBeTruthy();
    }
    expect(screen.getByText("Coming later")).toBeTruthy();
    expect(screen.getByText(/Percentage point/)).toBeTruthy();
  });

  it("a trick's Learn view shows the rule, worked examples and traps", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/x-percent-of-n");
    render(<Home />);
    expect(await screen.findByRole("heading", { name: "Rule" })).toBeTruthy();
    expect(screen.getByText(/Whatever number is given, it is 100%/)).toBeTruthy();
    expect(screen.getByText("44.44% of 270")).toBeTruthy();
    expect(screen.getByText("Handout Q1(c)")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Common traps" })).toBeTruthy();
    expect(screen.getByText(/Reading 2% as 1\/5/)).toBeTruthy();
  });

  it("the chart Learn view shows the chart values from class", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/percent-chart");
    render(<Home />);
    expect(await screen.findByText("14.28%")).toBeTruthy();
    expect(screen.getByText("133.33%")).toBeTruthy();
  });

  it("says so when the class gave no examples or traps", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/memory-bank");
    render(<Home />);
    expect(await screen.findAllByText("None noted in class yet.")).toHaveLength(2);
    expect(screen.getByText("900")).toBeTruthy();
    expect(screen.getByText("3375")).toBeTruthy();
  });

  it("Practice opens the trick's drill", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/x-percent-of-n");
    render(<Home />);
    fireEvent.click(await screen.findByRole("button", { name: /Practice: x% of N/ }));
    expect(window.location.hash).toBe("#coaching=percentages/x-percent-of-n/practice/percent-of");
  });

  it("back controls walk up the screens", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/more-vs-less");
    render(<Home />);
    fireEvent.click(await screen.findByRole("button", { name: "Percentages" }));
    expect(window.location.hash).toBe("#coaching=percentages");
    fireEvent.click(await screen.findByRole("button", { name: "Chapters" }));
    expect(window.location.hash).toBe("#coaching");
    fireEvent.click(await screen.findByRole("button", { name: "Home" }));
    expect(window.location.hash).toBe("");
  });

  it("a practice link opens the drill, ready to start", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/percent-chart/practice/fraction-to-percent");
    render(<Home />);
    expect(await screen.findByRole("button", { name: /Start Practice/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Learn" })).toBeTruthy();
  });

  it("a drill that doesn't belong to the trick shows a way back", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/percent-chart/practice/squares");
    render(<Home />);
    expect(await screen.findByText("That practice drill isn't part of this trick.")).toBeTruthy();
  });

  it("an unknown trick shows a way back instead of a blank screen", async () => {
    window.history.replaceState(null, "", "/#coaching=percentages/nope");
    render(<Home />);
    expect(await screen.findByText("That trick isn't in this chapter.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Chapters" })).toBeTruthy();
  });

  it("an old #mode= link still opens that mode", async () => {
    window.history.replaceState(null, "", "/#mode=chain");
    render(<Home />);
    expect(await screen.findByText("Addition Chain")).toBeTruthy();
  });
});
