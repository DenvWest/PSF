// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import KompasOndersteuningTile from "@/components/dashboard/kompas/KompasOndersteuningTile";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

function model(): DashboardModel {
  return {} as unknown as DashboardModel;
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

  it("draagt één label-only deur naar Voortgang", () => {
    render(<KompasOndersteuningTile model={model()} data={data()} onGoVoortgang={() => {}} />);
    expect(screen.getByText("Bekijk je oordeel op Voortgang")).toBeTruthy();
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
    expect(screen.queryByText("Bekijk je oordeel op Voortgang")).toBeNull();
  });
});
