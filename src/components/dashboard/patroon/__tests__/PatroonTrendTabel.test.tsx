/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonTrendTabel from "@/components/dashboard/patroon/PatroonTrendTabel";
import { NORM, type StofTrend, type StofTrendPunt } from "@/lib/nutrition-stof-trend";

afterEach(cleanup);

function punt(sleutel: string, aandeel: number | null, staat: StofTrendPunt["staat"], normGehaald = false): StofTrendPunt {
  return {
    sleutel,
    label: sleutel,
    sublabel: "",
    waarde: aandeel === null ? null : aandeel * 100,
    aandeel,
    staat,
    normGehaald,
    benaderd: false,
    uitleg: sleutel,
    aanvulling: null,
    detail: null,
  };
}

function trend(extra: Partial<StofTrend>): StofTrend {
  return {
    stof: "magnesium",
    label: "magnesium",
    unit: "mg",
    soort: "kern",
    norm: 100,
    normNaam: NORM,
    periodetotaal: false,
    bewijsbaar: true,
    schaal: "dag",
    punten: [punt("ma", 1.12, "gehaald", true), punt("di", 0.84, "onder"), punt("wo", 0.62, "onvolledig"), punt("do", null, "leeg")],
    kop: "",
    gehaald: false,
    redenen: [],
    ...extra,
  };
}

describe("PatroonTrendTabel", () => {
  it("zet een ✓ waar de lat gehaald is, gestreept bij onvolledig en telt gehaald per stof", () => {
    render(<PatroonTrendTabel trends={[trend({})]} onKies={() => {}} />);
    expect(screen.getByText("✓112")).toBeTruthy();
    expect(screen.getByText("84")).toBeTruthy();
    expect(screen.getByText("62")).toBeTruthy();
    expect(screen.getByText("1 van 3")).toBeTruthy();
  });

  it("laat omega-3 als één regel over alle dagen zien, niet als percentage per dag", () => {
    render(<PatroonTrendTabel trends={[trend({ stof: "omega3", label: "omega-3", periodetotaal: true, kop: "≥945 mg totaal · 38%" })]} onKies={() => {}} />);
    expect(screen.getByText(/Telt over alle dagen samen, niet per dag/)).toBeTruthy();
    expect(screen.queryByText("✓112")).toBeNull();
  });

  it("zet stoffen zonder norm in een eigen tabel met de eenheid achter de naam", () => {
    const natrium = trend({
      stof: "sodiumMg",
      label: "Natrium",
      soort: "gevolgd",
      norm: null,
      punten: [punt("ma", null, "neutraal"), punt("di", null, "neutraal")].map((p, i) => ({ ...p, waarde: i === 0 ? 2100 : 1900 })),
    });
    render(<PatroonTrendTabel trends={[trend({}), natrium]} onKies={() => {}} />);
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByText("(mg)")).toBeTruthy();
    expect(screen.getByText("2.100")).toBeTruthy();
    expect(screen.getByText("2.000")).toBeTruthy();
    expect(screen.getByText(/geen glas en geen ✓/)).toBeTruthy();
  });

  it("geeft een gevolgde stof ook een ✓, en een niet aan te tonen stof alleen zijn kop", () => {
    render(
      <PatroonTrendTabel
        trends={[
          trend({ stof: "calciumMg", label: "calcium", soort: "gevolgd" }),
          trend({ stof: "zinc", label: "zink", bewijsbaar: false, kop: "geen oordeel" }),
        ]}
        onKies={() => {}}
      />,
    );
    expect(screen.getByText("✓112")).toBeTruthy();
    expect(screen.getByText("geen oordeel")).toBeTruthy();
  });

  it("springt naar de stof bij een tik op de naam", () => {
    const onKies = vi.fn();
    render(<PatroonTrendTabel trends={[trend({})]} onKies={onKies} />);
    fireEvent.click(screen.getByRole("button", { name: "Magnesium" }));
    expect(onKies).toHaveBeenCalledWith("magnesium");
  });
});
