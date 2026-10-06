/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekProductLevert from "@/components/dashboard/dagboek/DagboekProductLevert";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const { haalNevo } = vi.hoisted(() => ({ haalNevo: vi.fn(async (): Promise<SupermarktProduct[]> => []) }));
vi.mock("@/lib/supermarkt-producten-client", () => ({
  haalNevoProductenViaApi: haalNevo,
  haalNevoProductViaApi: vi.fn(async () => null),
}));

vi.mock("@/lib/use-gevolgde-stoffen", () => ({
  useGevolgdeStoffen: () => ({ stoffen: ["ironMg"], geladen: true, zetGevolgd: vi.fn() }),
}));

function nevo(code: string, waarden: Partial<SupermarktProduct>): SupermarktProduct {
  return {
    prodId: `nevo:${code}`,
    bron: "nevo",
    bronId: code,
    naam: "NEVO-product",
    merk: null,
    categorie: null,
    snapshotDatum: "2025/9.0",
    ...waarden,
  } as SupermarktProduct;
}

afterEach(() => {
  cleanup();
  haalNevo.mockReset();
  haalNevo.mockResolvedValue([]);
});

describe("DagboekProductLevert", () => {
  it("toont kernstoffen met een gemeten 0 en het volledige etiket", async () => {
    haalNevo.mockResolvedValue([nevo("1146", { energyKcal: 20, potassiumMg: 338 })]);
    render(<DagboekProductLevert item={{ moment: "lunch", bron: "voeding", key: "spinazie-diepvries", grams: 100 }} />);
    expect(screen.getByText("Vitamine D")).toBeTruthy();
    expect(screen.getByText("0 µg")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Kalium")).toBeTruthy());
    expect(screen.getByRole("heading", { name: "Voedingswaarde" })).toBeTruthy();
  });

  it("toont van een vrijgegeven benadering het etiket als benadering", async () => {
    haalNevo.mockResolvedValue([nevo("920", { energyKcal: 27, potassiumMg: 399 })]);
    render(<DagboekProductLevert item={{ moment: "lunch", bron: "voeding", key: "broccoli-diepvries", grams: 80 }} />);
    expect(screen.getByText(/Dit zijn de waarden van/)).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Voedingswaarde · benadering" })).toBeTruthy());
  });

  it("toont een gevolgde stof met %ADH onder de kernstoffen", async () => {
    haalNevo.mockResolvedValue([nevo("1146", { energyKcal: 20, ironMg: 2.8 })]);
    render(<DagboekProductLevert item={{ moment: "lunch", bron: "voeding", key: "spinazie-diepvries", grams: 100 }} />);
    await waitFor(() => expect(screen.getByText("Ook gevolgd")).toBeTruthy());
    expect(screen.getAllByText("20% ADH")).toHaveLength(2);
  });

  it("rekent eiwit tegen je eiwitdoel", () => {
    render(
      <DagboekProductLevert
        item={{ moment: "lunch", bron: "voeding", key: "spinazie-diepvries", grams: 100 }}
        proteinTarget={{ gramsLow: 60, gramsHigh: 90 }}
      />,
    );
    expect(screen.getByText(/% van je doel$/)).toBeTruthy();
    expect(screen.queryByText("eigen doel")).toBeNull();
  });
});
