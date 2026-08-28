// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DomainKompasScreen from "@/components/dashboard/domain/DomainKompasScreen";
import KompasContextSpine from "@/components/dashboard/kompas/KompasContextSpine";
import {
  DomainLadderFocusProvider,
  useDomainLadderFocus,
} from "@/lib/domain-ladder-focus-context";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import { patchDomainGoal, resetDomainGoalsCache } from "@/lib/use-domain-goals";
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
        <KompasContextSpine
          domain={focus.domain}
          openLayerId={focus.layerId}
          data={dashboardData}
          model={model()}
          todayActionDone={false}
          domainScreenOpen
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

/** De enige ladder die er is: die van het midden. */
function middleLadder() {
  return screen.getByRole("group", { name: "Je prioriteiten" });
}

function selectLayerInMiddle(layerId: number) {
  const layer = LADDER.layers.find((row) => row.id === layerId)!;
  fireEvent.click(
    within(middleLadder()).getByRole("button", { name: new RegExp(layer.name) }),
  );
  return layer;
}

/** De rang-1-actie van de laag die je leest — de enige save-knop is die in het midden. */
function saveRank1InMiddle() {
  const buttons = screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ });
  fireEvent.click(buttons[0]);
}

beforeEach(() => {
  resetDomainGoalsCache();
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

describe("Contextkolom — zone 1: waar je winst nu zit", () => {
  it("opent op de winst-laag en draagt de feitenrij die hem verklaart", () => {
    renderBoth();
    const zone = screen.getByRole("region", { name: "Waar je winst nu zit" });
    expect(within(zone).getByText("Grootste winst")).toBeTruthy();
    expect(
      within(zone).getByText(
        /Richtlijn is 2× per week; jij zit daar nu onder\. Eén vast moment brengt dit binnen bereik\./,
      ),
    ).toBeTruthy();
    // De rij die onder de richtlijn zit wint van de rij die hem haalt.
    expect(within(zone).queryByText(/Intensieve minuten tellen dubbel/)).toBeNull();
  });

  it("volgt de laag die je in het midden aanklikt", () => {
    renderBoth();
    const layer4 = selectLayerInMiddle(4);
    expect(
      screen.getByRole("region", { name: "Waar je winst nu zit" }).textContent,
    ).toContain(layer4.name);
  });
});

describe("Contextkolom — geen spiegel van het midden", () => {
  it("draagt geen tweede laag-navigator", () => {
    renderBoth();
    // Eén ladder op het scherm, en die staat in het midden.
    expect(screen.getAllByRole("group", { name: "Je prioriteiten" })).toHaveLength(1);
    expect(screen.queryByRole("group", { name: "Wissel van prioriteit" })).toBeNull();
  });

  it("draagt geen tweede save-knop naast die van het midden", () => {
    renderBoth();
    // `DomainFreeActionsTile` toont er twee; de kolom voegt er geen derde aan toe.
    const layer = LADDER.layers.find((row) => row.id === FOCUS_LAYER)!;
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ })).toHaveLength(
      Math.min(layer.actions.length, 2),
    );
  });

  it("herhaalt de samenvatting van de laag niet", () => {
    renderBoth();
    const layer = LADDER.layers.find((row) => row.id === FOCUS_LAYER)!;
    expect(screen.getAllByText(layer.summary)).toHaveLength(1);
  });

  it("herhaalt de weg terug naar de winst-laag niet", () => {
    renderBoth();
    selectLayerInMiddle(4);
    // Het midden draagt hem ("Terug daarheen"); de kolom niet.
    expect(screen.queryByRole("button", { name: /Terug naar prioriteit/ })).toBeNull();
  });
});

describe("Contextkolom — zone: waar je naartoe werkt (doel)", () => {
  it("opent het volledige zetmoment als er nog geen ijkpunt is", async () => {
    renderBoth();
    // Goals komen async binnen (gedeelde `useDomainGoals`-bron); de zone
    // verschijnt pas zodra die fetch — hier zonder resultaat — is afgerond.
    const zone = await screen.findByRole("region", { name: "Waar je naartoe werkt" });
    expect(zone.textContent).toContain("Nog geen ijkpunt");

    fireEvent.click(within(zone).getByRole("button", { name: /Zetten/ }));

    expect(screen.getByRole("dialog", { name: /Je doel/ })).toBeTruthy();
  });

  it("laat je hier herscoren, zonder naar het midden te hoeven", async () => {
    patchDomainGoal("beweging", {
      situationId: "trap_lopen",
      ownWords: null,
      scores: [{ score: 4 }],
      mode: "verwerven",
    });
    renderBoth();
    const zone = screen.getByRole("region", { name: "Waar je naartoe werkt" });
    expect(zone.textContent).toContain("Nu 4 van 10");

    fireEvent.click(within(zone).getByRole("button", { name: /Bijwerken/ }));
    // Geen tweede dialoog — herscoren gaat inline, in dezelfde kolom.
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(within(zone).getByRole("button", { name: "8" }));
    fireEvent.click(within(zone).getByRole("button", { name: "Opslaan" }));

    expect(await within(zone).findByText(/Nu 8 van 10/)).toBeTruthy();
  });

  it("kiest 'Ander doel kiezen' voor het volledige zetmoment, niet voor inline herscoren", () => {
    patchDomainGoal("beweging", {
      situationId: "trap_lopen",
      ownWords: null,
      scores: [{ score: 4 }],
      mode: "verwerven",
    });
    renderBoth();
    const zone = screen.getByRole("region", { name: "Waar je naartoe werkt" });
    fireEvent.click(within(zone).getByRole("button", { name: /Bijwerken/ }));
    fireEvent.click(within(zone).getByRole("button", { name: /Ander doel kiezen/ }));

    expect(screen.getByRole("dialog", { name: /Je doel/ })).toBeTruthy();
  });
});

describe("Contextkolom — zone 2: wat jij hier koos", () => {
  it("laat wat je in het midden bewaart meteen hier verschijnen", () => {
    renderBoth();
    const keuzeZone = screen.getByRole("region", { name: "Mijn keuze op deze laag" });
    expect(keuzeZone.textContent).toContain("Hier koos je nog niets");

    saveRank1InMiddle();

    const layer = LADDER.layers.find((row) => row.id === FOCUS_LAYER)!;
    expect(keuzeZone.textContent).toContain(layer.actions[0]);
    // Weghalen kan hier ook — één regel, één hart, dezelfde bron.
    expect(
      within(keuzeZone).getByRole("button", { name: /klik om weg te halen/ }),
    ).toBeTruthy();
  });

  it("toont alleen de keuzes van de laag die je leest", () => {
    renderBoth();
    saveRank1InMiddle();

    selectLayerInMiddle(4);
    const keuzeZone = screen.getByRole("region", { name: "Mijn keuze op deze laag" });
    expect(keuzeZone.textContent).toContain("Hier koos je nog niets");
  });

  it("heeft geen afvink-affordance en geen tweede deur naar Mijn Dag", () => {
    renderBoth();
    const panelRegions = ["Waar je winst nu zit", "Mijn keuze op deze laag"].map((name) =>
      screen.getByRole("region", { name }),
    );

    for (const region of panelRegions) {
      expect(within(region).queryByRole("checkbox")).toBeNull();
      expect(within(region).queryByRole("button", { name: /Open Mijn Dag/ })).toBeNull();
      expect(within(region).queryByText(/afgevinkt|Gedaan vandaag/i)).toBeNull();
    }
  });
});

describe("Contextkolom — zone 3: het schap van dit domein", () => {
  it("draagt op een domeinscherm de deur naar het schap van dát domein", () => {
    renderBoth();
    const zone = screen.getByRole("region", { name: "Je keuze" });
    const link = within(zone).getByRole("link", { name: /Open je keuze/ });
    expect(link.getAttribute("href")).toContain("domein=beweging");
    // Lock L2: geen productnaam, geen prijs, geen oordeel op deze surface.
    expect(within(zone).queryByText(/€|Beste koop|Aanrader/)).toBeNull();
  });

  it("staat niet op de Kompas-home — daar is KompasOndersteuningTile de enige deur", () => {
    render(
      <DomainLadderFocusProvider>
        <LadderMomentsProvider>
          <VoortgangFavoritesProvider>
            <KompasContextSpine
              domain="beweging"
              openLayerId={null}
              data={data()}
              model={model()}
              todayActionDone={false}
              domainScreenOpen={false}
            />
          </VoortgangFavoritesProvider>
        </LadderMomentsProvider>
      </DomainLadderFocusProvider>,
    );
    expect(screen.queryByRole("region", { name: "Je schap" })).toBeNull();
  });

  it("zegt op stress waaróm er geen schap is, in plaats van niets te tonen", () => {
    render(
      <DomainLadderFocusProvider>
        <LadderMomentsProvider>
          <VoortgangFavoritesProvider>
            <KompasContextSpine
              domain="stress"
              openLayerId={null}
              data={data()}
              model={model()}
              todayActionDone={false}
              domainScreenOpen
            />
          </VoortgangFavoritesProvider>
        </LadderMomentsProvider>
      </DomainLadderFocusProvider>,
    );
    const zone = screen.getByRole("region", { name: "Geen aanbod op dit domein" });
    expect(zone.textContent).toContain("Bij stress is ons antwoord leefstijl");
    expect(within(zone).queryByRole("link")).toBeNull();
  });
});
