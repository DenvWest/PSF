// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VoortgangHub from "@/components/dashboard/VoortgangHub";
import type { DashboardModel, VoortgangScreen } from "@/types/dashboard";

/**
 * De ruil van 27 augustus, van binnenuit gezien: het schap is Voortgang uit
 * (het is de Keuze-tab in de hoofdnavigatie geworden) en Hermeting is Voortgang
 * ín — als scherm naast "Je patroon", in plaats van als vierde tabblad dat 29
 * van de 30 dagen niets te zeggen had.
 *
 * Sinds 23 september kent Voortgang nog maar twee schermen: `hub` ("Je
 * patroon", met het voeding-tekortsysteem) en `hermeting`. Leefstijlprofiel —
 * de domeinhub — is opgeheven toen voeding het enige domein werd.
 */

vi.mock("@/components/dashboard/voortgang/VoortgangHubScroll", () => ({
  default: () => <div data-testid="hub">hub</div>,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const model = { priority: { id: "voeding", label: "Voeding" } } as DashboardModel;

const onScreenChange = vi.fn();
const onGoAgenda = vi.fn();

function renderHub(screenId: VoortgangScreen) {
  return render(
    <VoortgangHub
      model={model}
      tab="voortgang"
      screen={screenId}
      hermetingSlot={<div data-testid="hermeting">hermeting</div>}
      onScreenChange={onScreenChange}
      onGoAgenda={onGoAgenda}
    />,
  );
}

beforeEach(() => {
  onScreenChange.mockClear();
  onGoAgenda.mockClear();
});

describe("Voortgang-schermen na de domeinsnoei van 23 september", () => {
  it("draagt de hermeting als eigen scherm binnen Voortgang", () => {
    renderHub("hermeting");
    expect(screen.getByTestId("hermeting")).toBeTruthy();
    expect(screen.queryByTestId("hub")).toBeNull();
  });

  it("houdt Je patroon als eerste scherm", () => {
    renderHub("hub");
    expect(screen.getByTestId("hub")).toBeTruthy();
  });

  it("draagt zelf geen navigatie — die zit in de rail en de topnav", () => {
    renderHub("hub");
    expect(screen.queryByRole("navigation", { name: /Voortgang/ })).toBeNull();
  });
});
