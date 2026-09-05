// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VerhoudingTabel from "@/components/nutrition/VerhoudingTabel";
import type { NutritionFactRow } from "@/lib/nutrition-ladder";

const trackEvent = vi.fn();
const clarityTag = vi.fn();

vi.mock("@/lib/ga4", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/clarity", () => ({
  clarityTag: (...args: unknown[]) => clarityTag(...args),
}));

const RUIMTE: NutritionFactRow = {
  key: "plantbasis",
  label: "Plantbasis",
  layer: 1,
  cluster: "C4",
  whyLine: "Vezels, kalium en magnesium komen hier in één keer vandaan.",
  answerLabel: "2 porties per dag",
  status: "below",
  exemption: null,
  benchmarkLabel: "5 porties per dag",
  benchmarkSource: "Gezondheidsraad",
};

const GOED: NutritionFactRow = {
  key: "bewerkingsgraad",
  label: "Bewerkingsgraad",
  layer: 2,
  cluster: "C5",
  whyLine: "De vorm waarin je eet, los van suiker en zout apart.",
  answerLabel: "Zelden kant-en-klaar",
  status: "meets",
  exemption: null,
  benchmarkLabel: "Zelden kant-en-klaar als standaardkeuze",
  benchmarkSource: "Monteiro 2019",
};

/** Geen richtlijn om naast te leggen — krijgt bewust geen kleur en geen balk. */
const ZONDER_LAT: NutritionFactRow = {
  key: "visbron",
  label: "Vis",
  layer: 2,
  cluster: "C5",
  whyLine: "Je eigen ijkpunt telt hier zwaarder dan een populatiegemiddelde.",
  answerLabel: "Niet van toepassing",
  status: "own",
  exemption: "opt-out",
};

describe("VerhoudingTabel", () => {
  beforeEach(() => {
    trackEvent.mockClear();
    clarityTag.mockClear();
  });

  it("toont het statusoordeel als tekst, niet alleen als kleur", () => {
    render(<VerhoudingTabel rijen={[RUIMTE]} surface="dashboard" />);
    // WCAG 1.4.1: de balk mag de enige drager van de betekenis niet zijn.
    expect(screen.getAllByText("hier zit je ruimte").length).toBeGreaterThan(0);
  });

  it("zet jouw antwoord en de lat als uiteinden van één schaal", () => {
    render(<VerhoudingTabel rijen={[RUIMTE]} surface="dashboard" />);
    expect(screen.getByText("jij: 2 porties per dag")).toBeTruthy();
    expect(screen.getByText("de lat: 5 porties per dag")).toBeTruthy();
  });

  it("geeft een rij zonder richtlijn geen balk", () => {
    const { container } = render(
      <VerhoudingTabel rijen={[ZONDER_LAT]} surface="dashboard" />,
    );
    // De marker is het enige element met een ring; zonder lat is er geen schaal.
    expect(container.querySelectorAll(".ring-2")).toHaveLength(0);
  });

  it("geeft een rij met richtlijn wel een balk met marker", () => {
    const { container } = render(
      <VerhoudingTabel rijen={[RUIMTE]} surface="dashboard" />,
    );
    expect(container.querySelectorAll(".ring-2")).toHaveLength(1);
  });

  it("toont de uitgang alleen als er ruimte is", () => {
    const onGoAanvullen = vi.fn();
    render(
      <VerhoudingTabel
        rijen={[GOED]}
        surface="dashboard"
        onGoAanvullen={onGoAanvullen}
      />,
    );
    expect(screen.queryByText(/Kijk of aanvullen zin heeft/)).toBeNull();
  });

  it("telt de ruimte over alle rijen en meldt de klik", () => {
    const onGoAanvullen = vi.fn();
    render(
      <VerhoudingTabel
        rijen={[RUIMTE, GOED, ZONDER_LAT]}
        surface="dashboard"
        onGoAanvullen={onGoAanvullen}
      />,
    );
    expect(screen.getByText(/Eén onderdeel met ruimte/)).toBeTruthy();

    fireEvent.click(screen.getByText(/Kijk of aanvullen zin heeft/));
    expect(onGoAanvullen).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("nutrition_verhouding_cta_click", {
      surface: "dashboard",
      rood: 1,
    });
  });

  it("laat de uitgang weg zonder handler, ook met ruimte", () => {
    render(<VerhoudingTabel rijen={[RUIMTE]} surface="dashboard" />);
    expect(screen.queryByText(/Kijk of aanvullen zin heeft/)).toBeNull();
  });

  it("is in compacte vorm alleen een tabel, zonder inleiding of CTA", () => {
    render(
      <VerhoudingTabel rijen={[RUIMTE, GOED]} surface="dashboard" compact titel="Voedingsstatus" />,
    );
    expect(screen.getByRole("table", { name: "Voedingsstatus" })).toBeTruthy();
    expect(screen.getByText("Plantbasis")).toBeTruthy();
    expect(screen.getByText("2 porties per dag")).toBeTruthy();
    expect(screen.getByText("5 porties per dag")).toBeTruthy();
    expect(screen.queryByText("hier zit je ruimte")).toBeNull();
    expect(screen.queryByText(/Uit je voedingscheck/)).toBeNull();
    expect(screen.queryByText(/Kijk of aanvullen zin heeft/)).toBeNull();
  });
});
