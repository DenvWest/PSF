/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonTrend from "@/components/dashboard/patroon/PatroonTrend";
import { NORM, type StofTrend } from "@/lib/nutrition-stof-trend";

afterEach(cleanup);

function gevolgd(stof: "sodiumMg" | "potassiumMg", label: string): StofTrend {
  return {
    stof,
    label,
    unit: "mg",
    soort: "gevolgd",
    norm: null,
    normNaam: NORM,
    periodetotaal: false,
    bewijsbaar: false,
    schaal: "dag",
    punten: [],
    kop: "",
    periode: null,
    gehaald: false,
    redenen: ["Niets geregistreerd in deze periode."],
  };
}

describe("PatroonTrend verschuiven", () => {
  it("verschuift een gevolgde stof, en de eerste kan niet verder omhoog", () => {
    const onVerschuif = vi.fn();
    render(
      <PatroonTrend
        kernstoffen={[]}
        gevolgd={[gevolgd("sodiumMg", "Natrium"), gevolgd("potassiumMg", "Kalium")]}
        onOpen={() => {}}
        onVerschuif={onVerschuif}
      />,
    );
    expect((screen.getByLabelText("Natrium een plek omhoog") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Natrium een plek omlaag"));
    expect(onVerschuif).toHaveBeenCalledWith("sodiumMg", 1);
  });
});
