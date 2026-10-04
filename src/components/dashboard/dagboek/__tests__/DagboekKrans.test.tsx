/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekKrans from "@/components/dashboard/dagboek/DagboekKrans";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";

const magnesiumVol: NutrientOndergrensGesplitst = {
  nutrient: "magnesium",
  minstens: 400,
  unit: "mg",
  bronnen: 2,
  zonderGehalte: 0,
  uitVoeding: 250,
  uitSupplement: 150,
};

afterEach(cleanup);

describe("DagboekKrans", () => {
  it("nodigt uit om te beginnen als er niets is geregistreerd", () => {
    const onBegin = vi.fn();
    render(
      <DagboekKrans stoffen={[]} proteinTarget={null} onSelect={vi.fn()} onBegin={onBegin} />,
    );
    expect(screen.getByText("Wat at je vandaag?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voeg je ontbijt toe" }));
    expect(onBegin).toHaveBeenCalledOnce();
  });

  it("telt alleen bewijsbare stoffen met een noemer", () => {
    render(
      <DagboekKrans
        stoffen={[magnesiumVol]}
        proteinTarget={null}
        onSelect={vi.fn()}
        onBegin={vi.fn()}
      />,
    );
    expect(screen.getByText("1 van 2")).toBeTruthy();
    expect(screen.getByText(/De telling gaat over magnesium en omega-3\./)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Zink, telt niet mee/ })).toBeTruthy();
  });

  it("toont eiwit zonder doel in grammen, niet als streep", () => {
    const eiwit: NutrientOndergrensGesplitst = { ...magnesiumVol, nutrient: "protein", minstens: 23.4, unit: "g" };
    render(
      <DagboekKrans stoffen={[eiwit]} proteinTarget={null} onSelect={vi.fn()} onBegin={vi.fn()} />,
    );
    expect(screen.getByText("23 g")).toBeTruthy();
    expect(screen.getByText(/Eiwit telt mee zodra je een eiwitdoel hebt/)).toBeTruthy();
  });

  it("tekent geen stip voor een stof zonder vulling", () => {
    const { container } = render(
      <DagboekKrans stoffen={[magnesiumVol]} proteinTarget={null} onSelect={vi.fn()} onBegin={vi.fn()} />,
    );
    expect(container.querySelectorAll("path[pathLength]")).toHaveLength(1);
  });

  it("opent het logboek van de gekozen stof", () => {
    const onSelect = vi.fn();
    render(
      <DagboekKrans
        stoffen={[magnesiumVol]}
        proteinTarget={null}
        onSelect={onSelect}
        onBegin={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    expect(onSelect).toHaveBeenCalledWith("magnesium");
  });
});
