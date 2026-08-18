// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import { SCHAP_BASIS_CARDS } from "@/data/movement/schap-basis-cards";

const wandelen = SCHAP_BASIS_CARDS.find((c) => c.id === "wandelen")!;

describe("MovementSchapBasisCard", () => {
  it("toont titel, waarom-tekst en rol, verdict dicht bij eerste render", () => {
    render(<MovementSchapBasisCard card={wandelen} />);
    expect(screen.queryByText(wandelen.title)).not.toBeNull();
    expect(screen.queryByText(wandelen.why)).not.toBeNull();
    expect(screen.queryByText(wandelen.verdict.oordeel)).toBeNull();
  });

  it("opent het oordeel bij 'Bekijk ons oordeel' en toont alle vier de velden", () => {
    render(<MovementSchapBasisCard card={wandelen} />);
    fireEvent.click(screen.getByText("Bekijk ons oordeel"));
    expect(screen.queryByText(wandelen.verdict.gecheckt)).not.toBeNull();
    expect(screen.queryByText(wandelen.verdict.sterk)).not.toBeNull();
    expect(screen.queryByText(wandelen.verdict.zwak)).not.toBeNull();
    expect(screen.queryByText(wandelen.verdict.oordeel)).not.toBeNull();
  });

  it("wisselt 'Bewaar in Favorieten' naar 'Staat in Favorieten' na een klik", () => {
    render(<MovementSchapBasisCard card={wandelen} />);
    expect(screen.queryByText("Bewaar in Favorieten")).not.toBeNull();
    fireEvent.click(screen.getByText("Bewaar in Favorieten"));
    expect(screen.queryByText("Staat in Favorieten")).not.toBeNull();
    expect(screen.queryByText("Bewaar in Favorieten")).toBeNull();
  });

  it("noemt geen bedrijfsnaam of exacte afstand — alleen de twee veilige kaarten bestaan", () => {
    const ids = SCHAP_BASIS_CARDS.map((c) => c.id);
    expect(ids).toEqual(["wandelen", "ritme"]);
    for (const card of SCHAP_BASIS_CARDS) {
      const text = JSON.stringify(card);
      expect(text).not.toMatch(/\d,\d\s?km/);
    }
  });
});
