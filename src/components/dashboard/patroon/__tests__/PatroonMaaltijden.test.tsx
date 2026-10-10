/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonMaaltijden from "@/components/dashboard/patroon/PatroonMaaltijden";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";
import { bouwDagPatroon, bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
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

const DAG = bouwDagPatroon({
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
    expect(screen.getByText("Vergelijk je maaltijden · per 100 kcal")).toBeTruthy();
    expect(screen.getByText(/Prijzen per maaltijd tonen we nog niet/)).toBeTruthy();
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
    expect(screen.getByText("jouw doel 50%")).toBeTruthy();
    expect(screen.queryByText(`norm ${ijzer.waarde} mg/dag · ${ijzer.bron}`)).toBeNull();
    expect(screen.getByText(/Waar je lunch het meest aan bijdraagt/)).toBeTruthy();

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

  it("toont in de rijkdomtabel ook een gewone maaltijd zonder registratie", () => {
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    expect(screen.getByText("nog niets geregistreerd")).toBeTruthy();
  });

  it("laat een lege maaltijd buiten je eetpatroon weg, maar niet een met registraties", () => {
    render(
      <PatroonMaaltijden
        patroon={PATROON}
        periode={{ van: "2026-09-06", tot: "2026-10-05" }}
        gewoneMaaltijden={["ontbijt", "avondeten"]}
      />,
    );
    expect(screen.queryByRole("button", { name: "Ontbijt" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lunch", pressed: true })).toBeTruthy();
    cleanup();
    render(
      <PatroonMaaltijden
        patroon={PATROON}
        periode={{ van: "2026-09-06", tot: "2026-10-05" }}
        gewoneMaaltijden={["lunch", "avondeten"]}
      />,
    );
    expect(screen.queryByText("Ontbijt")).toBeNull();
    expect(screen.queryByText("nog niets geregistreerd")).toBeNull();
  });

  it("toont een Hele dag-keuze met het gemiddelde per dag en meet de keuze", () => {
    render(<PatroonMaaltijden patroon={PATROON} dag={DAG} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Hele dag" }));
    expect(screen.getByRole("button", { name: "Hele dag", pressed: true })).toBeTruthy();
    expect(screen.getByText(/Gemiddeld per dag · 2 van 30 dagen geregistreerd/)).toBeTruthy();
    expect(screen.getByText(/Waar je dag het meest aan bijdraagt/)).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_maaltijd_gekozen", { moment: "hele-dag" });
  });

  it("toont geen Hele dag-keuze zonder dagpatroon", () => {
    render(<PatroonMaaltijden patroon={PATROON} periode={{ van: "2026-09-06", tot: "2026-10-05" }} />);
    expect(screen.queryByRole("button", { name: "Hele dag" })).toBeNull();
  });

  it("biedt bij een stof onder je dagnorm op Hele dag een keuze om aan te vullen, maar niet per maaltijd", () => {
    const supplement: DagboekItem = { moment: "ontbijt", bron: "supplement", key: "magnesiumcitraat-capsule", grams: 1 };
    const items = new Map([["2026-10-01", [supplement]]]);
    const invoer = {
      itemsPerDag: items,
      etiketPerDag: {},
      nevoProducten: new Map(),
      van: "2026-09-06",
      tot: "2026-10-05",
    };
    const periode = { van: "2026-09-06", tot: "2026-10-05" };
    render(<PatroonMaaltijden patroon={bouwMaaltijdPatroon(invoer)} dag={bouwDagPatroon(invoer)} periode={periode} />);

    const kernstof = () => screen.getAllByRole("button", { name: /^Magnesium/, expanded: false }).at(-1)!;
    fireEvent.click(kernstof());
    expect(screen.queryByText(/Hoe vul je dat aan/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Hele dag" }));
    fireEvent.click(kernstof());
    expect(screen.getByText(/Hoe vul je dat aan/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Supplementen vergelijken/ })).toBeTruthy();
  });
});
