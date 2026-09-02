// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoedingskwaliteitLaag from "@/components/nutrition/VoedingskwaliteitLaag";
import type { NutritionFactRow } from "@/lib/nutrition-ladder";

const trackEvent = vi.fn();
const clarityTag = vi.fn();

vi.mock("@/lib/ga4", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/clarity", () => ({
  clarityTag: (...args: unknown[]) => clarityTag(...args),
}));

const LAAG2: NutritionFactRow = {
  key: "bewerkingsgraad",
  label: "Bewerkingsgraad",
  layer: 2,
  cluster: "C5",
  whyLine: "De vorm waarin je eet, los van suiker en zout apart.",
  answerLabel: "Vaak kant-en-klaar",
  status: "below",
  exemption: null,
  benchmarkLabel: "Zelden kant-en-klaar als standaardkeuze",
  benchmarkSource: "Monteiro 2019",
};

const LAAG1: NutritionFactRow = {
  key: "plantbasis",
  label: "Plantbasis",
  layer: 1,
  cluster: "C4",
  whyLine: "Vezels, kalium en magnesium komen hier in één keer vandaan.",
  answerLabel: "2 porties per dag",
  status: "near",
  exemption: null,
};

describe("VoedingskwaliteitLaag", () => {
  beforeEach(() => {
    trackEvent.mockClear();
    clarityTag.mockClear();
  });

  it("opent de ranglijst zonder check, en de lege staat achter Jouw check", () => {
    render(<VoedingskwaliteitLaag rijen={[]} checkDatum={null} />);

    expect(screen.getByRole("button", { name: "Ranglijst" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByText(/Kwaliteit — wat er op je groente en fruit zit/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Jouw check" }));
    expect(screen.getByText("Dit komt uit je voedingscheck.")).toBeTruthy();
    const checkLink = screen.getByRole("link", { name: /Doe de voedingscheck/ });
    expect(checkLink.getAttribute("href")).toBe("/intake/voeding?from=dashboard");
    expect(trackEvent).toHaveBeenCalledWith("nutrition_kwaliteit_mode", {
      surface: "dashboard",
      mode: "check",
    });
    expect(clarityTag).toHaveBeenCalledWith("nutrition_kwaliteit_mode", "check");
  });

  it("opent jouw check als er laag-2-rijen zijn, en wisselt naar de ranglijst", () => {
    render(<VoedingskwaliteitLaag rijen={[LAAG1, LAAG2]} checkDatum="2 sep 2026" />);

    expect(screen.getByRole("button", { name: "Jouw check" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByText("Wat je check over kwaliteit zegt")).toBeTruthy();
    expect(screen.getByText("Bewerkingsgraad")).toBeTruthy();
    expect(screen.queryByText("Plantbasis")).toBeNull();
    expect(screen.getByText(/Uit je voedingscheck van 2 sep 2026/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ranglijst" }));
    expect(screen.getByText(/Kwaliteit — wat er op je groente en fruit zit/)).toBeTruthy();
    expect(screen.queryByText("Bewerkingsgraad")).toBeNull();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_kwaliteit_mode", {
      surface: "dashboard",
      mode: "ranglijst",
    });
  });

  it("meet de lege-check-CTA", () => {
    render(<VoedingskwaliteitLaag rijen={[]} checkDatum={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Jouw check" }));
    trackEvent.mockClear();
    const checkLink = screen.getByRole("link", { name: /Doe de voedingscheck/ });
    checkLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(checkLink);
    expect(trackEvent).toHaveBeenCalledWith("nutrition_kwaliteit_check_cta", {
      surface: "dashboard",
    });
  });
});
