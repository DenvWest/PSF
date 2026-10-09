/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekVergelijkTabel from "@/components/dashboard/dagboek/DagboekVergelijkTabel";
import type { VergelijkResultaat } from "@/components/dashboard/dagboek/DagboekVergelijkZoek";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const { haalNevo } = vi.hoisted(() => ({ haalNevo: vi.fn(async (): Promise<SupermarktProduct[]> => []) }));
vi.mock("@/lib/supermarkt-producten-client", () => ({ haalNevoProductenViaApi: haalNevo }));

function nevoProduct(code: string, waarden: Partial<SupermarktProduct>): SupermarktProduct {
  return { prodId: `nevo:${code}`, ...waarden } as SupermarktProduct;
}

function voeding(key: string): VergelijkResultaat {
  const entry = catalogEntry(key);
  if (!entry) throw new Error(`onbekende catalogusregel ${key}`);
  return { bron: "voeding", entry };
}

afterEach(() => {
  cleanup();
  haalNevo.mockReset();
  haalNevo.mockResolvedValue([]);
});

describe("DagboekVergelijkTabel", () => {
  it("houdt een product zonder gehalte als kolom in beeld met een streepje", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("zuurkool")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /Zuurkool/ })).toBeTruthy();
    const magnesium = screen.getByRole("row", { name: /Magnesium/ });
    expect(within(magnesium).getByLabelText("niet gemeten")).toBeTruthy();
    expect(screen.getByText(/zijn nog geen gemeten gehaltes/)).toBeTruthy();
  });

  it("toont een gemeten 0 als 0 en verbergt een rij met alleen nullen", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("zalm-gerookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    const vitD = screen.getByRole("row", { name: /Vitamine D/ });
    expect(within(vitD).getByLabelText("gemeten: niets").textContent).toContain("0");
    expect(screen.queryByLabelText("niet gemeten")).toBeNull();
    cleanup();

    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("broccoli-gekookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    expect(screen.queryByRole("row", { name: /Vitamine D/ })).toBeNull();
  });

  it("toont een benadering met ≈ en de NEVO-naam", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("broccoli-diepvries")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    const magnesium = screen.getByRole("row", { name: /Magnesium/ });
    expect(within(magnesium).getAllByLabelText("benadering")).toHaveLength(1);
    expect(screen.getByText(/Broccoli gekookt/)).toBeTruthy();
    expect(screen.queryByText(/zijn nog geen gemeten gehaltes/)).toBeNull();
  });

  it("markeert per stof het hoogste gehalte met de verhouding", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-gekookt"), voeding("broccoli-gekookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    const magnesium = screen.getByRole("row", { name: /Magnesium/ });
    expect(within(magnesium).getByText(/× zoveel/)).toBeTruthy();
  });

  it("schakelt naar per 100 g", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-gekookt"), voeding("broccoli-gekookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Per 100 g" }));
    const magnesium = screen.getByRole("row", { name: /Magnesium/ });
    expect(within(magnesium).getByText("77")).toBeTruthy();
  });

  it("toont het etiket onder de kernstoffen, zonder winnaar", async () => {
    haalNevo.mockResolvedValue([
      nevoProduct("1146", { energyKcal: 20, potassiumMg: 338 }),
      nevoProduct("1096", { energyKcal: 188, potassiumMg: 489 }),
    ]);
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("zalm-gerookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Etiket · ter informatie/)).toBeTruthy());
    const kalium = screen.getByRole("row", { name: /Kalium/ });
    expect(within(kalium).getByText("367")).toBeTruthy();
    expect(within(kalium).queryByText(/× zoveel/)).toBeNull();
    expect(screen.queryByRole("row", { name: /IJzer/ })).toBeNull();
  });

  it("toont van een niet-vrijgegeven benadering alleen energie en macro's, met ≈", async () => {
    haalNevo.mockResolvedValue([nevoProduct("2557", { energyKcal: 720, fatG: 80, calciumMg: 10 })]);
    render(
      <DagboekVergelijkTabel
        producten={[voeding("margarine"), voeding("zalm-gerookt")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByRole("row", { name: /Energie/ })).toBeTruthy());
    expect(within(screen.getByRole("row", { name: /Energie/ })).getByLabelText("benadering")).toBeTruthy();
    expect(screen.queryByRole("row", { name: /Calcium/ })).toBeNull();
    expect(screen.getByText(/calorieën en macro's van een vergelijkbaar product/)).toBeTruthy();
  });
});
