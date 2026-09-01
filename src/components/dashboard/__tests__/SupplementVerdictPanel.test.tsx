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
    expect(screen.getByText(/laat een magnesiumsignaal zien/)).toBeTruthy();
    expect(screen.getByText(/Zekerheid 1 van 4 —/)).toBeTruthy();
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

describe("SupplementVerdictPanel — de feitenstrook", () => {
  it("zet signaal, zekerheid, bloedwaarde en EU-claim naast elkaar, zonder de kaart te openen", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);

    for (const label of ["Signaal", "Zekerheid", "Bloedwaarde", "EU-claim"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByText("Je slaapvragen")).toBeTruthy();
    expect(screen.getByText("1 van 4")).toBeTruthy();
    expect(screen.getByText("Goedgekeurd")).toBeTruthy();
  });

  it("meldt eerlijk 'Geen signaal' als de check er geen liet zien", () => {
    render(<SupplementVerdictPanel verdicts={[negativeRow("zink")]} />);
    expect(screen.getByText("Geen signaal")).toBeTruthy();
  });
});

describe("SupplementVerdictPanel — beeld en ladderplek", () => {
  it("toont een merkloze productfoto bij de stof", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);

    const img = screen.getByRole("img", { name: /magnesium/i });
    expect(img.getAttribute("alt")).toBe(
      "Voorbeeld van een magnesiumproduct uit de supplementengids",
    );
  });

  it("draagt geen ladderplek zonder domein — liever niets dan de verkeerde laag", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);
    expect(screen.queryByText("Plek in je plan")).toBeNull();
  });

  it("zet de stof op de laatste laag, met het aantal lagen ervóór", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} ladderDomain="voeding" />);

    expect(screen.getByText("Plek in je plan")).toBeTruthy();
    expect(screen.getByText("Laag 6 van 6 · Aanvullen & vergelijken")).toBeTruthy();
    expect(screen.getByText("5 lagen komen hiervóór")).toBeTruthy();
  });
});

describe("SupplementVerdictPanel — de twee uitgangen", () => {
  it("wijst naar de catalogus én naar de vergelijking, met hun herkomst mee", () => {
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} />);

    const catalogus = screen.getByText("Bekijk de producten").closest("a");
    expect(catalogus?.getAttribute("href")).toBe(
      "/supplementen?categorie=magnesium&from=voortgang",
    );
    expect(
      screen.getByText("Bekijk de vergelijking").closest("a")?.getAttribute("href"),
    ).toBe("/beste/magnesium?from=voortgang");
  });

  it("meldt per uitgang welke bestemming is gekozen", () => {
    vi.mocked(trackEvent).mockClear();
    render(<SupplementVerdictPanel verdicts={[row(evidence)]} surface="schap_slaap" />);

    fireEvent.click(screen.getByText("Bekijk de producten"));
    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_schap_vergelijking_click");
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({
      ingredient: "magnesium",
      surface: "schap_slaap",
      bestemming: "catalogus",
    });
  });

  // Een "Niet nodig" mag nooit stilzwijgend een koopsuggestie worden.
  it("draagt geen enkele winkelroute bij een negatief oordeel", () => {
    render(<SupplementVerdictPanel verdicts={[negativeRow("zink")]} />);
    expect(screen.queryByText("Bekijk de producten")).toBeNull();
    expect(screen.queryByText("Bekijk de vergelijking")).toBeNull();
    expect(
      screen.getByText(/Hier verdienen we niets aan/),
    ).toBeTruthy();
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
