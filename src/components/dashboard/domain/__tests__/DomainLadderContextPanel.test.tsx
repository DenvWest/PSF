// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DomainKompasScreen from "@/components/dashboard/domain/DomainKompasScreen";
import DomainLadderContextPanel from "@/components/dashboard/domain/DomainLadderContextPanel";
import {
  DomainLadderFocusProvider,
  useDomainLadderFocus,
} from "@/lib/domain-ladder-focus-context";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

const LADDER = getLeefstijlLadder("beweging")!;
const FOCUS_LAYER = 2;

function model(): DashboardModel {
  return {
    scores: { beweging: 64 },
    trend: { beweging: [58, 59, 61, 62, 63, 64] },
  } as unknown as DashboardModel;
}

function data(): DashboardData {
  return {
    domainCheckDaysAgo: { beweging: 1 },
    movementCheckinSnapshot: {
      date: "2026-08-21",
      headline: "Je kracht is het deel dat nu achterblijft.",
      focusDimension: "kracht",
      focusLabel: "Kracht",
      answerLabel: "1× per week",
      focusStatement: "",
      implicationLine: "",
      ladder: {
        focus: FOCUS_LAYER,
        states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
        coverage: { onOrder: 1, measured: 3 },
      },
      factRows: [
        {
          key: "aeroob",
          label: "Aerobe minuten",
          answerLabel: "150 minuten",
          benchmarkLabel: "Richtlijn: 150-300 minuten matig",
          benchmarkSource: "WHO 2020",
          status: "meets",
          whyLine: "Intensieve minuten tellen dubbel; samen vormen ze je aerobe basis.",
          footnote: null,
        },
        {
          key: "kracht",
          label: "Kracht",
          answerLabel: "1× per week",
          benchmarkLabel: "Richtlijn: 2× per week",
          benchmarkSource: "WHO 2020",
          status: "below",
          whyLine:
            "Richtlijn is 2× per week; jij zit daar nu onder. Eén vast moment brengt dit binnen bereik.",
          footnote: null,
        },
      ],
    },
  } as unknown as DashboardData;
}

/**
 * De bedrading zoals Dashboard hem legt: het domeinscherm publiceert de laag,
 * de contextkolom leest hem. Precies die naad is wat hier getest wordt.
 */
function Harness({ dashboardData }: { dashboardData: DashboardData }) {
  const { focus } = useDomainLadderFocus();
  return (
    <>
      <DomainKompasScreen
        domain="beweging"
        model={model()}
        data={dashboardData}
        onGoAgenda={() => {}}
        onGoVoortgangDomein={() => {}}
      />
      {focus ? (
        <DomainLadderContextPanel
          domain={focus.domain}
          layerId={focus.layerId}
          data={dashboardData}
        />
      ) : null}
    </>
  );
}

function renderBoth() {
  return render(
    <DomainLadderFocusProvider>
      <LadderMomentsProvider>
        <VoortgangFavoritesProvider>
          <Harness dashboardData={data()} />
        </VoortgangFavoritesProvider>
      </LadderMomentsProvider>
    </DomainLadderFocusProvider>,
  );
}

/** De ladder in het midden; de strip in de zijbalk heeft een eigen naam. */
function middleLadder() {
  return screen.getByRole("group", { name: "Je prioriteiten" });
}

function sidebarStrip() {
  return screen.getByRole("group", { name: "Wissel van prioriteit" });
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ items: [], blocks: [] }), { status: 200 })),
  );
});

describe("DomainLadderContextPanel — zone 1: de laag mét zijn reden", () => {
  it("opent op de winst-laag en draagt de feitenrij die hem verklaart", () => {
    renderBoth();
    const zone = screen.getByRole("region", { name: "De laag die je leest" });
    expect(within(zone).getByText(`Prioriteit ${FOCUS_LAYER} · Grootste winst`)).toBeTruthy();
    expect(
      within(zone).getByText(
        /Richtlijn is 2× per week; jij zit daar nu onder\. Eén vast moment brengt dit binnen bereik\./,
      ),
    ).toBeTruthy();
    // De rij die onder de richtlijn zit wint van de rij die hem haalt.
    expect(within(zone).queryByText(/Intensieve minuten tellen dubbel/)).toBeNull();
  });

  it("biedt de weg terug zodra je een andere laag leest, en niet daarvoor", () => {
    renderBoth();
    expect(screen.queryByRole("button", { name: /Terug naar prioriteit/ })).toBeNull();
    fireEvent.click(within(sidebarStrip()).getByRole("button", { name: /Prioriteit 4/ }));
    fireEvent.click(
      screen.getByRole("button", { name: `Terug naar prioriteit ${FOCUS_LAYER}` }),
    );
    expect(
      screen.getByRole("region", { name: "De laag die je leest" }).textContent,
    ).toContain(`Prioriteit ${FOCUS_LAYER} · Grootste winst`);
  });
});

describe("DomainLadderContextPanel — zone 2: één bron voor de laagkeuze", () => {
  it("wisselt vanuit de zijbalk, en het midden gaat mee", () => {
    renderBoth();
    fireEvent.click(within(sidebarStrip()).getByRole("button", { name: /Prioriteit 4/ }));

    const layer4 = LADDER.layers.find((layer) => layer.id === 4)!;
    expect(
      within(middleLadder())
        .getByRole("button", { name: new RegExp(layer4.name) })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("region", { name: "De laag die je leest" }).textContent,
    ).toContain(layer4.name);
  });

  it("wisselt vanuit het midden, en de zijbalk gaat mee", () => {
    renderBoth();
    const layer3 = LADDER.layers.find((layer) => layer.id === 3)!;
    fireEvent.click(
      within(middleLadder()).getByRole("button", { name: new RegExp(layer3.name) }),
    );

    expect(
      within(sidebarStrip())
        .getByRole("button", { name: /Prioriteit 3/ })
        .getAttribute("aria-current"),
    ).toBe("true");
    expect(
      screen.getByRole("region", { name: "De laag die je leest" }).textContent,
    ).toContain(layer3.name);
  });

  it("draagt zes knoppen en geen laagnamen — geen tweede ladder (N6)", () => {
    renderBoth();
    const buttons = within(sidebarStrip()).getAllByRole("button");
    expect(buttons).toHaveLength(6);
    for (const layer of LADDER.layers) {
      expect(within(sidebarStrip()).queryByText(layer.name)).toBeNull();
    }
  });
});

describe("DomainLadderContextPanel — zone 3: kiezen, niet afvinken", () => {
  it("deelt één bewaar-staat met het midden — dezelfde knop, geen tweede bron", () => {
    renderBoth();
    const zone = screen.getByRole("region", { name: "Wat je hier kunt kiezen" });
    const sidebarSave = within(zone).getByRole("button", { name: /Zet bij Mijn keuze/ });

    fireEvent.click(sidebarSave);

    // De rang-1-actie staat op beide plekken; na één klik staan ze allebei aan.
    expect(screen.getAllByRole("button", { name: /Staat bij Mijn keuze/ })).toHaveLength(2);
  });

  it("toont de rang-1-actie van de laag, niet de hele lijst", () => {
    renderBoth();
    const zone = screen.getByRole("region", { name: "Wat je hier kunt kiezen" });
    const layer = LADDER.layers.find((row) => row.id === FOCUS_LAYER)!;
    expect(within(zone).getByText(layer.actions[0])).toBeTruthy();
    if (layer.actions[1]) {
      expect(within(zone).queryByText(layer.actions[1])).toBeNull();
    }
  });

  it("laat wat je koos meteen onder Mijn keuze op deze laag verschijnen", () => {
    renderBoth();
    const keuzeZone = screen.getByRole("region", { name: "Mijn keuze op deze laag" });
    expect(keuzeZone.textContent).toContain("Hier koos je nog niets");

    const actieZone = screen.getByRole("region", { name: "Wat je hier kunt kiezen" });
    fireEvent.click(within(actieZone).getByRole("button", { name: /Zet bij Mijn keuze/ }));

    const layer = LADDER.layers.find((row) => row.id === FOCUS_LAYER)!;
    expect(keuzeZone.textContent).toContain(layer.actions[0]);
    // Weghalen kan hier ook — één regel, één hart, dezelfde bron.
    expect(
      within(keuzeZone).getByRole("button", { name: /klik om weg te halen/ }),
    ).toBeTruthy();
  });

  it("toont alleen de keuzes van de laag die je leest", () => {
    renderBoth();
    const actieZone = screen.getByRole("region", { name: "Wat je hier kunt kiezen" });
    fireEvent.click(within(actieZone).getByRole("button", { name: /Zet bij Mijn keuze/ }));

    fireEvent.click(within(sidebarStrip()).getByRole("button", { name: /Prioriteit 4/ }));
    const keuzeZone = screen.getByRole("region", { name: "Mijn keuze op deze laag" });
    expect(keuzeZone.textContent).toContain("Hier koos je nog niets");
  });

  it("heeft geen afvink-affordance en geen tweede deur naar Mijn Dag", () => {
    renderBoth();
    const panelRegions = [
      "De laag die je leest",
      "Andere prioriteit lezen",
      "Wat je hier kunt kiezen",
      "Mijn keuze op deze laag",
    ].map((name) => screen.getByRole("region", { name }));

    for (const region of panelRegions) {
      expect(within(region).queryByRole("checkbox")).toBeNull();
      expect(within(region).queryByRole("button", { name: /Open Mijn Dag/ })).toBeNull();
      expect(within(region).queryByText(/afgevinkt|Gedaan vandaag/i)).toBeNull();
    }
  });
});
