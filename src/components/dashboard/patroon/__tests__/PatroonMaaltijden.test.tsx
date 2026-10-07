/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonMaaltijden from "@/components/dashboard/patroon/PatroonMaaltijden";
import { bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
import { LEEG_KERNSTOF_PROFIEL } from "@/lib/account-kernstof-profiel";
import { STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import type { SupermarktProduct } from "@/types/supermarkt-product";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofNormen: () => STANDAARD_NORMEN,
  useGevolgdeNormen: () => STANDAARD_GEVOLGDE_NORMEN,
  useKernstofProfiel: () => ({ ...LEEG_KERNSTOF_PROFIEL, streefwaarden: { ironMg: 8 } }),
}));

import { trackEvent } from "@/lib/ga4";

const HAVER = {
  prodId: "off:1",
  energyKcal: 400,
  proteinG: 10,
  fiberG: 10,
  ironMg: 4,
  naam: "Havermout",
  merk: null,
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
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    expect(screen.getByRole("button", { name: "Lunch", pressed: true })).toBeTruthy();
    expect(screen.getByText(/Gemiddeld per lunch · 1 van 30 dagen geregistreerd/)).toBeTruthy();
    expect(screen.getByText("Hoe rijk is elke maaltijd · per 100 kcal")).toBeTruthy();
    expect(screen.getByText(/Kosten per maaltijd tonen we nog niet/)).toBeTruthy();
  });

  it("toont een lege maaltijd als niet geregistreerd en meet de keuze", () => {
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Ontbijt" }));
    expect(screen.getByText(/bij ontbijt nog niets/)).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_maaltijd_gekozen", { moment: "ontbijt" });
  });

  it("zet je eigen doel in de normkolom en toont bij een tik op een stof de bron en de producten", () => {
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    const ijzer = STANDAARD_GEVOLGDE_NORMEN.ironMg;
    expect(screen.getByText("doel 50%")).toBeTruthy();
    expect(screen.queryByText(`norm ${ijzer.waarde} mg/dag · ${ijzer.bron}`)).toBeNull();
    expect(screen.getByText(/Waar je lunch het meest aan bijdraagt:/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^IJzer/, expanded: false }));
    expect(screen.getByText(`norm ${ijzer.waarde} mg/dag · ${ijzer.bron}`)).toBeTruthy();
    expect(screen.getByText("jouw doel 8 mg/dag · 50%")).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_stof_geopend", {
      nutrient: "ironMg",
      soort: "gevolgd",
      sectie: "maaltijd",
    });
  });

  it("opent bij een tik op een product wat dat product leverde en meet het", () => {
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    fireEvent.click(screen.getByRole("button", { name: /Havermout/, expanded: false }));
    expect(screen.getByText(/Per keer gemiddeld 100 g/)).toBeTruthy();
    expect(screen.getByText("etiket: 29% ADH")).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_product_geopend", { moment: "lunch", soort: "voeding" });
  });
});
