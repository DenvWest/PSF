// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoortgangHub from "@/components/dashboard/VoortgangHub";
import type { DashboardModel, PillarId, VoortgangScreen } from "@/types/dashboard";

/**
 * Favorieten en het schap waren tot 20 augustus één `screen`-waarde met twee
 * schermen erachter. Welk scherm je kreeg hing af van of er toevallig een
 * domein in de URL stond: via de rail zag je je bewaarde lijst, via beweging
 * het aanbod — zelfde knop, zelfde naam, ander scherm. Deze test legt vast dat
 * het nu twee schermen met twee namen zijn.
 */

vi.mock("@/components/dashboard/voortgang/SchapView", () => ({
  default: ({ domain }: { domain: PillarId }) => <div data-testid="schap">schap:{domain}</div>,
}));

vi.mock("@/components/dashboard/voortgang/FavorietenView", () => ({
  default: () => <div data-testid="favorieten">favorieten</div>,
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
      overTijdExtra={null}
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

describe("Voortgang — schap en favorieten zijn twee schermen", () => {
  it("toont op screen=favorieten je bewaarde lijst, ook met een domein in beeld", () => {
    renderHub("favorieten", { leefstijlprofielDomein: "beweging" });
    expect(screen.getByTestId("favorieten")).toBeTruthy();
    expect(screen.queryByTestId("schap")).toBeNull();
  });

  it("toont op screen=schap het aanbod van dat domein", () => {
    renderHub("schap", { schapDomein: "beweging" });
    expect(screen.getByTestId("schap").textContent).toBe("schap:beweging");
    expect(screen.queryByTestId("favorieten")).toBeNull();
  });

  it("valt terug op de hub als screen=schap geen domein mét schap draagt", () => {
    renderHub("schap", { schapDomein: "stress" });
    expect(screen.queryByTestId("schap")).toBeNull();
    expect(screen.getByTestId("hub")).toBeTruthy();
  });

  it("stuurt de Favorieten-chip naar favorieten zonder domein", () => {
    renderHub("schap", { schapDomein: "beweging" });
    fireEvent.click(screen.getByRole("button", { name: /Favorieten/ }));
    expect(onScreenChange).toHaveBeenCalledWith("favorieten", { fav: null });
  });

  it("stuurt de Schap-chip naar het schap van het domein dat in beeld is", () => {
    renderHub("favorieten", { leefstijlprofielDomein: "slaap" });
    fireEvent.click(screen.getByRole("button", { name: /Schap/ }));
    expect(onScreenChange).toHaveBeenCalledWith("schap", { fav: "slaap" });
  });

  it("laat de Schap-chip weg als geen enkel domein in beeld een schap heeft", () => {
    const stressModel = { priority: { id: "stress", label: "Stress" } } as DashboardModel;
    render(
      <VoortgangHub
        model={stressModel}
        tab="voortgang"
        screen="favorieten"
        leefstijlprofielDomein={null}
        schapDomein={null}
        schapTab={null}
        leefstijlprofielAdviesExtra={null}
        overTijdExtra={null}
        onScreenChange={onScreenChange}
        onPrefUpdated={vi.fn()}
        onGoAgenda={vi.fn()}
        onGoHermeting={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /Schap/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Favorieten/ })).toBeTruthy();
  });
});
