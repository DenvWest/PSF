// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import VoedingsbasisOverzicht from "@/components/nutrition/VoedingsbasisOverzicht";
import { buildNutritionFactRows } from "@/lib/nutrition-ladder";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));

const report = {
  sliders: {
    vegetables: 2,
    fruit: 2,
    wholegrain: 2,
    meatLegumes: 2,
    dairy: 2,
    nutsSeedsLegumes: 1,
    oilyFish: 0,
  },
  preference: "none" as const,
  allergies: [] as string[],
};

function renderOverzicht() {
  const rijen = buildNutritionFactRows(report);
  return render(
    <VoedingsbasisOverzicht
      rijen={rijen}
      report={report}
      selfReport={nutritionReportFromAnswers(report.sliders)}
      surface="test"
    />,
  );
}

describe("VoedingsbasisOverzicht", () => {
  it("toont een meetbaan per categorie, met jouw antwoord en de richtlijn", () => {
    renderOverzicht();
    // Geen tabel meer: de vraag van deze laag is "waar zit mijn ruimte", en
    // dat beantwoordt een balk in één oogopslag waar een spreadsheet je liet
    // rekenen.
    expect(screen.queryByRole("table")).toBeNull();
    const banen = screen.getAllByRole("listitem");
    expect(banen.length).toBeGreaterThan(1);
    expect(screen.getByText("Groente")).toBeTruthy();
  });

  it("vat samen hoeveel categorieën ruimte laten zien", () => {
    renderOverzicht();
    // De samenvatting is een telling, geen uitleg van de vorm eronder.
    expect(screen.getByText(/met ruimte|op orde/)).toBeTruthy();
    expect(screen.getByText(/totaal/)).toBeTruthy();
  });

  it("zet de categorie met de meeste ruimte bovenaan", () => {
    renderOverzicht();
    const statussen = screen.getAllByText(/^(ruimte|bijna|op orde|eigen ijkpunt)$/);
    expect(statussen.length).toBeGreaterThan(1);
    // Ruimte eerst — dat is de sortering waar deze laag op draait.
    expect(statussen[0].textContent).toBe("ruimte");
  });

  it("klapt een categorie open en toont de bronnen erachter", () => {
    renderOverzicht();
    const knop = screen.getByRole("button", { name: /Noten/ });
    expect(knop.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(knop);

    expect(knop.getAttribute("aria-expanded")).toBe("true");
    const paneel = document.getElementById("voedingsbasis-detail-noten");
    expect(paneel).toBeTruthy();
    // De doordruk toont bron-, portie- en gehaltekolommen.
    expect(within(paneel as HTMLElement).getAllByText("Bron").length).toBeGreaterThan(0);
    expect(within(paneel as HTMLElement).getAllByText("Portie").length).toBeGreaterThan(0);
    expect(within(paneel as HTMLElement).getAllByText("Levert").length).toBeGreaterThan(0);
  });

  it("houdt één categorie tegelijk open", () => {
    renderOverzicht();
    const noten = screen.getByRole("button", { name: /Noten/ });
    const granen = screen.getByRole("button", { name: /Granen/ });

    fireEvent.click(noten);
    expect(noten.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(granen);
    expect(granen.getAttribute("aria-expanded")).toBe("true");
    expect(noten.getAttribute("aria-expanded")).toBe("false");
  });

  it("klapt weer dicht bij een tweede klik", () => {
    renderOverzicht();
    const knop = screen.getByRole("button", { name: /Noten/ });
    fireEvent.click(knop);
    fireEvent.click(knop);
    expect(knop.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("voedingsbasis-detail-noten")).toBeNull();
  });

  it("geeft een categorie zonder bronnen geen doordruk-knop", () => {
    renderOverzicht();
    // Suiker kent geen bronnenkeuze — daar minder je, dus geen knop.
    const suikerRij = screen.queryByRole("button", { name: /Suiker/ });
    expect(suikerRij).toBeNull();
  });

  it("valt terug op een uitnodiging als er geen check is", () => {
    render(<VoedingsbasisOverzicht rijen={[]} report={null} surface="test" />);
    expect(screen.getByText(/Doe de voedingscheck/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
