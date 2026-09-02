// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SituatieVoedingLaag from "@/components/nutrition/SituatieVoedingLaag";
import { buildNutritionSufficiency } from "@/lib/nutrition-sufficiency";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));

describe("SituatieVoedingLaag", () => {
  it("toont skeleton zonder NEVO-getallen en brug naar P6", () => {
    const sufficiency = buildNutritionSufficiency({
      intakeItems: [
        { nutrient: "protein", band: "below" },
        { nutrient: "omega3", band: "below" },
        { nutrient: "magnesium", band: "meets" },
        { nutrient: "vitamin_d", band: "meets" },
        { nutrient: "zinc", band: "meets" },
      ],
      routes: [],
      contribution: [],
      personalization: {
        weightKg: 80,
        trainingLoad: 3,
        proteinTarget: { gramsLow: 95, gramsHigh: 110 },
        ageRange: "45-54",
      },
    });

    render(
      <SituatieVoedingLaag
        sufficiency={sufficiency}
        contribution={[]}
        routes={[]}
        personalization={{
          weightKg: 80,
          trainingLoad: 3,
          proteinTarget: { gramsLow: 95, gramsHigh: 110 },
          ageRange: "45-54",
        }}
        surface="test"
      />,
    );

    expect(screen.getByText(/Volstaat dit voor jou/i)).toBeTruthy();
    expect(screen.getAllByText(/NEVO-bronnen zijn geverifieerd/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Brug naar aanvullen \(P6\)/i)).toBeTruthy();
  });
});
