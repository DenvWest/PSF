// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import KompasOndersteuningTile from "@/components/dashboard/kompas/KompasOndersteuningTile";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

function model(priority: PillarId = "beweging"): DashboardModel {
  return { priority: { id: priority } } as unknown as DashboardModel;
}

function data(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    nutritionIntake: { items: [{ label: "x" }] },
    supplementVerdicts: [
      {
        id: "id-magnesium",
        ingredientKey: "magnesium",
        verdict: "kopen",
        reasonKey: "trigger_matched",
        rulesVersion: "1.6.0",
        nextReviewAt: null,
        createdAt: "2026-08-16T00:00:00.000Z",
        supersededAt: null,
        basedOn: null,
      },
    ],
    ...overrides,
  } as unknown as DashboardData;
}

describe("KompasOndersteuningTile — geen product op de dagelijkse surface", () => {
  it("toont nooit een productnaam, oordeel-label of vergelijkingslink", () => {
    render(<KompasOndersteuningTile model={model()} data={data()} onGoVoortgang={() => {}} />);
    expect(screen.queryByText("Magnesium")).toBeNull();
    expect(screen.queryByText("Aanvullen")).toBeNull();
    expect(screen.queryByText("Bekijk de vergelijking")).toBeNull();
  });

  it("wijst zonder voedingscheck naar de check, niet naar een oordeel", () => {
    render(
      <KompasOndersteuningTile
        model={model()}
        data={data({ nutritionIntake: null })}
        onGoVoortgang={() => {}}
      />,
    );
    expect(screen.getByText("Doe je voedingscheck →")).toBeTruthy();
    expect(screen.queryByText("Maak een keuze")).toBeNull();
  });
});

describe("KompasOndersteuningTile — de deur op de home (N1)", () => {
  it("draagt één deur, label-only, naar het schap van je prioriteitsdomein", () => {
    render(<KompasOndersteuningTile model={model("beweging")} data={data()} onGoVoortgang={() => {}} />);
    const deur = screen.getByRole("link", { name: /Maak een keuze/ });
    expect(deur.getAttribute("href")).toBe(
      "/dashboard?tab=voortgang&screen=favorieten&fav=beweging&schap=producten",
    );
    // Eén deur: de tweede route naar het oordeel verdwijnt zodra het schap er is.
    expect(screen.queryByText("Bekijk je oordeel op Voortgang")).toBeNull();
  });

  it("draagt diezelfde deur op slaap, sinds het schap daar bestaat (P3)", () => {
    render(<KompasOndersteuningTile model={model("slaap")} data={data()} onGoVoortgang={() => {}} />);
    const deur = screen.getByRole("link", { name: /Maak een keuze/ });
    expect(deur.getAttribute("href")).toBe(
      "/dashboard?tab=voortgang&screen=favorieten&fav=slaap&schap=producten",
    );
  });

  it("houdt domeinen zonder eigen schap op de route naar Voortgang", () => {
    // Stress (`lifestyle_first`) en verbinding (structureel) krijgen geen deur:
    // geen schap, dus geen aanbod — ook niet als label.
    render(<KompasOndersteuningTile model={model("stress")} data={data()} onGoVoortgang={() => {}} />);
    expect(screen.queryByText("Maak een keuze")).toBeNull();
    expect(screen.getByText("Bekijk je oordeel op Voortgang")).toBeTruthy();

    render(
      <KompasOndersteuningTile model={model("verbinding")} data={data()} onGoVoortgang={() => {}} />,
    );
    expect(screen.queryByText("Maak een keuze")).toBeNull();
  });
});
