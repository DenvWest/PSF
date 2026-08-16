// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import { STRESS_LIFESTYLE_FIRST_REASON } from "@/data/domain-product-stance";
import { trackEvent } from "@/lib/ga4";
import type { StoredSupplementVerdict } from "@/types/verdict";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

function row(ingredientKey: string): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict: "kopen",
    reasonKey: "trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

describe("DomainSupplementStance — lifestyle_first (stress)", () => {
  it("toont de vaste uitleg, nooit een deur, ongeacht de verdicts", () => {
    render(
      <DomainSupplementStance
        domain="stress"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={true}
        surface="voortgang_stress"
      />,
    );
    expect(screen.getByText("Geen schap op dit domein")).toBeTruthy();
    expect(screen.getByText(STRESS_LIFESTYLE_FIRST_REASON)).toBeTruthy();
    expect(screen.queryByText("Wat een supplement hier wél en niet doet")).toBeNull();
  });
});

describe("DomainSupplementStance — candidates (sleep)", () => {
  it("rendert niets zonder kandidaat-verdicts voor dit domein", () => {
    const { container } = render(
      <DomainSupplementStance
        domain="sleep"
        verdicts={[row("creatine")]}
        nutritionLogCompleted={true}
        surface="voortgang_slaap"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("toont de dichte deur zonder voedingscheck, geen kaarten", () => {
    render(
      <DomainSupplementStance
        domain="sleep"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={false}
        surface="voortgang_slaap"
      />,
    );
    expect(screen.getByText("De deur is dicht")).toBeTruthy();
    expect(screen.queryByText("Bekijk de vergelijking")).toBeNull();
  });

  it("opent op klik en toont alleen de kandidaten van dit domein", () => {
    render(
      <DomainSupplementStance
        domain="sleep"
        verdicts={[row("magnesium"), row("creatine")]}
        nutritionLogCompleted={true}
        surface="voortgang_slaap"
      />,
    );
    fireEvent.click(screen.getByText("Wat een supplement hier wél en niet doet"));
    expect(screen.getByText("Magnesium")).toBeTruthy();
    expect(screen.queryByText("Creatine")).toBeNull();
  });
});

describe("DomainSupplementStance — candidates (nutrition)", () => {
  it("toont alle vijf voedingscheck-nutriënten, en creatine niet", () => {
    render(
      <DomainSupplementStance
        domain="nutrition"
        verdicts={[
          row("magnesium"),
          row("omega3"),
          row("vitamineD"),
          row("zink"),
          row("eiwitpoeder"),
          row("creatine"),
        ]}
        nutritionLogCompleted={true}
        surface="voortgang_voeding"
      />,
    );
    fireEvent.click(screen.getByText("Wat een supplement hier wél en niet doet"));
    expect(screen.getByText("Magnesium")).toBeTruthy();
    expect(screen.getByText("Omega-3 (EPA/DHA)")).toBeTruthy();
    expect(screen.getByText("Vitamine D")).toBeTruthy();
    expect(screen.getByText("Zink")).toBeTruthy();
    expect(screen.getByText("Eiwitpoeder")).toBeTruthy();
    expect(screen.queryByText("Creatine")).toBeNull();
  });
});

describe("DomainSupplementStance — teller: de dichte deur, per reden", () => {
  it("meldt 'geen_schap' eenmalig voor een lifestyle_first-domein", () => {
    vi.mocked(trackEvent).mockClear();
    const { rerender } = render(
      <DomainSupplementStance
        domain="stress"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={true}
        surface="voortgang_stress"
      />,
    );
    rerender(
      <DomainSupplementStance
        domain="stress"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={true}
        surface="voortgang_stress"
      />,
    );

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_supplement_deur_dicht");
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({ domain: "stress", reason: "geen_schap" });
  });

  it("meldt 'geen_voedingscheck' voor een candidates-domein zonder check", () => {
    vi.mocked(trackEvent).mockClear();
    render(
      <DomainSupplementStance
        domain="sleep"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={false}
        surface="voortgang_slaap"
      />,
    );

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_supplement_deur_dicht");
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({ domain: "sleep", reason: "geen_voedingscheck" });
  });

  it("meldt niets als de deur openbaar is", () => {
    vi.mocked(trackEvent).mockClear();
    render(
      <DomainSupplementStance
        domain="sleep"
        verdicts={[row("magnesium")]}
        nutritionLogCompleted={true}
        surface="voortgang_slaap"
      />,
    );

    const calls = vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "dashboard_supplement_deur_dicht");
    expect(calls).toHaveLength(0);
  });
});
