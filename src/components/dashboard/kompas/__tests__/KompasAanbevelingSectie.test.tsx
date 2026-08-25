// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import KompasAanbevelingSectie from "@/components/dashboard/kompas/KompasAanbevelingSectie";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData } from "@/types/dashboard";

const LADDER = getLeefstijlLadder("beweging")!;

const KRACHT_ROW = {
  key: "kracht",
  label: "Kracht",
  answerLabel: "1× per week",
  benchmarkLabel: "Richtlijn: 2× per week",
  benchmarkSource: "WHO 2020",
  status: "below",
  whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
  footnote: null,
};

function data(focus: number, factRows: unknown[] = [KRACHT_ROW]): DashboardData {
  return {
    domainCheckDaysAgo: { beweging: 2 },
    movementCheckinSnapshot: {
      date: "2026-08-23",
      headline: "Je kracht is het deel dat nu achterblijft.",
      focusDimension: "kracht",
      focusLabel: "Kracht",
      answerLabel: "1× per week",
      focusStatement: "",
      implicationLine: "",
      ladder: {
        focus,
        states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
        coverage: { onOrder: 1, measured: 3 },
      },
      factRows,
    },
  } as unknown as DashboardData;
}

describe("KompasAanbevelingSectie", () => {
  it("toont de winst-laag met de bewijsregel uit de check en opent het domein", () => {
    const onOpenDomain = vi.fn();
    render(
      <KompasAanbevelingSectie domain="beweging" data={data(2)} onOpenDomain={onOpenDomain} />,
    );

    const layer = LADDER.layers.find((row) => row.id === 2)!;
    expect(screen.queryByText(layer.name)).not.toBeNull();
    expect(screen.queryByText(/Prioriteit 2 ·/)).not.toBeNull();
    expect(screen.queryByText(KRACHT_ROW.whyLine)).not.toBeNull();
    // De herkomst staat erbij: waarop dit rust, en hoe vers dat is.
    expect(screen.queryByText(/beweegcheck van 2 dagen geleden/)).not.toBeNull();
    // Eerste gratis actie van die laag, letterlijk uit dezelfde ladderbron.
    expect(screen.queryByText(layer.actions[0])).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Open Beweging op prioriteit 2/ }));
    expect(onOpenDomain).toHaveBeenCalledWith("beweging");
  });

  it("rendert niets op een domein zonder readout", () => {
    const { container } = render(
      <KompasAanbevelingSectie domain="voeding" data={data(2)} onOpenDomain={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("rendert niets zonder domeincheck", () => {
    const { container } = render(
      <KompasAanbevelingSectie
        domain="beweging"
        data={{} as DashboardData}
        onOpenDomain={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("verzint geen reden waar de check er geen levert", () => {
    // Laag 3 leunt op de feitenrij `consistentie`; die staat hier niet in de
    // check. Dan hoort er een laag te staan zonder redenblok eronder.
    render(
      <KompasAanbevelingSectie domain="beweging" data={data(3)} onOpenDomain={() => {}} />,
    );

    const layer = LADDER.layers.find((row) => row.id === 3)!;
    expect(screen.queryByText(layer.name)).not.toBeNull();
    expect(screen.queryByText(KRACHT_ROW.whyLine)).toBeNull();
  });
});
