/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekWeekstrip, { weekRond } from "@/components/dashboard/dagboek/DagboekWeekstrip";

afterEach(cleanup);

const VANDAAG = "2026-10-06";

function strip(geselecteerd: string, onSelecteer = vi.fn()) {
  render(
    <DagboekWeekstrip
      dagen={weekRond(geselecteerd).map((datum) => ({ datum, gevuld: false, meetdag: false }))}
      geselecteerd={geselecteerd}
      onSelecteer={onSelecteer}
      vandaag={VANDAAG}
      geregistreerd={new Set(["2026-09-29"])}
    />,
  );
  return onSelecteer;
}

describe("DagboekWeekstrip", () => {
  it("bladert een week terug, maar niet voorbij vandaag", () => {
    const onSelecteer = strip(VANDAAG);
    expect(screen.getByText("Deze week")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Volgende week" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Vorige week" }));
    expect(onSelecteer).toHaveBeenCalledWith("2026-09-29", "pijl");
  });

  it("springt terug naar vandaag en kiest een dag in de kalender", () => {
    const onSelecteer = strip("2026-09-15");
    fireEvent.click(screen.getByRole("button", { name: "Vandaag" }));
    expect(onSelecteer).toHaveBeenCalledWith(VANDAAG, "vandaag");

    fireEvent.click(screen.getByRole("button", { name: "Kies" }));
    fireEvent.click(screen.getByRole("button", { name: /donderdag 10 september/ }));
    expect(onSelecteer).toHaveBeenCalledWith("2026-09-10", "kalender");
  });
});
