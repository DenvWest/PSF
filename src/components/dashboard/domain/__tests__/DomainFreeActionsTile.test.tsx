// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DomainFreeActionsTile from "@/components/dashboard/domain/DomainFreeActionsTile";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";

const ACTIONS = [
  "Onderbreek elk werkuur twee minuten — staan is genoeg.",
  "Zet één verplaatsing per dag om naar lopen of fietsen.",
  "Neem één telefoongesprek per dag staand of wandelend.",
];

function renderTile(props: Partial<Parameters<typeof DomainFreeActionsTile>[0]> = {}) {
  return render(
    <VoortgangFavoritesProvider>
      <DomainFreeActionsTile
        domain="beweging"
        layerId={1}
        layerName="Dagelijks bewegen"
        actions={ACTIONS}
        surface="kompas_beweging"
        {...props}
      />
    </VoortgangFavoritesProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200 })),
  );
});

describe("DomainFreeActionsTile — N4: geen aanbod op een doe-surface", () => {
  it("rendert niets als de laag geen acties en geen uitleg heeft", () => {
    const { container } = renderTile({
      layerId: 5,
      layerName: "Geavanceerde training",
      actions: [],
    });
    expect(container.firstChild).toBeNull();
  });

  it("legt uit waarom er niets staat in plaats van te verdwijnen", () => {
    renderTile({
      layerId: 6,
      layerName: "Aanvullen",
      actions: [],
      emptyLine: "Of aanvullen aan de orde is, lees je in je beweegbeeld.",
    });
    expect(screen.queryByText(/Of aanvullen aan de orde is/)).not.toBeNull();
  });

  it("toont elke optie met een keuze-knop", () => {
    renderTile();
    for (const action of ACTIONS) {
      expect(screen.queryByText(action)).not.toBeNull();
    }
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ })).toHaveLength(3);
  });

  it("laat de moment-knop weg zonder agenda-provider", () => {
    renderTile();
    expect(screen.queryByRole("button", { name: /Zet op Mijn Dag/ })).toBeNull();
  });

  it("noemt geen merk, prijs of oordeel", () => {
    renderTile();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/€|Aanrader|Alleen als|Nu niet/);
    expect(screen.queryByText(/Hier verdienen we niets aan/)).not.toBeNull();
  });

  it("werkt op elk domein met een ladder, niet alleen beweging", () => {
    renderTile({ domain: "slaap", layerId: 2, layerName: "Ritme & slaapgewoonten" });
    expect(screen.queryByText(/Prioriteit 2 · Ritme & slaapgewoonten/)).not.toBeNull();
  });

  it("toont de staatlabel naast de kop wanneer de check die heeft", () => {
    renderTile({ isRecommended: true, stateLabel: "Grootste winst" });
    expect(screen.queryByText("Grootste winst")).not.toBeNull();
    expect(screen.queryByText(/Dit is de laag waar je winst nu zit/)).not.toBeNull();
  });
});
