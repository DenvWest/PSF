/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import type { CatalogEntry } from "@/data/nutrition/food-catalog";

afterEach(cleanup);

const ENTRY: CatalogEntry = {
  key: "kipdij",
  labelNl: "Kipdij",
  category: "vlees",
  groep: "vlees",
  porties: [{ labelNl: "portie", grams: 125 }],
  bron: null,
};

describe("FoodThumbnail", () => {
  it("toont de foto zolang die er is", () => {
    render(<FoodThumbnail entry={ENTRY} />);
    expect(screen.getByAltText("Kipdij")).toBeTruthy();
  });

  it("valt terug op de tegel van de voedselgroep als de foto ontbreekt", () => {
    render(<FoodThumbnail entry={ENTRY} />);
    fireEvent.error(screen.getByAltText("Kipdij"));
    expect(screen.queryByAltText("Kipdij")).toBeNull();
    expect(screen.getByTitle("Vlees").textContent).toBe("🥩");
  });
});
