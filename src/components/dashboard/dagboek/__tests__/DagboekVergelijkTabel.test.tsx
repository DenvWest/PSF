/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekVergelijkTabel from "@/components/dashboard/dagboek/DagboekVergelijkTabel";
import type { VergelijkResultaat } from "@/components/dashboard/dagboek/DagboekVergelijkZoek";
import { catalogEntry } from "@/data/nutrition/food-catalog";

function voeding(key: string): VergelijkResultaat {
  const entry = catalogEntry(key);
  if (!entry) throw new Error(`onbekende catalogusregel ${key}`);
  return { bron: "voeding", entry };
}

afterEach(cleanup);

describe("DagboekVergelijkTabel", () => {
  it("houdt een product zonder gehalte als kolom in beeld met een streepje", () => {
    render(
      <DagboekVergelijkTabel
        producten={[voeding("spinazie-diepvries"), voeding("broccoli-diepvries")]}
        onTerug={vi.fn()}
        onVerwijder={vi.fn()}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /Broccoli, diepvries/ })).toBeTruthy();
    const magnesium = screen.getByRole("row", { name: /Magnesium/ });
    expect(within(magnesium).getByLabelText("niet gemeten")).toBeTruthy();
    expect(screen.getByText(/zijn nog geen gemeten gehaltes/)).toBeTruthy();
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
});
