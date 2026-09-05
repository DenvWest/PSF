// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NutritionResultView from "@/components/intake/NutritionResultView";
import { buildNutritionHeadline } from "@/lib/nutrition-conclusion";
import { buildNutritionFactRows, type NutritionLadderReport } from "@/lib/nutrition-ladder";
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
