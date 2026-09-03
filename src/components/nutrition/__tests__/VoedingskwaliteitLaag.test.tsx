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

  it("toont de lege staat zonder check, met de ranglijst achter zijn knop", () => {
    render(<VoedingskwaliteitLaag rijen={[]} checkDatum={null} />);

    expect(screen.getByText("Dit komt uit je voedingscheck.")).toBeTruthy();
    const checkLink = screen.getByRole("link", { name: /Doe de voedingscheck/ });
    expect(checkLink.getAttribute("href")).toBe("/intake/voeding?from=dashboard");
  });

  it("zet jouw check bovenaan en houdt de ranglijst ingeklapt", () => {
    render(<VoedingskwaliteitLaag rijen={[LAAG1, LAAG2]} checkDatum="2 sep 2026" />);

    // Je eigen antwoorden openen de laag; de ranglijst is productkennis en
    // staat achter een knop.
    expect(screen.getByText("Wat je check over kwaliteit zegt")).toBeTruthy();
    expect(screen.getByText("Bewerkingsgraad")).toBeTruthy();
    // De laag-1-bronnen staan er nu bij: je kunt pas tussen groentesoorten
    // kiezen als je weet dat groente jouw knop is.
    expect(screen.getByText("Plantbasis")).toBeTruthy();
    expect(screen.queryByText(/Kwaliteit — wat er op je groente en fruit zit/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Ranglijst pesticide-residuen/ }));
    expect(screen.getByText(/Kwaliteit — wat er op je groente en fruit zit/)).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_kwaliteit_ranglijst", {
      surface: "dashboard",
      staat: "open",
    });
  });

  it("meet de lege-check-CTA", () => {
    render(<VoedingskwaliteitLaag rijen={[]} checkDatum={null} />);
    trackEvent.mockClear();
    const checkLink = screen.getByRole("link", { name: /Doe de voedingscheck/ });
    checkLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(checkLink);
    expect(trackEvent).toHaveBeenCalledWith("nutrition_kwaliteit_check_cta", {
      surface: "dashboard",
    });
  });
});
