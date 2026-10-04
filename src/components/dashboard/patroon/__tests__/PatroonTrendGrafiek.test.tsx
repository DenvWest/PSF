/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PatroonTrendGrafiek from "@/components/dashboard/patroon/PatroonTrendGrafiek";

afterEach(cleanup);

const punten = [
  { weekStart: "2026-08-24", waarde: 200, aandeel: 0.57, dagen: 3 },
  { weekStart: "2026-08-31", waarde: null, aandeel: null, dagen: 0 },
  { weekStart: "2026-09-07", waarde: 300, aandeel: 0.86, dagen: 4 },
  { weekStart: "2026-09-14", waarde: 400, aandeel: 1.14, dagen: 2 },
  { weekStart: "2026-09-21", waarde: 350, aandeel: 1, dagen: 5 },
  { weekStart: "2026-09-28", waarde: null, aandeel: null, dagen: 0 },
];

function teken() {
  render(
    <PatroonTrendGrafiek
      label="Magnesium"
      punten={punten}
      unit="mg"
      referentie={350}
      referentieNaam="norm"
      toon="oordeel"
      huidigeWeek="2026-09-28"
    />,
  );
}

describe("PatroonTrendGrafiek", () => {
  it("leest standaard de laatst gemeten week uit, met % van de norm", () => {
    teken();
    expect(screen.getByText("350 mg per dag")).toBeTruthy();
    expect(screen.getByText("100% van de norm")).toBeTruthy();
    expect(screen.getByText("5 dagen gemeten")).toBeTruthy();
  });

  it("wisselt de uitlezing bij een tik op een andere week", () => {
    teken();
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(screen.getByText("200 mg per dag")).toBeTruthy();
    expect(screen.getByText("57% van de norm")).toBeTruthy();
  });

  it("benoemt de huidige week en de norm", () => {
    teken();
    expect(screen.getByText("nu")).toBeTruthy();
    expect(screen.getAllByText(/norm/).length).toBeGreaterThan(0);
  });
});

describe("PatroonTrendGrafiek zonder referentie", () => {
  it("kleurt neutraal als er geen doel is", () => {
    const { container } = render(
      <PatroonTrendGrafiek
        label="Eiwit"
        punten={punten}
        unit="g"
        referentie={null}
        referentieNaam="norm"
        toon="oordeel"
        huidigeWeek="2026-09-28"
      />,
    );
    const staven = [...container.querySelectorAll<HTMLElement>("span[style*='background']")];
    expect(staven.length).toBeGreaterThan(0);
    for (const staaf of staven) expect(staaf.style.background).toBe("var(--vd-ink-3)");
  });
});
