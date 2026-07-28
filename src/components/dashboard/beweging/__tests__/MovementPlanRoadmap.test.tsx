// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MovementPlanRoadmap from "@/components/dashboard/beweging/MovementPlanRoadmap";
import type { MovementPlanRoadmapView } from "@/lib/movement-plan-roadmap";

const VIEW: MovementPlanRoadmapView = {
  activePhaseId: "phase-2",
  positionLabel: "Fase 2 van 3",
  headline: "Week 2–4: structureel krachttrainen",
  routeLine: "Jouw route: kracht, 2× per week. Want jij wilt je sterk voelen.",
  progressLine: "Afgelopen 7 dagen: 1 van 5 stappen gelogd",
  focusLine: "Uit je beweegcheck — Kracht opbouwen. Conditie staat op peil.",
  phases: [
    {
      id: "phase-1",
      title: "Deze week: kies je focus",
      horizonLabel: "Deze week",
      intro: "Kies een categorie.",
      state: "done",
      loggedCount: 4,
      stepCount: 4,
      spoorNote: "Jouw spoor Kracht: 2 van de 4 stappen in deze fase.",
    },
    {
      id: "phase-2",
      title: "Week 2–4: structureel krachttrainen",
      horizonLabel: "Week 2–4",
      intro: "Nu de basis staat, bouw je op.",
      state: "active",
      loggedCount: 1,
      stepCount: 5,
      spoorNote: "Jouw spoor Kracht: 2 van de 5 stappen in deze fase.",
    },
    {
      id: "phase-3",
      title: "Week 4–12: verankeren en meten",
      horizonLabel: "Week 4–12",
      intro: null,
      state: "ahead",
      loggedCount: 0,
      stepCount: 4,
      spoorNote: null,
    },
  ],
};

function Harness() {
  const [openPhaseId, setOpenPhaseId] = useState(VIEW.activePhaseId);
  return (
    <MovementPlanRoadmap
      view={VIEW}
      openPhaseId={openPhaseId}
      onOpenPhase={setOpenPhaseId}
      vandaagHref="/dashboard?tab=vandaag"
      renderPhaseBody={(phaseId) => <p>body-{phaseId}</p>}
    >
      <p>programma-kaart</p>
    </MovementPlanRoadmap>
  );
}

describe("MovementPlanRoadmap (S2)", () => {
  it("toont de positie en de gekozen route in de header", () => {
    render(<Harness />);
    expect(
      screen.getByText(/Fase 2 van 3 — Week 2–4: structureel krachttrainen/),
    ).toBeTruthy();
    expect(screen.getByText(VIEW.routeLine as string)).toBeTruthy();
    expect(screen.getByText(VIEW.progressLine as string)).toBeTruthy();
  });

  it("opent één paneel tegelijk — selecteren vervangt", () => {
    render(<Harness />);
    expect(screen.getByText("body-phase-2")).toBeTruthy();
    expect(screen.queryByText("body-phase-1")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Week 4–12/ }));

    expect(screen.getByText("body-phase-3")).toBeTruthy();
    expect(screen.queryByText("body-phase-2")).toBeNull();
    expect(document.querySelectorAll("article").length).toBe(1);
  });

  it("markeert de actieve fase zonder op kleur te leunen", () => {
    render(<Harness />);
    const active = screen.getByRole("button", { name: /Week 2–4/ });
    expect(active.getAttribute("aria-current")).toBe("step");
    expect(active.textContent).toContain("Nu · 1/5");

    const done = screen.getByRole("button", { name: /Deze week/ });
    expect(done.getAttribute("aria-current")).toBeNull();
    expect(done.textContent).toContain("Afgerond");
    expect(
      screen.getByRole("button", { name: /Week 4–12/ }).textContent,
    ).toContain("Later");
  });

  it("koppelt elk as-segment aan zijn paneel en toont de focus alleen op de actieve fase", () => {
    render(<Harness />);
    const active = screen.getByRole("button", { name: /Week 2–4/ });
    expect(active.getAttribute("aria-expanded")).toBe("true");
    expect(active.getAttribute("aria-controls")).toBe("phase-panel-phase-2");
    expect(screen.getByText(VIEW.focusLine as string)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Deze week/ }));
    expect(screen.queryByText(VIEW.focusLine as string)).toBeNull();
    expect(
      screen.getByText("Jouw spoor Kracht: 2 van de 4 stappen in deze fase."),
    ).toBeTruthy();
  });

  it("rendert de programma-kaart als kind van de inhoudskolom", () => {
    render(<Harness />);
    expect(screen.getByText("programma-kaart")).toBeTruthy();
  });
});
