/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekNutrientDetail from "@/components/dashboard/dagboek/DagboekNutrientDetail";
import { nutrientenGesplitstUitItems, type DagboekItem } from "@/lib/nutrition-dagboek-items";

afterEach(cleanup);

const items: DagboekItem[] = [
  { moment: "ontbijt", key: "havermout", grams: 75 },
  { moment: "lunch", key: "havermout", grams: 25 },
] as DagboekItem[];

function toon(lijst: DagboekItem[]) {
  const stof = nutrientenGesplitstUitItems(lijst).find((s) => s.nutrient === "magnesium");
  render(
    <DagboekNutrientDetail
      nutrient="magnesium"
      items={lijst}
      stof={stof}
      onVerwijder={vi.fn()}
      onVoegToe={vi.fn()}
      onKiesBron={vi.fn()}
      onVergelijkBronnen={vi.fn()}
      onTerug={vi.fn()}
    />,
  );
}

describe("DagboekNutrientDetail", () => {
  it("toont per eetmoment welk deel van vandaag eruit kwam, zonder norm per maaltijd", () => {
    toon(items);
    const balk = screen.getByLabelText("Bijdrage per eetmoment");
    expect(balk.textContent).toMatch(/Ontbijt\s*75%/);
    expect(balk.textContent).toMatch(/Lunch\s*25%/);
    expect(screen.queryByText(/van je norm/)).toBeNull();
  });

  it("laat de verdeling weg bij één eetmoment", () => {
    toon(items.slice(0, 1));
    expect(screen.queryByLabelText("Bijdrage per eetmoment")).toBeNull();
  });
});
