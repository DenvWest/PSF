/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DagboekMacroRing, { MACRO_RING_KLEUREN } from "@/components/dashboard/dagboek/DagboekMacroRing";

afterEach(cleanup);

const segmenten = [
  { key: "koolhydraten", label: "Koolhydraten", gram: 40, kcalPerGram: 4 as const, kleur: MACRO_RING_KLEUREN.koolhydraten },
  { key: "vet", label: "Vet", gram: 20, kcalPerGram: 9 as const, kleur: MACRO_RING_KLEUREN.vet },
  { key: "eiwit", label: "Eiwit", gram: 30, kcalPerGram: 4 as const, kleur: MACRO_RING_KLEUREN.eiwit },
];

describe("DagboekMacroRing", () => {
  it("toont per maaltijd calorieën, grammen en het deel van de dag", () => {
    render(
      <DagboekMacroRing
        kcal={460}
        kcalDoel={2200}
        segmenten={segmenten}
        maaltijden={[
          { id: "ontbijt", label: "Ontbijt", kcal: 345, grammen: [30, 15, 25] },
          { id: "lunch", label: "Lunch", kcal: 115, grammen: [10, 5, 5] },
          { id: "avondeten", label: "Avondeten", kcal: null, grammen: [null, null, null] },
        ]}
      />,
    );
    expect(screen.getByText("van je doel 2.200")).toBeTruthy();
    const ontbijt = screen.getByRole("rowheader", { name: /Ontbijt/ }).closest("tr")!;
    expect(ontbijt.textContent).toContain("75%");
    expect(ontbijt.textContent).toContain("25 g");
    const avond = screen.getByRole("rowheader", { name: /Avondeten/ }).closest("tr")!;
    expect(avond.textContent).toContain("—");
  });

  it("vraagt wat je at als er nog niets is", () => {
    render(<DagboekMacroRing kcal={null} segmenten={segmenten.map((s) => ({ ...s, gram: null }))} onBegin={() => {}} />);
    expect(screen.getByText("Wat at je vandaag?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Voeg je ontbijt toe" })).toBeTruthy();
  });
});
