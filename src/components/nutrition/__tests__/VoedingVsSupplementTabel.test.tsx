// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import VoedingVsSupplementTabel from "@/components/nutrition/VoedingVsSupplementTabel";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

function rij(
  overrides: Partial<NutrientRouteStatus> = {},
): NutrientRouteStatus {
  return {
    nutrient: "omega3",
    label: "Omega-3",
    route: nutrientRoute("omega3"),
    status: "gap",
    answerLabel: "Nooit",
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: false,
    doorReasonNl: "Eerst meer vette vis.",
    comparisonPath: "/beste/omega-3-supplement",
    ...overrides,
  };
}

describe("VoedingVsSupplementTabel", () => {
  it("draagt zijn eigen kop met de terugweg erin", () => {
    const onBack = vi.fn();
    render(
      <VoedingVsSupplementTabel
        statuses={[rij()]}
        surface="test"
        gateOpen={false}
        onBack={onBack}
      />,
    );

    expect(screen.getByRole("heading", { name: "Aanvullen" })).toBeTruthy();
    const kruimels = screen.getByRole("navigation", { name: "Kruimelpad" });
    fireEvent.click(within(kruimels).getByRole("button", { name: /Overzicht/ }));
    expect(onBack).toHaveBeenCalled();
  });

  it("draagt geen voetregel die de kolommen herhaalt", () => {
    render(
      <VoedingVsSupplementTabel
        statuses={[rij()]}
        surface="test"
        gateOpen={false}
      />,
    );

    expect(screen.queryByText(/Eerst je bord, dan het potje/)).toBeNull();
  });

  it("houdt de vergelijk-link achter een open deur", () => {
    render(
      <VoedingVsSupplementTabel
        statuses={[
          rij({
            supplementDoorOpen: true,
            doorReasonNl: "Je bord dekt dit niet meer.",
          }),
        ]}
        surface="test"
        gateOpen
      />,
    );

    const link = screen.getByRole("link", { name: /Vergelijk producten/ });
    expect(link.getAttribute("href")).toBe("/beste/omega-3-supplement");
  });

  it("houdt de vergelijk-link weg als de poort dicht is, ook bij een open deur", () => {
    render(
      <VoedingVsSupplementTabel
        statuses={[rij({ supplementDoorOpen: true })]}
        surface="test"
        gateOpen={false}
        gateReden="Eerst je voedingsbasis."
      />,
    );

    expect(screen.queryByRole("link", { name: /Vergelijk producten/ })).toBeNull();
    expect(screen.getByText("Eerst je voedingsbasis.")).toBeTruthy();
  });
});
