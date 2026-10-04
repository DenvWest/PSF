/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

const rijen: VoedingswaardeRij[] = [
  { veld: "calciumMg", label: "Calcium", unit: "mg", ri: 800, waarde: 400, aandeel: 0.5 },
  { veld: "sodiumMg", label: "Natrium", unit: "mg", ri: null, waarde: 1200, aandeel: null },
  { veld: "ironMg", label: "IJzer", unit: "mg", ri: 14, waarde: null, aandeel: null },
];

async function laad(stoffen: string[]) {
  vi.mocked(fetch).mockImplementationOnce(() =>
    Promise.resolve(new Response(JSON.stringify({ stoffen }), { status: 200 })),
  );
  vi.resetModules();
  const { default: OokGevolgd } = await import("@/components/dashboard/dagboek/DagboekOokGevolgd");
  return OokGevolgd;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DagboekOokGevolgd", () => {
  it("toont alleen gevolgde stoffen, in de gekozen volgorde, met % van de RI", async () => {
    const OokGevolgd = await laad(["calciumMg", "sodiumMg"]);
    render(<OokGevolgd rijen={rijen} onKiesStof={vi.fn()} />);
    expect(await screen.findByText("50%")).toBeTruthy();
    expect(screen.getByText("Natrium")).toBeTruthy();
    expect(screen.queryByText("IJzer")).toBeNull();
  });

  it("opent rijkste bronnen voor een stof die er een lijst voor heeft", async () => {
    const onKiesStof = vi.fn();
    const OokGevolgd = await laad(["calciumMg", "sodiumMg"]);
    render(<OokGevolgd rijen={rijen} onKiesStof={onKiesStof} />);
    fireEvent.click(await screen.findByRole("button", { name: "Calcium: rijkste bronnen" }));
    expect(onKiesStof).toHaveBeenCalledWith("calciumMg");
    expect(screen.queryByRole("button", { name: /Natrium/ })).toBeNull();
  });

  it("nodigt uit om te volgen als er nog niets gevolgd wordt, en klapt de kiezer open", async () => {
    const OokGevolgd = await laad([]);
    render(<OokGevolgd rijen={rijen} onKiesStof={vi.fn()} />);
    const plus = await screen.findByRole("button", { name: /Volg ook vezels/ });
    fireEvent.click(plus);
    expect(screen.getByRole("list", { name: "Stoffen om te volgen" })).toBeTruthy();
  });
});
