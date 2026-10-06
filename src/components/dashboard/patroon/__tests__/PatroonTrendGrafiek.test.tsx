/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PatroonTrendGrafiek from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import type { StofTrend, StofTrendPunt } from "@/lib/nutrition-stof-trend";

afterEach(cleanup);

function punt(sleutel: string, waarde: number | null, staat: StofTrendPunt["staat"]): StofTrendPunt {
  return {
    sleutel,
    label: sleutel.slice(-2),
    sublabel: waarde === null ? "—" : "3/3",
    waarde,
    aandeel: waarde === null ? null : waarde / 350,
    staat,
    benaderd: false,
    uitleg: `${sleutel}: ${waarde === null ? "niets geregistreerd" : `${waarde} mg`}`,
  };
}

const trend: StofTrend = {
  stof: "magnesium",
  label: "Magnesium",
  unit: "mg",
  soort: "kern",
  norm: 350,
  bewijsbaar: true,
  schaal: "dag",
  punten: [
    punt("2026-09-28", 200, "onder"),
    punt("2026-09-29", null, "leeg"),
    punt("2026-09-30", 400, "gehaald"),
    punt("2026-10-01", 120, "onvolledig"),
  ],
  kop: "",
  gehaald: false,
  redenen: [],
};

describe("PatroonTrendGrafiek", () => {
  it("leest standaard het laatst gemeten punt uit", () => {
    render(<PatroonTrendGrafiek trend={trend} />);
    expect(screen.getByText("2026-10-01: 120 mg", { selector: "p" })).toBeTruthy();
  });

  it("wisselt de uitlezing bij een tik op een ander punt", () => {
    render(<PatroonTrendGrafiek trend={trend} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(screen.getByText("2026-09-28: 200 mg", { selector: "p" })).toBeTruthy();
  });

  it("arceert een onvolledige dag en toont de norm als lijn", () => {
    const { container } = render(<PatroonTrendGrafiek trend={trend} />);
    expect(container.querySelector('[data-staat="onvolledig"]')).toBeTruthy();
    expect(container.querySelector('[data-staat="onder"]')).toBeTruthy();
    expect(screen.getByText(/norm/, { selector: "span" })).toBeTruthy();
  });

  it("toont per maaltijd geen normlijn", () => {
    render(<PatroonTrendGrafiek trend={{ ...trend, schaal: "maaltijd" }} />);
    expect(screen.queryByText(/norm/, { selector: "span" })).toBeNull();
  });
});
