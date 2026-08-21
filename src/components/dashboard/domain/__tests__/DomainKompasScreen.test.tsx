// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DomainKompasScreen from "@/components/dashboard/domain/DomainKompasScreen";
import { DomainLadderFocusProvider } from "@/lib/domain-ladder-focus-context";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

function model(): DashboardModel {
  return {
    scores: { slaap: 58, beweging: 71 },
    trend: { slaap: [49, 52, 51, 54, 56, 58], beweging: [64, 66, 68, 69, 70, 71] },
  } as unknown as DashboardModel;
}

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

function renderScreen(domain: PillarId, dashboardData?: DashboardData) {
  return render(
    <DomainLadderFocusProvider>
      <LadderMomentsProvider>
        <VoortgangFavoritesProvider>
          <DomainKompasScreen
            domain={domain}
            model={model()}
            data={dashboardData}
            onGoAgenda={() => {}}
            onGoVoortgangDomein={() => {}}
          />
        </VoortgangFavoritesProvider>
      </LadderMomentsProvider>
    </DomainLadderFocusProvider>,
  );
}

beforeEach(() => {
  // `KompasDomainGauge` vraagt naar prefers-reduced-motion; jsdom levert geen
  // matchMedia. Stille stub, want het scherm draait er niet op.
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

describe("DomainKompasScreen — slaap draagt hetzelfde scherm als beweging", () => {
  it("draagt de domeinnaam als enige h1, met stand en conclusiezin", () => {
    renderScreen("slaap", data());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Slaap");
    expect(screen.queryByText(/gemeten 2 dagen geleden/)).not.toBeNull();
    expect(
      screen.queryByText("Je gunt jezelf structureel te weinig tijd in bed."),
    ).not.toBeNull();
  });

  it("opent op de winst-laag uit de slaapcheck en toont de staat in tekst", () => {
    renderScreen("slaap", data());
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    const winst = within(ladder).getByRole("button", { name: /Slaapgelegenheid/ });
    expect(winst.getAttribute("aria-pressed")).toBe("true");
    expect(within(ladder).queryByText("Grootste winst")).not.toBeNull();
  });

  it("laat een andere laag aanklikken en biedt de weg terug naar de winst-laag", () => {
    renderScreen("slaap", data());
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    fireEvent.click(within(ladder).getByRole("button", { name: /Slaapomgeving/ }));
    expect(screen.queryByText(/Jouw grootste winst zit op prioriteit/)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Terug daarheen" }));
    expect(screen.queryByText(/Jouw grootste winst zit op prioriteit/)).toBeNull();
  });

  it("koppelt elke gratis optie aan Mijn keuze én aan Mijn Dag", () => {
    renderScreen("slaap", data());
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Zet op Mijn Dag/ }).length).toBeGreaterThan(0);
  });

  it("sluit af met de eigen CTA-copy van slaap, niet die van beweging", () => {
    renderScreen("slaap", data());
    expect(screen.queryByRole("button", { name: /Open je slaapbeeld/ })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vanavond" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /beweegbeeld/ })).toBeNull();
  });

  it("zonder slaapcheck: ladder zonder oordeel, en het scherm blijft bruikbaar", () => {
    renderScreen("slaap", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.queryByText(/nog geen slaapcheck/)).not.toBeNull();
    expect(screen.queryByText(/Van basis naar finetunen/)).not.toBeNull();
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    expect(within(ladder).queryByText("Grootste winst")).toBeNull();
    expect(
      within(ladder).getByRole("button", { name: /Slaapgelegenheid/ }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("beweging houdt zijn eigen copy op hetzelfde scherm", () => {
    renderScreen("beweging", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Beweging");
    expect(screen.queryByText(/nog geen beweegcheck/)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Open je beweegbeeld/ })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vandaag" })).not.toBeNull();
  });

  it("voeding heeft nog geen check-uitlezing: ladder zonder oordeel, eigen copy", () => {
    renderScreen("voeding", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Voeding");
    expect(screen.queryByText(/nog geen voedingscheck/)).not.toBeNull();
    expect(screen.queryByText(/Van onder naar boven/)).not.toBeNull();
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    expect(within(ladder).queryByText("Grootste winst")).toBeNull();
    expect(
      within(ladder).getByRole("button", { name: /Je eetbasis/ }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.queryByRole("button", { name: /Open je voedingsbeeld/ })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vandaag" })).not.toBeNull();
  });
});
