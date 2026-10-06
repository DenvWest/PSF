/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import type { VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

const magnesiumVol: NutrientOndergrensGesplitst = {
  nutrient: "magnesium",
  minstens: 400,
  unit: "mg",
  bronnen: 2,
  zonderGehalte: 0,
  uitVoeding: 250,
  uitSupplement: 150,
};

const voedingswaarde: VoedingswaardeRij[] = [
  { veld: "calciumMg", label: "Calcium", unit: "mg", ri: 800, norm: null, waarde: 400, aandeel: 0.5, aandeelRi: null },
  { veld: "sodiumMg", label: "Natrium", unit: "mg", ri: null, norm: null, waarde: 1200, aandeel: null, aandeelRi: null },
  { veld: "ironMg", label: "IJzer", unit: "mg", ri: 14, norm: null, waarde: null, aandeel: null, aandeelRi: null },
];

async function laad(gevolgd: string[] = []) {
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify({ stoffen: gevolgd }), { status: 200 })),
  );
  vi.resetModules();
  const { default: DagboekKrans } = await import("@/components/dashboard/dagboek/DagboekKrans");
  return DagboekKrans;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const basis = { proteinTarget: null, onSelect: vi.fn(), onKiesStof: vi.fn(), onBegin: vi.fn() };

describe("DagboekKrans", () => {
  it("nodigt uit om te beginnen als er niets is geregistreerd", async () => {
    const DagboekKrans = await laad();
    const onBegin = vi.fn();
    render(<DagboekKrans {...basis} stoffen={[]} onBegin={onBegin} />);
    expect(screen.getByText("Wat at je vandaag?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voeg je ontbijt toe" }));
    expect(onBegin).toHaveBeenCalledOnce();
  });

  it("zet de meetbare stof met het grootste open stuk in het midden, met 'nog X tot je norm'", async () => {
    const DagboekKrans = await laad();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} />);
    expect(screen.getByText("nog 250 mg tot je norm vandaag")).toBeTruthy();
    expect(screen.getByText(/Gedekt: magnesium\. Open: omega-3\./)).toBeTruthy();
    expect(screen.getByText(/Niet meetbaar met een dagboek: zink en vitamine D\./)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Zink, telt niet mee/ })).toBeTruthy();
    expect(screen.queryByText(/tekort/i)).toBeNull();
  });

  it("zegt bij zink dat een dagboek het niet kan aantonen, zonder 'nog X'", async () => {
    const DagboekKrans = await laad();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} />);
    fireEvent.click(screen.getByRole("button", { name: /Zink/ }));
    expect(screen.getByText("een dagboek kan dit niet aantonen")).toBeTruthy();
  });

  it("toont eiwit zonder doel in grammen, niet als streep", async () => {
    const DagboekKrans = await laad();
    const eiwit: NutrientOndergrensGesplitst = { ...magnesiumVol, nutrient: "protein", minstens: 23.4, unit: "g" };
    render(<DagboekKrans {...basis} stoffen={[eiwit]} />);
    expect(screen.getByText("23 g")).toBeTruthy();
    expect(screen.getByText(/Eiwit telt mee met een eiwitdoel\./)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Eiwit/ }));
    expect(screen.getByText("zonder eiwitdoel")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Stel een eiwitdoel in/ })).toBeTruthy();
  });

  it("tekent geen stip voor een stof zonder vulling", async () => {
    const DagboekKrans = await laad();
    const { container } = render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} />);
    expect(container.querySelectorAll("path[pathLength]")).toHaveLength(1);
  });

  it("kiest een kernstof en opent daarna pas het logboek", async () => {
    const DagboekKrans = await laad();
    const onSelect = vi.fn();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} onSelect={onSelect} />);
    const chip = screen.getByRole("button", { name: "Magnesium" });
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    expect(onSelect).toHaveBeenCalledWith("magnesium");
  });

  it("toont gevolgde stoffen in de buitenring, in de gekozen volgorde, zonder telling", async () => {
    const DagboekKrans = await laad(["calciumMg", "sodiumMg"]);
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} voedingswaarde={voedingswaarde} />);
    const lijst = await screen.findByRole("list", { name: "Ook gevolgd" });
    const knoppen = Array.from(lijst.querySelectorAll("button")).map((b) => b.textContent);
    expect(knoppen[0]).toContain("Calcium");
    expect(knoppen[0]).toContain("50%");
    expect(knoppen[1]).toContain("Natrium");
    expect(screen.queryByText("IJzer")).toBeNull();
    expect(screen.getByText(/Gedekt: magnesium\./)).toBeTruthy();
  });

  it("opent rijkste bronnen voor een gevolgde stof die er een lijst voor heeft", async () => {
    const onKiesStof = vi.fn();
    const DagboekKrans = await laad(["calciumMg", "sodiumMg"]);
    render(
      <DagboekKrans {...basis} stoffen={[magnesiumVol]} voedingswaarde={voedingswaarde} onKiesStof={onKiesStof} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: /Calcium/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rijkste bronnen →" }));
    expect(onKiesStof).toHaveBeenCalledWith("calciumMg");

    fireEvent.click(screen.getByRole("button", { name: /Natrium/ }));
    expect(screen.queryByRole("button", { name: "Rijkste bronnen →" })).toBeNull();
  });

  it("nodigt uit om te volgen als er nog niets gevolgd wordt, en klapt de kiezer open", async () => {
    const DagboekKrans = await laad([]);
    render(<DagboekKrans {...basis} stoffen={[]} voedingswaarde={voedingswaarde} />);
    fireEvent.click(await screen.findByRole("button", { name: /Volg ook vezels/ }));
    expect(screen.getByRole("list", { name: "Stoffen om te volgen" })).toBeTruthy();
  });

  it("toont boven de norm een hoeveelheid in plaats van een percentage boven 100", async () => {
    const DagboekKrans = await laad();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} />);
    expect(screen.getByRole("button", { name: "Magnesium" }).textContent).toContain("400 mg");
    expect(screen.queryByText(/114%/)).toBeNull();
  });

  it("legt met de i-knop uit waar de ringen voor staan", async () => {
    const DagboekKrans = await laad();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} />);
    const knop = screen.getByRole("button", { name: "Wat laat de krans zien?" });
    fireEvent.click(knop);
    expect(knop.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/de stoffen die jij volgt/)).toBeTruthy();
  });

  it("klapt de stoffenlijst op een smal scherm in tot je hem opent", async () => {
    const DagboekKrans = await laad();
    render(<DagboekKrans {...basis} stoffen={[magnesiumVol]} inklapbaar />);
    expect(screen.queryByRole("list", { name: "Kernstoffen" })).toBeNull();
    const knop = screen.getByRole("button", { name: /Alle stoffen/ });
    fireEvent.click(knop);
    expect(knop.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("list", { name: "Kernstoffen" })).toBeTruthy();
  });
});
