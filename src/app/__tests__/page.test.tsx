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

  it("an old #mode= link still opens that mode", async () => {
    window.history.replaceState(null, "", "/#mode=chain");
    render(<Home />);
    expect(await screen.findByText("Addition Chain")).toBeTruthy();
  });
});
