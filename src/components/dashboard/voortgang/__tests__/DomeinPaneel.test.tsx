// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DomeinPaneel from "@/components/dashboard/voortgang/DomeinPaneel";
import { buildDomeinPaneel } from "@/lib/domein-paneel";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement } from "@/types/dashboard";

const trackEvent = vi.fn();
const clarityTag = vi.fn();

vi.mock("@/lib/ga4", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/clarity", () => ({
  clarityTag: (...args: unknown[]) => clarityTag(...args),
}));

function moment(id: string, dateLabel: string, score: number): DomainMeasurement {
  return {
    id,
    dateIso: "2026-08-12",
    dateLabel,
    daysAgo: 3,
    score,
    source: "intake",
    values: [],
  };
}

function reeks(moments: DomainMeasurement[]): Meetreeks {
  return {
    moments,
    scoreRow: {
      key: "__score__",
      label: "Score",
      cells: [],
      levelMax: 100,
      scale: "score",
      plottable: moments.length > 1,
    },
    valueRows: [],
  };
}

describe("DomeinPaneel", () => {
  beforeEach(() => {
    trackEvent.mockClear();
    clarityTag.mockClear();
  });

  it("toont het cijfer met de bron erbij", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: reeks([moment("a", "12 aug 2026", 62), moment("b", "1 aug 2026", 55)]),
      score: 62,
      daysAgo: 3,
      hermetingLabel: "24 sep",
    });
    render(
      <DomeinPaneel paneel={paneel} domain="voeding" domainLabel="Voeding" surface="test" />,
    );
    expect(screen.getByText("62")).toBeTruthy();
    expect(screen.getByText(/uit je check van 3 dagen geleden/)).toBeTruthy();
  });

  /**
   * De reeks staat op P5 (Meten & timing) en op Voortgang-home. Stond hij hier
   * ook, dan zag je dezelfde lijn drie keer op één scherm — daarom legt deze
   * test vast dat het paneel er niets meer over zegt.
   */
  it("draagt de reeks niet meer", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: reeks([moment("a", "12 aug 2026", 62), moment("b", "1 aug 2026", 55)]),
      score: 62,
      daysAgo: 3,
      hermetingLabel: "24 sep",
    });
    render(
      <DomeinPaneel paneel={paneel} domain="voeding" domainLabel="Voeding" surface="test" />,
    );
    expect(screen.queryByText(/Sinds je eerste check/)).toBeNull();
    expect(screen.queryByText(/meetmomenten/)).toBeNull();
  });

  it("houdt het cijfer staan zonder enige meetreeks", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: null,
      score: 71,
      daysAgo: 5,
      hermetingLabel: null,
    });
    render(
      <DomeinPaneel paneel={paneel} domain="slaap" domainLabel="Slaap" surface="test" />,
    );
    expect(screen.getByText("71")).toBeTruthy();
    expect(screen.queryByText(/Na je eerste check/)).toBeNull();
  });

  it("toont geen cijfer als er nog niet gemeten is", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: null,
      score: null,
      daysAgo: null,
      hermetingLabel: null,
    });
    render(
      <DomeinPaneel paneel={paneel} domain="stress" domainLabel="Stress" surface="test" />,
    );
    expect(screen.getByText("Je hebt dit domein nog niet gemeten.")).toBeTruthy();
  });

  it("meldt de macro-uitgang en roept hem aan", () => {
    const onGoMacro = vi.fn();
    const paneel = buildDomeinPaneel({
      meetreeks: reeks([moment("a", "12 aug 2026", 62)]),
      score: 62,
      daysAgo: 3,
      hermetingLabel: "24 sep",
    });
    render(
      <DomeinPaneel
        paneel={paneel}
        domain="voeding"
        domainLabel="Voeding"
        surface="test"
        onGoMacro={onGoMacro}
      />,
    );
    fireEvent.click(screen.getByText(/Overzicht/));
    expect(onGoMacro).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("domein_paneel_macro_click", {
      surface: "test",
      domain: "voeding",
    });
  });

  /**
   * `buildMesoZone` blijft de staten leveren — het paneel gebruikt ze alleen
   * nog als meetlabel, niet meer als tekst op het scherm.
   */
  it("meldt de meso-staat als meetlabel zonder hem te tonen", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: reeks([moment("a", "12 aug 2026", 62)]),
      score: 62,
      daysAgo: 3,
      hermetingLabel: null,
    });
    render(
      <DomeinPaneel paneel={paneel} domain="voeding" domainLabel="Voeding" surface="test" />,
    );
    expect(screen.queryByText(/Dit is je nulpunt/)).toBeNull();
    expect(trackEvent).toHaveBeenCalledWith("domein_paneel_view", {
      surface: "test",
      domain: "voeding",
      meso: "nulpunt",
      has_score: true,
    });
  });
});
