// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoortgangBewijsband from "@/components/dashboard/voortgang/VoortgangBewijsband";
import type { DashboardData } from "@/types/dashboard";

const CYCLE_EVIDENCE: NonNullable<DashboardData["cycleEvidence"]> = {
  activeDays: 8,
  cycleDay: 12,
  cycleDayRaw: 12,
  daysUntilRemeasure: 18,
  cycleStartDate: "2026-07-16",
  cycleEndDate: "2026-08-14",
};

const REMEASURE: NonNullable<DashboardData["remeasure"]> = {
  dueDate: "14 aug 2026",
  dueDateIso: "2026-08-14",
  daysUntil: 18,
};

function renderBand(props: Partial<Parameters<typeof VoortgangBewijsband>[0]> = {}) {
  render(
    <VoortgangBewijsband
      cycleEvidence={CYCLE_EVIDENCE}
      remeasure={REMEASURE}
      domainCheckDaysAgo={{ slaap: 4, voeding: 9 }}
      priorityLabel="Slaap"
      {...props}
    />,
  );
}

describe("VoortgangBewijsband", () => {
  it("renders every measurement as a real button", () => {
    renderBand();
    expect(screen.getByRole("button", { name: "Je leefstijlcheck — dag 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Voeding — dag 3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Slaap — dag 8" })).toBeTruthy();
  });

  it("moves the caption to the clicked day", () => {
    renderBand();
    fireEvent.click(screen.getByRole("button", { name: "Slaap — dag 8" }));
    expect(screen.getByText("Dag 8 · 23 jul")).toBeTruthy();
    expect(screen.getByText("Je mat je slaap.")).toBeTruthy();
  });

  it("moves the caption for the leefstijlcheck marker too", () => {
    renderBand();
    fireEvent.click(screen.getByRole("button", { name: "Je leefstijlcheck — dag 1" }));
    expect(screen.getByText("Dag 1 · 16 jul")).toBeTruthy();
  });

  it("marks the clicked day as pressed", () => {
    renderBand();
    fireEvent.click(screen.getByRole("button", { name: "Voeding — dag 3" }));
    expect(
      screen.getByRole("button", { name: "Voeding — dag 3" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Slaap — dag 8" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("shows no markers while the cycle is still waiting", () => {
    renderBand({ cycleEvidence: null });
    expect(screen.queryByRole("button", { name: /dag \d+/ })).toBeNull();
    expect(screen.getByText("Nog niets gelogd")).toBeTruthy();
  });
});
