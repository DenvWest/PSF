// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NutritionResultView from "@/components/intake/NutritionResultView";
import { buildNutritionHeadline } from "@/lib/nutrition-conclusion";
import {
  buildNutritionFactRows,
  resolveNutritionGate,
  type NutritionLadderReport,
} from "@/lib/nutrition-ladder";
import { buildNutrientRouteStatuses } from "@/lib/nutrition-route-status";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/components/intake/DomeinIjkpuntCheckPrompt", () => ({
  default: () => null,
}));

const LADDER: NutritionLadderReport = {
  sliders: {
    vegetables: 0,
    fruit: 0,
    berries: 0,
    nutsSeedsLegumes: 2,
    oilyFish: 1,
    proteinMeals: 2,
    meatLegumes: 2,
    dairy: 1,
    daylight: 3,
    wholegrain: 2,
    sugaryDrinks: 2,
  },
  preference: "none",
  allergies: [],
};

const ESTIMATE: IntakeEstimate[] = [
  { nutrient: "protein", band: "below", referenceLabel: "3 eiwitrijke eetmomenten per dag" },
  { nutrient: "omega3", band: "meets", referenceLabel: "1× vette vis per week" },
  { nutrient: "magnesium", band: "around", referenceLabel: "vuistregel magnesium" },
  { nutrient: "vitamin_d", band: "meets", referenceLabel: "vuistregel vitamine D" },
  { nutrient: "zinc", band: "meets", referenceLabel: "vuistregel zink" },
];

const ADVICE: NutritionAdviceItem[] = [
  {
    kind: "lifestyle",
    nutrient: "protein",
    priority: 1,
    text: "Voeg een eiwitbron toe bij je lunch.",
  },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function renderResult(
  extra: Partial<Parameters<typeof NutritionResultView>[0]> = {},
) {
  return render(
    <NutritionResultView
      score={42}
      estimate={ESTIMATE}
      statements={[]}
      advice={ADVICE}
      factRows={buildNutritionFactRows(LADDER)}
      fromDashboard={false}
      originDomain={null}
      delta={null}
      {...extra}
    />,
  );
}

describe("NutritionResultView — leefstijlrapport", () => {
  it("zet ring en conclusie in dezelfde rapport-box, zonder score-h1", () => {
    const { container } = renderResult();
    const box = screen.getByRole("region", { name: "Jouw voedingsbeeld" });
    const headline = buildNutritionHeadline(buildNutritionFactRows(LADDER));

    expect(container.querySelector(".reveal-report-surface")).not.toBeNull();
    expect(within(box).getByRole("heading", { level: 1 }).textContent).toBe(headline);
    expect(box.className).toContain("md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]");
    expect(screen.queryByRole("heading", { name: "Je voedingsscore" })).toBeNull();
    expect(screen.queryByLabelText("Inname per nutriënt")).toBeNull();
  });

  it("houdt de pesticidenlijst achter een dichte details tot je hem opent", () => {
    renderResult();
    const trigger = screen.getByText("Kwaliteit — wat er op groente en fruit zit");
    const details = trigger.closest("details");
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    fireEvent.click(trigger);
    expect(details?.open).toBe(true);
  });

  it("valt terug op de samenvatting als de feitenrijen ontbreken", () => {
    renderResult({ factRows: [] });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Eiwit is je grootste winst nu",
    );
    expect(screen.queryByRole("heading", { name: "Wat je eet, naast de richtlijn" })).toBeNull();
  });

  it("toont de dashboard-CTA’s vanuit het dashboard, niet sluiten", () => {
    renderResult({ fromDashboard: true });
    expect(screen.getByRole("link", { name: /Zet op Mijn Dag/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Terug naar dashboard" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sluiten" })).toBeNull();
  });
});

describe("NutritionResultView — de voedingsroute per stof", () => {
  const STATUSES = buildNutrientRouteStatuses(LADDER);
  const GATE_OPEN = resolveNutritionGate(buildNutritionFactRows(LADDER)).open;

  it("toont één rij per stof", () => {
    const { container } = renderResult({
      routeStatuses: STATUSES,
      nutritionGateOpen: GATE_OPEN,
    });
    expect(
      within(container).getByText("Per stof — wat je nu kunt doen"),
    ).toBeTruthy();
    for (const status of STATUSES) {
      expect(container.querySelector(`#stof-${status.nutrient}`)).not.toBeNull();
    }
  });

  it("draagt de uitlezing, niet de keuze", () => {
    // NutrientLogboekPanel schrijft keuzes naar account_favorites via
    // useVoortgangFavorites. Wie net de check deed heeft nog geen account, en
    // een keuzeknop die niets bewaart is erger dan geen keuzeknop.
    const { container } = renderResult({
      routeStatuses: STATUSES,
      nutritionGateOpen: GATE_OPEN,
    });
    expect(container.textContent ?? "").not.toContain("Uit mijn eten");
  });

  it("laat het blok weg als de sliders niet in state staan", () => {
    // Zonder rapport geen route. Stil weg, geen half blok met lege regels.
    const { container } = renderResult({ routeStatuses: [] });
    expect(container.textContent).not.toContain("Nog niet opgehaald");
  });

  it("toont nooit een /beste/-link, ook niet als de poort dicht is", () => {
    // /beste/* is de oude, generieke vergelijkingsroute; de rijen linken
    // altijd naar de eigen categorie in /supplementen.
    const { container } = renderResult({
      routeStatuses: STATUSES,
      nutritionGateOpen: false,
    });
    const besteLinks = [...container.querySelectorAll("a[href^='/beste/']")];
    expect(besteLinks).toHaveLength(0);
  });

  it("'Liever een supplement' staat altijd naast 'Bekijk jouw voeding', ongeacht de poort", () => {
    // 25-sep-besluit: voeding eerst, supplement is een altijd beschikbare
    // tweede optie — geen omweg om de laag-6-poort (die blijft gelden voor
    // de onderbouwde 'dit kun je niet met eten dichten'-knop eronder), maar
    // ook geen verborgen deur meer. Zie BESLUIT_SUPPLEMENT_VOORKEUR_PER_STOF_2026-09.md.
    const { container } = renderResult({
      routeStatuses: STATUSES,
      nutritionGateOpen: false,
    });
    const hubLinks = [...container.querySelectorAll("a[href^='/supplementen']")];
    expect(hubLinks.length).toBe(STATUSES.length);
    expect(container.textContent).toContain("Liever een supplement");
    expect(container.textContent).toContain("Bekijk jouw voeding");
  });

  it("noemt geen opgeteld mg-getal en geen percentage van een dagbehoefte", () => {
    // Dezelfde harde grens als in food-sources.ts en nutrient-rail.ts: de band
    // komt uit frequentievragen, niet uit grammen.
    const { container } = renderResult({
      routeStatuses: STATUSES,
      nutritionGateOpen: GATE_OPEN,
    });
    expect(container.textContent ?? "").not.toMatch(/\d+\s*%\s*van je dagbehoefte/i);
    expect(container.textContent ?? "").not.toMatch(/je haalt .{0,20}\d+\s*mg per dag/i);
  });
});
