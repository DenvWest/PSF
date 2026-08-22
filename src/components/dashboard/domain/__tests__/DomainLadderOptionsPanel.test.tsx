// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DomainLadderOptionsPanel from "@/components/dashboard/domain/DomainLadderOptionsPanel";
import { SLEEP_PRIORITY_LAYERS } from "@/data/sleep/lifestyle-priorities";
import { MOVEMENT_PRIORITY_LAYERS } from "@/data/movement/lifestyle-priorities";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import type { DashboardData } from "@/types/dashboard";

const SLEEP_SNAPSHOT = {
  date: "2026-08-18",
  headline: "Je gunt jezelf structureel te weinig tijd in bed.",
  focusLabel: "Slaapduur",
  focusDimension: null,
  answerLabel: "6 uur",
  focusStatement: "",
  implicationLine: "",
  focusLayer: 1,
  layerStates: { 1: "winst", 2: "watch", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
  kompasStatus: "",
  primaryAction: null,
  delta: null,
  factRows: [],
};

function data(overrides: Record<string, unknown> = {}): DashboardData {
  return {
    sleepCheckinSnapshot: SLEEP_SNAPSHOT,
    domainCheckDaysAgo: { slaap: 2 },
    ...overrides,
  } as unknown as DashboardData;
}

function renderPanel(
  props: { domain: "slaap" | "beweging"; layerId: number },
  dashboardData?: DashboardData,
) {
  return render(
    <LadderMomentsProvider>
      <VoortgangFavoritesProvider>
        <DomainLadderOptionsPanel
          domain={props.domain}
          layerId={props.layerId}
          data={dashboardData ?? data()}
        />
      </VoortgangFavoritesProvider>
    </LadderMomentsProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ items: [], blocks: [] }), { status: 200 })),
  );
});

describe("DomainLadderOptionsPanel — opties van de aangeklikte prioriteit", () => {
  it("draagt de prioriteit in de kop en alle acties van de laag", () => {
    renderPanel({ domain: "slaap", layerId: 1 });
    expect(screen.queryByText(/Prioriteit 1 · Slaapgelegenheid/)).not.toBeNull();
    expect(screen.queryByText("Grootste winst")).not.toBeNull();
    for (const action of SLEEP_PRIORITY_LAYERS[0].actions) {
      expect(screen.queryByText(action)).not.toBeNull();
    }
    expect(SLEEP_PRIORITY_LAYERS[0].actions).toHaveLength(3);
  });

  it("koppelt elke optie aan Mijn keuze én aan Mijn Dag", () => {
    renderPanel({ domain: "slaap", layerId: 1 });
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /Zet op Mijn Dag/ })).toHaveLength(3);
  });

  it("legt een lege laag uit in plaats van te verdwijnen", () => {
    renderPanel({ domain: "beweging", layerId: 6 }, data({ sleepCheckinSnapshot: null }));
    expect(screen.queryByText(/Prioriteit 6 ·/)).not.toBeNull();
    expect(screen.queryByText(/Of aanvullen aan de orde is/)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Zet bij Mijn keuze/ })).toBeNull();
  });

  it("zet geen tweede 'Mijn keuze op deze laag'-kaart naast de rijen", () => {
    renderPanel({ domain: "slaap", layerId: 1 });
    expect(screen.queryByText("Mijn keuze op deze laag")).toBeNull();
  });

  it("toont de acties van een andere laag als die aangeklikt is", () => {
    renderPanel({ domain: "slaap", layerId: 2 });
    expect(screen.queryByText(/Prioriteit 2 · Ritme & slaapgewoonten/)).not.toBeNull();
    for (const action of SLEEP_PRIORITY_LAYERS[1].actions) {
      expect(screen.queryByText(action)).not.toBeNull();
    }
    expect(screen.queryByText(SLEEP_PRIORITY_LAYERS[0].actions[0])).toBeNull();
  });

  it("blijft de bewegingsacties van P1 tonen, niet een verkorte lijst", () => {
    renderPanel({ domain: "beweging", layerId: 1 }, data({ sleepCheckinSnapshot: null }));
    expect(MOVEMENT_PRIORITY_LAYERS[0].actions).toHaveLength(3);
    for (const action of MOVEMENT_PRIORITY_LAYERS[0].actions) {
      expect(screen.queryByText(action)).not.toBeNull();
    }
  });
});
