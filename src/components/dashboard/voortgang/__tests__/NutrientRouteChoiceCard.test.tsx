// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NutrientRouteChoiceCard from "@/components/dashboard/voortgang/NutrientRouteChoiceCard";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({ items: [], save: vi.fn(), remove: vi.fn(), isSaved: () => false }),
}));

afterEach(cleanup);

function status(overrides: Partial<NutrientRouteStatus> = {}): NutrientRouteStatus {
  return {
    nutrient: "magnesium",
    label: "Magnesium",
    route: nutrientRoute("magnesium"),
    status: "gap",
    answerLabel: "Zelden",
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: true,
    doorReasonNl: "Deur open.",
    comparisonPath: "/beste/magnesium",
    ...overrides,
  };
}

describe("NutrientRouteChoiceCard — Vergelijken", () => {
  it("toont bij een open deur de supplementen met PS-Score, en een link naar de catalogus", () => {
    render(<NutrientRouteChoiceCard status={status()} gateOpen surface="test" open onToggle={() => {}} />);
    expect(screen.getByText(/Of een supplement · hoogste PS-Score/)).toBeTruthy();
    const catalogus = screen.getByRole("link", { name: /magnesium-supplementen met PS-Score/ });
    expect(catalogus.getAttribute("href")).toBe("/supplementen?categorie=magnesium");
    expect(screen.getByText(/beoordeelt het product .*niet jouw voeding/)).toBeTruthy();
  });

  it("toont geen PS-Score zolang de poort dicht is", () => {
    render(<NutrientRouteChoiceCard status={status()} gateOpen={false} surface="test" open onToggle={() => {}} />);
    expect(screen.queryByText(/hoogste PS-Score/)).toBeNull();
  });

  it("toont geen PS-Score op Kompas (compact)", () => {
    render(<NutrientRouteChoiceCard status={status()} gateOpen surface="test" compact open onToggle={() => {}} />);
    expect(screen.queryByText(/hoogste PS-Score/)).toBeNull();
  });
});
