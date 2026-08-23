// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AgendaRhythmPanel from "@/components/dashboard/agenda/AgendaRhythmPanel";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";

function stubFavorites(items: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ items }), { status: 200 })),
  );
}

function renderPanel() {
  return render(
    <VoortgangFavoritesProvider>
      <AgendaRhythmPanel />
    </VoortgangFavoritesProvider>,
  );
}

describe("AgendaRhythmPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rendert niets zonder gekozen cadans-acties", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          items: [
            {
              id: "laag-beweging-p2-kracht",
              title: "Twee krachtsessies per week.",
              kind: "activiteit",
              domain: "beweging",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { container } = renderPanel();

    // Wacht de hydratatie af, dan staat vast dat er niets bijkomt.
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("toont alleen de gekozen acties die een terugkerend ritme zijn, niet de rest", async () => {
    stubFavorites([
      {
        id: "laag-beweging-p1-onderbreek",
        title: "Onderbreek elk werkuur twee minuten — staan is genoeg.",
        kind: "activiteit",
        domain: "beweging",
      },
      {
        id: "laag-beweging-p2-kracht",
        title: "Twee krachtsessies per week, vijf oefeningen, hele lichaam.",
        kind: "activiteit",
        domain: "beweging",
      },
      { id: "magnesium", title: "Magnesium glycinaat", kind: "supplement", domain: "slaap" },
    ]);
    renderPanel();

    expect(
      await screen.findByText("Onderbreek elk werkuur twee minuten — staan is genoeg."),
    ).toBeTruthy();
    expect(screen.getByText("Doorlopend vandaag")).toBeTruthy();
    expect(
      screen.queryByText("Twee krachtsessies per week, vijf oefeningen, hele lichaam."),
    ).toBeNull();
    expect(screen.queryByText("Magnesium glycinaat")).toBeNull();
  });

  it("laat de gekozen cadans-actie weer weghalen met het hartje", async () => {
    stubFavorites([
      {
        id: "laag-stress-p3-sta-op",
        title: "Sta na elk uur achter elkaar werken even op en loop 2 minuten.",
        kind: "activiteit",
        domain: "stress",
      },
    ]);
    renderPanel();

    const knop = await screen.findByRole("button", { name: /klik om weg te halen/ });
    expect(knop).toBeTruthy();
  });

  it("toont ook een niet-cadans favoriet met een actief ingestelde herinnering, met domeinlabel", async () => {
    stubFavorites([
      {
        id: "laag-slaap-p2-magnesium",
        title: "Magnesium glycinaat",
        kind: "supplement",
        domain: "slaap",
        reminderStartTime: "21:30",
        alertEnabled: true,
      },
    ]);
    renderPanel();

    expect(await screen.findByText("Magnesium glycinaat")).toBeTruthy();
    expect(screen.getByText("Slaap")).toBeTruthy();
  });

  it("laat een favoriet zonder cadans-titel én zonder ingestelde herinnering weg", async () => {
    stubFavorites([
      {
        id: "laag-slaap-p2-magnesium",
        title: "Magnesium glycinaat",
        kind: "supplement",
        domain: "slaap",
      },
    ]);
    const { container } = renderPanel();

    await waitFor(() => expect(container.firstChild).toBeNull());
  });
});
