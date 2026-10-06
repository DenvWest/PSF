/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonStofDetail, { type StofDetailGegevens } from "@/components/dashboard/patroon/PatroonStofDetail";
import { normVoor, normVoorVeld, STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { bouwPeriodeOverzicht, weekDatums } from "@/lib/nutrition-weekoverzicht";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));
const profiel = vi.hoisted(() => ({
  huidig: {
    geslacht: null,
    zeventigPlus: false,
    voedingswijze: null as "vegetarisch" | "veganistisch" | null,
    streefwaarden: {} as Record<string, number>,
  },
}));
vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofNormen: () => STANDAARD_NORMEN,
  useKernstofProfiel: () => profiel.huidig,
}));

afterEach(() => {
  cleanup();
  profiel.huidig = { geslacht: null, zeventigPlus: false, voedingswijze: null, streefwaarden: {} };
});

const MAGNESIUM_RIJ = bouwPeriodeOverzicht([], weekDatums("2026-09-28"), STANDAARD_NORMEN).rijen.find(
  (rij) => rij.nutrient === "magnesium",
)!;

function magnesium(streef: number | null = null): StofDetailGegevens {
  return {
    ...MAGNESIUM_RIJ,
    stof: "magnesium",
    norm: normVoor(STANDAARD_NORMEN, "magnesium"),
    streef,
    vergelijkingPad: MAGNESIUM_RIJ.comparisonPath,
    zonderNormUitleg: "",
  };
}

const CALCIUM: StofDetailGegevens = {
  stof: "calciumMg",
  label: "Calcium",
  unit: "mg",
  lezing: "per_dag",
  gemiddeld: 400,
  totaal: 800,
  aandeel: 0.4,
  normPeriode: null,
  bewijsbaar: true,
  gedekt: null,
  norm: normVoorVeld(STANDAARD_GEVOLGDE_NORMEN, "calciumMg"),
  streef: null,
  vergelijkingPad: null,
  zonderNormUitleg: "",
};

describe("PatroonStofDetail", () => {
  it("noemt norm, doelgroep en bron voluit, en zegt dat het geen diagnose is", () => {
    render(
      <PatroonStofDetail
        rij={magnesium()}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={0}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    expect(screen.getByText(/Voedingsnormen vitamines en mineralen voor volwassenen/)).toBeTruthy();
    expect(screen.getByText("volwassenen 18+")).toBeTruthy();
    expect(screen.getByText(/eronder zitten is geen\s+tekort/)).toBeTruthy();
  });

  it("toont per maaltijd het deel, wanneer je een bron at, en waar de ruimte zit", () => {
    render(
      <PatroonStofDetail
        rij={magnesium()}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={2}
        bronnen={[
          {
            naam: "Pompoenpitten",
            totaal: 300,
            unit: "mg",
            dagen: 2,
            momenten: [
              { datum: "2026-09-28", moment: "avondeten" },
              { datum: "2026-09-30", moment: "ontbijt" },
            ],
            supplement: false,
          },
        ]}
        perMoment={[
          { moment: "ontbijt", label: "Ontbijt", totaal: 150, keer: 2 },
          { moment: "lunch", label: "Lunch", totaal: 10, keer: 2 },
          { moment: "avondeten", label: "Avondeten", totaal: 140, keer: 2 },
          { moment: "tussendoor", label: "Tussendoor", totaal: 0, keer: 0 },
        ]}
        onTerug={() => {}}
      />,
    );
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("niet geregistreerd")).toBeTruthy();
    expect(screen.getByText(/ma 28 sep avondeten · wo 30 sep ontbijt/)).toBeTruthy();
    expect(screen.getByText(/Je lunch leverde 3% van je magnesium/)).toBeTruthy();
  });

  it("toont voedingsbronnen vóór de supplementvergelijking", () => {
    render(
      <PatroonStofDetail
        rij={magnesium()}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={0}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    const voeding = screen.getByText(/Rijkste voedingsbronnen/);
    const supplement = screen.getByRole("link", { name: /Supplementen met Magnesium vergelijken/ });
    expect(voeding.compareDocumentPosition(supplement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(supplement.getAttribute("href")).toBe(MAGNESIUM_RIJ.comparisonPath);
  });

  it("toont je streefwaarde naast de norm, en bij vegan geen vis of vlees", () => {
    profiel.huidig = { ...profiel.huidig, voedingswijze: "veganistisch", streefwaarden: { magnesium: 400 } };
    render(
      <PatroonStofDetail
        rij={magnesium(400)}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={0}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    expect(screen.getByText(/400 mg per dag — "gehaald" blijft tegen de norm/)).toBeTruthy();
    expect(screen.getByText(/Alleen veganistische bronnen/)).toBeTruthy();
    const bronnen = screen.getByText(/Rijkste voedingsbronnen/).closest(".vd-tabel")!.textContent ?? "";
    expect(bronnen).not.toMatch(/zalm|makreel|vlees|kaas|yoghurt|ei\b/i);
  });

  it("geeft een gevolgde stof hetzelfde detail: norm met bron, rijkste bronnen, geen supplementlink", () => {
    render(
      <PatroonStofDetail
        rij={CALCIUM}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={2}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { name: "Calcium" })).toBeTruthy();
    expect(screen.getByText(/Rijkste voedingsbronnen/)).toBeTruthy();
    expect(screen.getByPlaceholderText("Zoek een product")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Supplementen met/ })).toBeNull();
    expect(screen.getByText(/geen supplementvergelijking/)).toBeTruthy();
  });
});
