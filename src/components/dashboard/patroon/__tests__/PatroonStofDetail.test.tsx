/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonStofDetail from "@/components/dashboard/patroon/PatroonStofDetail";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { bouwPeriodeOverzicht, weekDatums } from "@/lib/nutrition-weekoverzicht";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({ useKernstofNormen: () => STANDAARD_NORMEN }));

afterEach(cleanup);

const MAGNESIUM = bouwPeriodeOverzicht([], weekDatums("2026-09-28"), STANDAARD_NORMEN).rijen.find(
  (rij) => rij.nutrient === "magnesium",
)!;

describe("PatroonStofDetail", () => {
  it("noemt norm, doelgroep en bron voluit, en zegt dat het geen diagnose is", () => {
    render(
      <PatroonStofDetail
        rij={MAGNESIUM}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={0}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    expect(screen.getByText(/Voedingsnormen vitamines en mineralen voor volwassenen/)).toBeTruthy();
    expect(screen.getByText("volwassenen 18+")).toBeTruthy();
    expect(screen.getByText(/eronder zitten is geen\s+tekort/)).toBeTruthy();
  });

  it("toont voedingsbronnen vóór de supplementvergelijking", () => {
    render(
      <PatroonStofDetail
        rij={MAGNESIUM}
        periode={{ van: "2026-09-28", tot: "2026-10-04" }}
        dagenGeregistreerd={0}
        bronnen={[]}
        onTerug={() => {}}
      />,
    );
    const voeding = screen.getByText(/Rijkste voedingsbronnen/);
    const supplement = screen.getByRole("link", { name: /Supplementen met Magnesium vergelijken/ });
    expect(voeding.compareDocumentPosition(supplement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(supplement.getAttribute("href")).toBe(MAGNESIUM.comparisonPath);
  });
});
