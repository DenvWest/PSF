/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonStofChips from "@/components/dashboard/patroon/PatroonStofChips";
import PatroonStofHero, { stofStand } from "@/components/dashboard/patroon/PatroonStofHero";
import type { StofDetailGegevens } from "@/components/dashboard/patroon/PatroonStofDetail";
import { normVoor, STANDAARD_NORMEN } from "@/lib/nutrition-normen";

afterEach(cleanup);

const MAGNESIUM: StofDetailGegevens = {
  stof: "magnesium",
  label: "Magnesium",
  unit: "mg",
  lezing: "per_dag",
  gemiddeld: 180,
  totaal: 360,
  aandeel: 0.5,
  normPeriode: null,
  bewijsbaar: true,
  gedekt: false,
  norm: normVoor(STANDAARD_NORMEN, "magnesium"),
  streef: null,
  vergelijkingPad: null,
  zonderNormUitleg: "",
};

describe("PatroonStofChips", () => {
  const chips = [
    { stof: "magnesium" as const, label: "Magnesium", toon: "terra" as const },
    { stof: "calciumMg" as const, label: "Calcium", toon: "sage" as const },
  ];

  it("kiest een stof, of terug naar het overzicht, en opent de kiezer", () => {
    const onKies = vi.fn();
    const onKiezer = vi.fn();
    render(<PatroonStofChips chips={chips} actief="magnesium" kiezerOpen={false} onKies={onKies} onKiezer={onKiezer} />);
    expect(screen.getByRole("button", { name: "Magnesium", pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Calcium" }));
    expect(onKies).toHaveBeenCalledWith("calciumMg");
    fireEvent.click(screen.getByRole("button", { name: "Overzicht" }));
    expect(onKies).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "+ Stoffen kiezen die je volgt" }));
    expect(onKiezer).toHaveBeenCalled();
  });
});

describe("PatroonStofHero", () => {
  const periode = { van: "2026-10-04", tot: "2026-10-10" };

  it("zegt 'onder je norm' zonder tekort te beweren, met balk tegen de norm", () => {
    render(<PatroonStofHero rij={MAGNESIUM} periode={periode} dagenGeregistreerd={5} />);
    expect(screen.getByText("Onder je norm")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Magnesium 180 mg, norm/ })).toBeTruthy();
    expect(screen.queryByText(/tekort/i)).toBeNull();
  });

  it("toont geen balk en geen oordeel bij een stof die een dagboek niet kan aantonen", () => {
    render(<PatroonStofHero rij={{ ...MAGNESIUM, bewijsbaar: false }} periode={periode} dagenGeregistreerd={5} />);
    expect(screen.getByText("Niet aan te tonen")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("stofStand: gehaald, onder, niets geregistreerd", () => {
    expect(stofStand({ ...MAGNESIUM, gedekt: true, aandeel: 1.2 }, 3).toon).toBe("sage");
    expect(stofStand(MAGNESIUM, 3).toon).toBe("terra");
    expect(stofStand(MAGNESIUM, 0).kort).toBe("Niets geregistreerd");
  });
});
