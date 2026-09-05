// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import IntakeResults from "@/components/intake/IntakeResults";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildRevealModel } from "@/lib/reveal-model";
import { buildRevealRingRows, buildRevealRoadmap } from "@/lib/reveal-roadmap";
import { getNextVitalityBand, getVitalityBand } from "@/lib/vitality-gauge";
import type { DomainScores } from "@/lib/intake-engine";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/intake",
}));

vi.mock("@/lib/ga4", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ga4")>("@/lib/ga4");
  return { ...actual, trackEvent: vi.fn(), trackQuizVoltooid: vi.fn() };
});
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/intake-events-client", () => ({ emitIntakeClientEvent: vi.fn() }));

const SCORES: DomainScores = {
  sleep_score: 38,
  energy_score: 45,
  stress_score: 52,
  nutrition_score: 71,
  movement_score: 60,
  recovery_score: 49,
  connection_score: 66,
};

/**
 * sleep_score (38) zit onder de "Onrustige Slaper"-drempel van getProfileLabel
 * (< 40, altijd als eerste gecheckt), maar stress_score (15) is de daadwerkelijk
 * laagste score en dus het echte startpunt (getPrimaryTheme). Dit scenario
 * reproduceert de gemelde bug: het profiellabel wees slaap aan terwijl stress
 * veel slechter scoorde.
 */
const MISMATCH_SCORES: DomainScores = {
  ...SCORES,
  sleep_score: 38,
  stress_score: 15,
};

const ANSWERS: Record<string, number> = {};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function renderResults(scores: DomainScores = SCORES) {
  return render(
    <IntakeResults
      scores={scores}
      answers={ANSWERS}
      symptoms={["slaap"]}
      sessionId="sess-1"
      firstName="Dennis"
    />,
  );
}

function model(scores: DomainScores = SCORES) {
  return buildRevealModel(scores, ANSWERS, ["slaap"]);
}

function roadmap(scores: DomainScores = SCORES) {
  return buildRevealRoadmap(model(scores), buildRecommendationInput({ scores }));
}

describe("IntakeResults — startprofiel en route in één box", () => {
  it("zet startprofiel, ring en route in dezelfde box", () => {
    renderResults();
    const box = screen.getByRole("region", { name: "Jouw startprofiel en route" });
    expect(within(box).getByRole("img", { name: /^Leefstijl: \d+ van de 100/ })).not.toBeNull();
    expect(within(box).getByRole("heading", { level: 1 })).not.toBeNull();
    // Vier uitklapbare domeinen, niet vijf: verbinding is uit de interface
    // (zie `zichtbare-domeinen.ts`). De score telt nog mee in het
    // vitaliteitscijfer in de ring, maar krijgt geen eigen blok meer.
    expect(within(box).getAllByRole("button", { expanded: false }).length).toBe(3);
    expect(within(box).getAllByRole("button", { expanded: true })).toHaveLength(1);
  });

  it("vertelt het verhaal van de check: waarmee je begon en wat eruit komt", () => {
    renderResults();
    const built = model();
    expect(built.recognitionLine).not.toBeNull();
    for (const line of [built.recognitionLine, built.driverLine, built.strengthLine]) {
      if (line) {
        expect(screen.getByText(new RegExp(line.slice(0, 24)))).not.toBeNull();
      }
    }
  });

  it("onderbouwt het startpunt met de reden uit de roadmap, niet met een losse claim", () => {
    renderResults();
    const built = roadmap();
    const focus = built.find((domain) => domain.isFocus)!;

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      `${focus.label} is je startpunt`,
    );
    for (const line of focus.basis.lines) {
      expect(screen.getAllByText(line).length).toBeGreaterThan(0);
    }
  });

  it("draagt geen persona-label, ook niet wanneer het het startpunt bevestigt", () => {
    renderResults(SCORES);
    const built = roadmap(SCORES);
    const focus = built.find((domain) => domain.isFocus)!;

    // getProfileLabel levert hier "Onrustige Slaper" en wijst hetzelfde domein
    // aan als de route. Sinds 29 augustus draagt de uitkomst dat label niet
    // meer: het overzicht is een meting, en een persona-naam ernaast leest als
    // een oordeel dat de check niet gemeten heeft.
    expect(focus.id).toBe("slaap");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Slaap is je startpunt",
    );
    expect(screen.queryByText("Onrustige Slaper")).toBeNull();
  });

  it("laat de kop het gemeten startpunt volgen, niet de vaste profielcascade", () => {
    renderResults(MISMATCH_SCORES);
    const built = roadmap(MISMATCH_SCORES);
    const focus = built.find((domain) => domain.isFocus)!;

    // Regressietest: sleep_score (38) triggert getProfileLabel's vaste
    // cascade ("Onrustige Slaper"), maar stress (15) is de echte laagste
    // score. De kop moet het echte startpunt volgen.
    expect(focus.id).toBe("stress");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Stress is je startpunt",
    );
    expect(screen.queryByText("Onrustige Slaper")).toBeNull();
  });

  it("zet de propositie neer: eerst meten, dan pas kiezen", () => {
    renderResults();
    const block = screen.getByRole("region", { name: "Eerst meten, dan pas kiezen" });
    expect(within(block).getByText(/naast wat er per domein te kiezen valt/)).not.toBeNull();
    expect(within(block).getByText("Leefstijl eerst")).not.toBeNull();
    expect(within(block).getByText("Alleen met goedgekeurde claim")).not.toBeNull();
    expect(
      within(block).getByRole("link", { name: /Hoe wij geld verdienen/ }).getAttribute("href"),
    ).toBe("/affiliate-disclosure");
  });

  it("opent standaard je startpunt en houdt maar één domein open", () => {
    renderResults();
    const built = roadmap();
    expect(built[0]!.isFocus).toBe(true);

    const open = screen.getByRole("button", { expanded: true });
    expect(open.textContent).toContain(built[0]!.label);

    fireEvent.click(screen.getByRole("button", { name: new RegExp(built[2]!.label) }));
    expect(screen.getAllByRole("button", { expanded: true })).toHaveLength(1);
    expect(screen.getByRole("button", { expanded: true }).textContent).toContain(
      built[2]!.label,
    );
  });

  it("houdt het per domein bij \u00e9\u00e9n stap, hooguit \u00e9\u00e9n aanvulling en de dashboard-lanes", () => {
    renderResults();
    for (const domain of roadmap()) {
      const header = screen.getByRole("button", { name: new RegExp(domain.label) });
      if (header.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(header);
      }
      const panel = document.getElementById(`reveal-route-panel-${domain.id}`) as HTMLElement;
      expect(panel).not.toBeNull();

      for (const line of domain.basis.lines) {
        expect(within(panel).queryByText(line)).not.toBeNull();
      }
      expect(within(panel).queryByText(domain.now.title)).not.toBeNull();
      expect(within(panel).queryAllByRole("link")).toHaveLength(domain.supplement ? 1 : 0);

      expect(domain.later.length).toBeGreaterThan(0);
      for (const lane of domain.later) {
        expect(within(panel).queryByText(lane.label)).not.toBeNull();
      }
      expect(
        within(panel).queryByText(/past zich aan op je eigen metingen/),
      ).not.toBeNull();
    }
  });

  it("citeert bij een actief signaal het antwoord zelf, niet alleen de score", () => {
    // NUT_PROT 1-2 + beweeglast >= 2 triggert protein_gap_signal (zie
    // getDeficiencySignals) — de roadmap moet dat signaal citeren i.p.v. de
    // generieke score-fallback te tonen.
    const answers = { NUT_PROT: 2, MOV_CARD: 3 };
    render(
      <IntakeResults
        scores={SCORES}
        answers={answers}
        symptoms={["slaap"]}
        sessionId="sess-1"
        firstName="Dennis"
      />,
    );
    const built = buildRevealRoadmap(
      buildRevealModel(SCORES, answers, ["slaap"]),
      buildRecommendationInput({ scores: SCORES, answers }),
    );
    const voeding = built.find((domain) => domain.id === "voeding")!;
    expect(voeding.basis.fromAnswer).toBe(true);

    const header = screen.getByRole("button", { name: new RegExp(voeding.label) });
    if (header.getAttribute("aria-expanded") !== "true") {
      fireEvent.click(header);
    }
    const panel = document.getElementById(`reveal-route-panel-${voeding.id}`) as HTMLElement;
    expect(within(panel).getByText(/eiwitinname blijft waarschijnlijk achter/)).not.toBeNull();
  });

  it("stuurt niemand terug naar de check of naar een gids-download", () => {
    renderResults();
    for (const domain of roadmap()) {
      const header = screen.getByRole("button", { name: new RegExp(domain.label) });
      if (header.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(header);
      }
    }
    const routeLinks = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"));

    for (const href of routeLinks) {
      expect(href).not.toMatch(/^\/gids\//);
      expect(href).not.toMatch(/^\/intake(\/|$|\?)/);
      expect(href).not.toMatch(/-na-40/);
    }
  });

  it("toont elke aanvulling met een goedgekeurde claim en maar \u00e9\u00e9n keer", () => {
    renderResults();
    const supplements = roadmap()
      .map((domain) => domain.supplement)
      .filter((supplement) => supplement != null);

    expect(supplements.length).toBeGreaterThan(0);
    for (const supplement of supplements) {
      expect(supplement!.claim.length).toBeGreaterThan(0);
      expect(supplement!.href).toMatch(/^\/beste\/.+from=intake$/);
    }

    const names = supplements.map((supplement) => supplement!.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("verwijst een domein dat een aanvulling deelt naar het domein waar die staat", () => {
    const built = roadmap();
    const shared = built.filter(
      (domain) => domain.supplement == null && domain.supplementNote?.includes("staat bij"),
    );
    for (const domain of shared) {
      const owner = built.find((candidate) =>
        domain.supplementNote!.includes(`staat bij ${candidate.label}`),
      );
      expect(owner?.supplement).not.toBeNull();
    }
  });

  it("toont de vijf ringdomeinen in de ring", () => {
    renderResults();
    const ring = screen.getByRole("img", { name: /^Leefstijl: \d+ van de 100/ });
    for (const row of buildRevealRingRows(model())) {
      expect(ring.getAttribute("aria-label")).toContain(row.label.toLowerCase());
    }
  });

  it("biedt beide sporen aan: alleen supplementadvies en het dashboard", () => {
    renderResults();
    const supplement = screen.getByRole("link", { name: /Naar het supplementadvies/i });
    const dashboard = screen.getByRole("link", { name: /Bewaar in je dashboard/i });
    const focusSupplement = roadmap().find((domain) => domain.supplement)?.supplement;

    // Het supplementspoor landt op de catalogus zelf, al gezet op de categorie
    // uit de check — niet op één vergelijkingspagina — en houdt de terugweg
    // naar dit overzicht vast.
    const href = supplement.getAttribute("href") ?? "";
    expect(href.startsWith("/supplementen?")).toBe(true);
    expect(href).toContain(`categorie=${focusSupplement?.hubSlug}`);
    expect(href).toContain("from=intake");
    expect(dashboard.getAttribute("href")).toBe("/account/login?from=intake");
  });

  it("leest de leefstijlscore af op zijn eigen bandenschaal", () => {
    renderResults();
    const score = Math.round(model().vitality);
    const band = getVitalityBand(score);
    const next = getNextVitalityBand(score);

    const scale = screen.getByRole("img", { name: /op de schaal van vijf banden/ });
    expect(scale.getAttribute("aria-label")).toContain(`${score} van de 100`);
    expect(screen.getByText(band.label)).not.toBeNull();
    expect(
      screen.getByText(`Volgende band: ${next!.label} vanaf ${next!.min}`),
    ).not.toBeNull();
  });

  it("belooft nergens begeleiding door een mens", () => {
    renderResults();
    const lanes = roadmap().flatMap((domain) => domain.later);
    expect(lanes.length).toBeGreaterThan(0);
    for (const lane of lanes) {
      const text = `${lane.label} ${lane.detail}`;
      expect(text).not.toMatch(/coach|\bPT\b|meekijkt|persoonlijke begeleid/i);
    }
    // Toekomstige items heten "In ontwikkeling", niet "Binnenkort" — geen datum-belofte.
    expect(lanes.some((lane) => lane.soon)).toBe(true);
    for (const domain of roadmap()) {
      const header = screen.getByRole("button", { name: new RegExp(domain.label) });
      if (header.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(header);
      }
    }
    expect(screen.queryAllByText("Binnenkort")).toHaveLength(0);
    expect(screen.queryAllByText("In ontwikkeling").length).toBeGreaterThan(0);
  });
});
