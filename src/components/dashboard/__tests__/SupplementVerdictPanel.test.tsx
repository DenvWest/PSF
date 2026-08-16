// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import { trackEvent } from "@/lib/ga4";
import type { StoredSupplementVerdict, VerdictEvidence } from "@/types/verdict";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

const evidence: VerdictEvidence = {
  scores: {
    sleep_score: 40,
    energy_score: 50,
    stress_score: 50,
    nutrition_score: 50,
    movement_score: 50,
    recovery_score: 50,
    connection_score: 50,
  },
  signals: {
    omega3_deficiency: false,
    magnesium_signal: true,
    cortisol_risk: false,
    creatine_signal: false,
    melatonine_signal: false,
    protein_gap_signal: false,
    low_recovery_no_load: false,
    sleep_issue_no_stress: false,
    energy_dip_unexplained: false,
  },
  profileLabel: "Onrustige Slaper",
  triggeredBy: [{ type: "signal", signal: "magnesium_signal" }],
  nutritionLogCompleted: true,
};

function row(basedOn: VerdictEvidence | null): StoredSupplementVerdict {
  return {
    id: "id-magnesium",
    ingredientKey: "magnesium",
    verdict: "kopen",
    reasonKey: "trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn,
  };
}

function negativeRow(ingredientKey: string): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict: "niet_nodig",
    reasonKey: "no_trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

describe("SupplementVerdictPanel — afleiding-disclosure", () => {
  it("toont de 'Hoe we hier komen'-knop alleen met een bewaarde snapshot", () => {
    render(<SupplementVerdictPanel verdicts={[row(null)]} />);
    expect(screen.queryByText("Hoe we hier komen")).toBeNull();
  });

  it("opent de afleiding op klik en toont signaal, zekerheid en claim", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);

    const toggle = screen.getByText("Hoe we hier komen");
    fireEvent.click(toggle);

    expect(screen.getByText("Verberg hoe we hier komen")).toBeTruthy();
    expect(screen.getByText(/slaapvragen/)).toBeTruthy();
    expect(screen.getByText(/Zekerheid 1 van 4/)).toBeTruthy();
    expect(screen.getByText(/De claim die mag:/)).toBeTruthy();
  });

  it("sluit de afleiding weer op een tweede klik", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);

    fireEvent.click(screen.getByText("Hoe we hier komen"));
    fireEvent.click(screen.getByText("Verberg hoe we hier komen"));

    expect(screen.getByText("Hoe we hier komen")).toBeTruthy();
  });

  it("toont nooit merk, prijs of koopknop — alleen het oordeel en de vergelijkingslink", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);
    expect(screen.getByText("Bekijk de vergelijking")).toBeTruthy();
    expect(screen.queryByText(/€/)).toBeNull();
  });
});

describe("SupplementVerdictPanel — teller: het negatieve oordeel", () => {
  it("meldt de impressie eenmalig, met het juiste aantal positief/negatief", () => {
    vi.mocked(trackEvent).mockClear();
    const { rerender } = render(
      <SupplementVerdictPanel
        verdicts={[row(null), negativeRow("zink"), negativeRow("omega3")]}
        surface="favorieten"
      />,
    );
    rerender(
      <SupplementVerdictPanel
        verdicts={[row(null), negativeRow("zink"), negativeRow("omega3")]}
        surface="favorieten"
      />,
    );

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_schap_getoond");
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({
      surface: "favorieten",
      total: 3,
      positive: 1,
      negative: 2,
    });
  });

  it("meldt een nieuwe impressie als de verdict-set verandert", () => {
    vi.mocked(trackEvent).mockClear();
    const { rerender } = render(<SupplementVerdictPanel verdicts={[row(null)]} />);
    rerender(<SupplementVerdictPanel verdicts={[row(null), negativeRow("zink")]} />);

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_schap_getoond");
    expect(calls).toHaveLength(2);
  });

  it("meldt niets zonder verdicts", () => {
    vi.mocked(trackEvent).mockClear();
    render(<SupplementVerdictPanel verdicts={[]} />);

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_schap_getoond");
    expect(calls).toHaveLength(0);
  });
});
