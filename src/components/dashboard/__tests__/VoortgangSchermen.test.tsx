// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VoortgangHub from "@/components/dashboard/VoortgangHub";
import type { DashboardModel, PillarId, VoortgangScreen } from "@/types/dashboard";

/**
 * De ruil van 27 augustus, van binnenuit gezien: het schap is Voortgang uit
 * (het is de Keuze-tab in de hoofdnavigatie geworden) en Hermeting is Voortgang
 * ín — als scherm naast de meetreeksen die het voedt, in plaats van als vierde
 * tabblad dat 29 van de 30 dagen niets te zeggen had.
 *
 * Deze test legt de twee kanten daarvan vast: `screen=hermeting` bestaat, en
 * `screen=schap` (legacy bookmark) rendert hier géén schap meer.
 */

vi.mock("@/components/dashboard/voortgang/VoortgangHubScroll", () => ({
  default: () => <div data-testid="hub">hub</div>,
}));

vi.mock("@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub", () => ({
  default: () => <div data-testid="keuzehub">keuzehub</div>,
}));

vi.mock("@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm", () => ({
  default: ({ domain }: { domain: PillarId }) => <div data-testid="domein">domein:{domain}</div>,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const model = { priority: { id: "beweging", label: "Beweging" } } as DashboardModel;

const onScreenChange = vi.fn();
const onGoKeuze = vi.fn();

function renderHub(
  screenId: VoortgangScreen,
  opts: { leefstijlprofielDomein?: PillarId | null } = {},
) {
  return render(
    <VoortgangHub
      model={model}
      tab="voortgang"
      screen={screenId}
      leefstijlprofielDomein={opts.leefstijlprofielDomein ?? null}
      leefstijlprofielAdviesExtra={null}
      hermetingSlot={<div data-testid="hermeting">hermeting</div>}
      onScreenChange={onScreenChange}
      onPrefUpdated={vi.fn()}
      onGoAgenda={vi.fn()}
      onGoKeuze={onGoKeuze}
    />,
  );
}

beforeEach(() => {
  onScreenChange.mockClear();
  onGoKeuze.mockClear();
});

describe("Voortgang-schermen na de ruil van 27 augustus", () => {
  it("draagt de hermeting als eigen scherm binnen Voortgang", () => {
    renderHub("hermeting");
    expect(screen.getByTestId("hermeting")).toBeTruthy();
    expect(screen.queryByTestId("hub")).toBeNull();
  });

  it("rendert geen schap meer — een oude `screen=schap` valt terug op de hub", () => {
    renderHub("schap");
    expect(screen.getByTestId("hub")).toBeTruthy();
  });

  it("houdt Overzicht als eerste scherm", () => {
    renderHub("hub");
    expect(screen.getByTestId("hub")).toBeTruthy();
  });

  it("opent het domeinscherm van het leefstijlprofiel met zijn domein", () => {
    renderHub("leefstijlprofiel", { leefstijlprofielDomein: "slaap" });
    expect(screen.getByTestId("domein").textContent).toBe("domein:slaap");
  });

  it("draagt zelf geen navigatie — die zit in de rail en de topnav", () => {
    renderHub("hub");
    expect(screen.queryByRole("navigation", { name: /Voortgang/ })).toBeNull();
  });
});
