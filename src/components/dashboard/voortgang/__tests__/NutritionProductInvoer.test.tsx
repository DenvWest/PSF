/** @vitest-environment jsdom */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NutritionProductInvoer from "@/components/dashboard/voortgang/NutritionProductInvoer";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";

const HAVERMOUT: DagboekItem = { moment: "ontbijt", key: "havermout", grams: 60 };

describe("NutritionProductInvoer", () => {
  it("zoekt een product en voegt het toe met zijn gangbare portie", () => {
    const onChange = vi.fn();
    render(<NutritionProductInvoer items={[]} onChange={onChange} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "havermout" } });
    fireEvent.click(screen.getByRole("button", { name: /havermout/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [toegevoegd] = onChange.mock.calls[0] as [DagboekItem[]];
    expect(toegevoegd[0].key).toBe("havermout");
    expect(toegevoegd[0].moment).toBe("ontbijt");
    expect(toegevoegd[0].grams).toBeGreaterThan(0);
  });

  it("zet het gekozen eetmoment op het item", () => {
    const onChange = vi.fn();
    render(<NutritionProductInvoer items={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Avondeten" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "havermout" } });
    fireEvent.click(screen.getByRole("button", { name: /havermout/i }));

    const [toegevoegd] = onChange.mock.calls[0] as [DagboekItem[]];
    expect(toegevoegd[0].moment).toBe("avondeten");
  });

  it("past het gewicht aan en verwijdert een item", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <NutritionProductInvoer items={[HAVERMOUT]} onChange={onChange} />,
    );

    fireEvent.change(screen.getByLabelText(/gram voor/i), { target: { value: "100" } });
    expect((onChange.mock.calls[0] as [DagboekItem[]])[0][0].grams).toBe(100);

    onChange.mockClear();
    rerender(<NutritionProductInvoer items={[HAVERMOUT]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /verwijder/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  /**
   * De ondergrens-regel staat in de opmaak, niet in een afspraak. Deze twee
   * tests zijn er om te voorkomen dat het woord "minstens" bij een herschrijving
   * stilletjes wegvalt — dan leest een som als een dagtotaal, en dat is precies
   * wat dit dagboek niet beweert.
   */
  describe("de ondergrens-regel", () => {
    it("noemt elk bedrag 'minstens' en toont geen richtwaarde of percentage", () => {
      render(<NutritionProductInvoer items={[HAVERMOUT]} onChange={vi.fn()} />);

      const blok = screen.getByText(/uit wat je noemde/i).closest("div");
      expect(blok).not.toBeNull();
      expect(within(blok!).getAllByText(/minstens/i).length).toBeGreaterThan(0);
      expect(within(blok!).queryByText(/%/)).toBeNull();
      expect(within(blok!).queryByText(/richtwaarde|dagbehoefte|doel/i)).toBeNull();
    });

    it("zegt het apart wanneer een product nog geen gehalte heeft", () => {
      render(
        <NutritionProductInvoer
          items={[HAVERMOUT, { moment: "ontbijt", key: "spinazie-rauw", grams: 30 }]}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByText(/kennen we het gehalte nog niet/i)).toBeTruthy();
    });

    it("toont geen uitlezing zonder items", () => {
      render(<NutritionProductInvoer items={[]} onChange={vi.fn()} />);

      expect(screen.queryByText(/uit wat je noemde/i)).toBeNull();
    });
  });
});
