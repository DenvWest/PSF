/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonMaaltijden from "@/components/dashboard/patroon/PatroonMaaltijden";
import { bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import type { SupermarktProduct } from "@/types/supermarkt-product";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({ useKernstofNormen: () => STANDAARD_NORMEN }));

import { trackEvent } from "@/lib/ga4";

const HAVER = {
  prodId: "off:1",
  energyKcal: 400,
  proteinG: 10,
  fiberG: 10,
  ironMg: 4,
} as SupermarktProduct;

function portie(moment: string, grams: number): SupermarktPortie {
  return { id: moment, moment, prodId: "off:1", grams, createdAt: "", product: HAVER };
}

const PATROON = bouwMaaltijdPatroon({
  itemsPerDag: new Map(),
  etiketPerDag: { "2026-10-01": [portie("lunch", 100)], "2026-10-02": [portie("avondeten", 200)] },
  nevoProducten: new Map(),
  van: "2026-09-06",
  tot: "2026-10-05",
});

afterEach(cleanup);

describe("PatroonMaaltijden", () => {
  it("opent op de eerste maaltijd met registraties en toont macro's en dichtheid", () => {
    render(<PatroonMaaltijden patroon={PATROON} periodeDagen={30} />);
    expect(screen.getByRole("button", { name: "Lunch", pressed: true })).toBeTruthy();
    expect(screen.getByText(/Gemiddeld per lunch · 1 keer in 30 dagen/)).toBeTruthy();
    expect(screen.getByText("Hoe rijk is elke maaltijd · per 100 kcal")).toBeTruthy();
    expect(screen.getByText(/Kosten per maaltijd tonen we nog niet/)).toBeTruthy();
  });

  it("toont een lege maaltijd als niet geregistreerd en meet de keuze", () => {
    render(<PatroonMaaltijden patroon={PATROON} periodeDagen={30} />);
    fireEvent.click(screen.getByRole("button", { name: "Ontbijt" }));
    expect(screen.getByText(/bij ontbijt nog niets/)).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_maaltijd_gekozen", { moment: "ontbijt" });
  });
});
