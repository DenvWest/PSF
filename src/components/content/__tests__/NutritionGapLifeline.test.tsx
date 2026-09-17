// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NutritionGapLifeline from "@/components/content/NutritionGapLifeline";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn(), GA4_EVENTS: {} }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

describe("NutritionGapLifeline", () => {
  it("verschuift de leeftijd en de bijbehorende caption", () => {
    render(<NutritionGapLifeline />);
    const slider = screen.getByRole("slider", { name: "Leeftijd" });
    expect(slider.getAttribute("aria-valuetext")).toBe("40 jaar");
    expect(
      screen.getByText(/B12-voorraad in de lever kan jaren meegaan/i),
    ).toBeTruthy();

    fireEvent.change(slider, { target: { value: "70" } });
    expect(slider.getAttribute("aria-valuetext")).toBe("70 jaar");
    expect(
      screen.getByText(/Nu telt wat je de jaren hiervoor wél of níét op je bord had/i),
    ).toBeTruthy();
  });
});
