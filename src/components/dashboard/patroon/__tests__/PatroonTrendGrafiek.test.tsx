/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PatroonTrendGrafiek from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import type { StofTrend, StofTrendPunt } from "@/lib/nutrition-stof-trend";

afterEach(cleanup);

function punt(
  sleutel: string,
  waarde: number | null,
  staat: StofTrendPunt["staat"],
  extra: Partial<StofTrendPunt> = {},
): StofTrendPunt {
  return {
    sleutel,
    label: sleutel.slice(-2),
    sublabel: waarde === null ? "—" : "3/3",
    waarde,
    aandeel: waarde === null ? null : waarde / 350,
    staat,
    benaderd: false,
    uitleg: `${sleutel}: ${waarde === null ? "niets geregistreerd" : `${waarde} mg`}`,
    aanvulling: null,
    detail: null,
    ...extra,
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
    punt("2026-10-01", 120, "onvolledig", {
      aanvulling: 140,
      detail: {
        momenten: [
          { moment: "ontbijt", label: "Ontbijt", waarde: 120, keer: 1, geschat: null },
          { moment: "lunch", label: "Lunch", waarde: null, keer: 0, geschat: 140 },
        ],
        bronnen: [{ naam: "Havermout", bedrag: 80 }],
        schatting: "≈ 74% met je gebruikelijke lunch (gem. 140 mg, 4×).",
      },
    }),
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

  it("arceert een onvolledige dag en stippelt de geschatte ontbrekende maaltijd erbovenop", () => {
    const { container } = render(<PatroonTrendGrafiek trend={trend} />);
    expect(container.querySelector('[data-staat="onvolledig"]')).toBeTruthy();
    expect(container.querySelector('[data-staat="onder"]')).toBeTruthy();
    expect(container.querySelector("[data-schatting]")).toBeTruthy();
  });

  it("schaalt van 0 tot 100% van de norm en labelt wat erboven zit", () => {
    render(<PatroonTrendGrafiek trend={trend} />);
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText("114%")).toBeTruthy();
    expect(screen.getByText("100% = norm 350 mg")).toBeTruthy();
  });

  it("zonder norm blijft de schaal in de eenheid, zonder procentas", () => {
    render(<PatroonTrendGrafiek trend={{ ...trend, norm: null }} />);
    expect(screen.queryByText("100%")).toBeNull();
  });

  it("toont in het paneel de schatting, de maaltijden, de bronnen en de redenen", () => {
    render(<PatroonTrendGrafiek trend={trend} redenen={["1 dag mist een hoofdmaaltijd."]} />);
    expect(screen.getByText("≈ 74% met je gebruikelijke lunch (gem. 140 mg, 4×).")).toBeTruthy();
    expect(screen.getByText(/≈ 140 mg/)).toBeTruthy();
    expect(screen.getByText(/Havermout \(80 mg\)/)).toBeTruthy();
    expect(screen.getByText("1 dag mist een hoofdmaaltijd.")).toBeTruthy();
  });
});
