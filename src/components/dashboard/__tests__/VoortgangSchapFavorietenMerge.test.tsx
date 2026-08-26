// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VoortgangHub from "@/components/dashboard/VoortgangHub";
import type { DashboardModel, PillarId, VoortgangScreen } from "@/types/dashboard";

/**
 * Favorieten en het schap waren tot 20 augustus één `screen`-waarde met twee
 * schermen erachter, en zijn toen gesplitst in `screen=schap` (aanbod van één
 * domein) en `screen=favorieten` (bewaarde lijst, domein-overstijgend). Sinds
 * 22 augustus is die tweede vorm opgeheven: elke ingang naar "wat je koos"
 * wijst nu naar de Favorieten-tab van het schap. Deze test legt vast dat er
 * nog maar één scherm voor is; de navigatie ernaartoe woont sinds 26 augustus
 * buiten dit scherm (rail op md+, VoortgangTopNav eronder).
 */

vi.mock("@/components/dashboard/voortgang/SchapView", () => ({
  default: ({ domain }: { domain: PillarId }) => <div data-testid="schap">schap:{domain}</div>,
}));

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

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: [{ id: "a", title: "Magnesium", kind: "supplement", domain: "slaap" }],
    hydrated: true,
    isSaved: () => false,
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const model = { priority: { id: "beweging", label: "Beweging" } } as DashboardModel;

const onScreenChange = vi.fn();

function renderHub(
  screenId: VoortgangScreen,
  opts: { schapDomein?: PillarId | null; leefstijlprofielDomein?: PillarId | null } = {},
) {
  return render(
    <VoortgangHub
      model={model}
      tab="voortgang"
      screen={screenId}
      leefstijlprofielDomein={opts.leefstijlprofielDomein ?? null}
      schapDomein={opts.schapDomein ?? null}
      schapTab={null}
      leefstijlprofielAdviesExtra={null}
      onScreenChange={onScreenChange}
      onPrefUpdated={vi.fn()}
      onGoAgenda={vi.fn()}
      onGoHermeting={vi.fn()}
    />,
  );
}

beforeEach(() => {
  onScreenChange.mockClear();
});

describe("Voortgang — het schap draagt het archief, geen los Favorieten-scherm meer", () => {
  it("toont op screen=schap het aanbod van dat domein", () => {
    renderHub("schap", { schapDomein: "beweging" });
    expect(screen.getByTestId("schap").textContent).toBe("schap:beweging");
  });

  it("valt terug op de hub als screen=schap geen domein mét schap draagt", () => {
    renderHub("schap", { schapDomein: "stress" });
    expect(screen.queryByTestId("schap")).toBeNull();
    expect(screen.getByTestId("hub")).toBeTruthy();
  });

  it("draagt zelf geen navigatie meer — die zit in de rail en de topnav", () => {
    renderHub("schap", { schapDomein: "beweging" });
    expect(screen.queryByRole("button", { name: /Favorieten/ })).toBeNull();
    expect(screen.queryByRole("navigation", { name: /Voortgang/ })).toBeNull();
  });
});
