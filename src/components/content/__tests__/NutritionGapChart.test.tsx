// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NutritionGapChart from "@/components/content/NutritionGapChart";
import { GA4_EVENTS } from "@/lib/ga4";

const trackEvent = vi.hoisted(() => vi.fn());
const clarityTag = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ga4", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ga4")>("@/lib/ga4");
  return { ...actual, trackEvent };
});
vi.mock("@/lib/clarity", () => ({ clarityTag }));

afterEach(() => {
  trackEvent.mockClear();
  clarityTag.mockClear();
});

describe("NutritionGapChart", () => {
  it("start op plantaardig zonder aandacht en toont B12 als chronisch-tekortpanel", () => {
    render(<NutritionGapChart />);
    expect(
      screen
        .getByRole("button", { name: "Plantaardig, zonder extra aandacht" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("heading", { name: "Vitamine B12" })).toBeTruthy();
    expect(
      screen.getByText(/Zit vrijwel alleen in dierlijke producten/i),
    ).toBeTruthy();
  });

  it("wisselt patroon en meet de keuze", () => {
    render(<NutritionGapChart />);
    fireEvent.click(screen.getByRole("button", { name: "Gemengd eten" }));
    expect(trackEvent).toHaveBeenCalledWith(GA4_EVENTS.VOEDINGSTEKORT_PATROON, {
      patroon: "mixed",
    });
    expect(clarityTag).toHaveBeenCalledWith("voedingstekort_patroon", "mixed");
    expect(
      screen.getByText(/B12 en calcium zitten vaak wel/i),
    ).toBeTruthy();
  });

  it("opent een andere stof en meet de klik", () => {
    render(<NutritionGapChart />);
    fireEvent.click(screen.getByRole("button", { name: /Omega-3/ }));
    expect(trackEvent).toHaveBeenCalledWith(GA4_EVENTS.VOEDINGSTEKORT_STOF, {
      stof: "omega3",
    });
    expect(screen.getByRole("heading", { name: "Omega-3 (EPA/DHA)" })).toBeTruthy();
    expect(screen.getByText(/Algenolie is de directe plantaardige bron/i)).toBeTruthy();
  });
});
