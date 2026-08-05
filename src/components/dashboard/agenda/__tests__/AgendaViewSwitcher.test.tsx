// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgendaViewSwitcher from "@/components/dashboard/agenda/AgendaViewSwitcher";

afterEach(() => {
  cleanup();
});

describe("AgendaViewSwitcher — embedded (in de toolbar)", () => {
  it("heeft korte labels (D/W/M) náást de volledige labels, met een stabiel aria-label", () => {
    render(<AgendaViewSwitcher value="dag" onChange={vi.fn()} embedded />);

    // Korte variant (zichtbaar onder sm:) staat er altijd in de DOM.
    expect(screen.getByText("D")).toBeTruthy();
    expect(screen.getByText("W")).toBeTruthy();
    expect(screen.getByText("M")).toBeTruthy();
    // Volledige variant (zichtbaar vanaf sm:) ook — jsdom kent geen viewport,
    // dus beide staan er; de accessible name blijft altijd het volledige woord.
    expect(screen.getByText("Dag")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dag" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Week" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Maand" })).toBeTruthy();
  });

  it("roept onChange aan met de juiste view", () => {
    const onChange = vi.fn();
    render(<AgendaViewSwitcher value="dag" onChange={onChange} embedded />);

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("markeert de actieve view met aria-current", () => {
    render(<AgendaViewSwitcher value="week" onChange={vi.fn()} embedded />);
    expect(screen.getByRole("button", { name: "Week" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("button", { name: "Dag" }).getAttribute("aria-current")).toBeNull();
  });
});
