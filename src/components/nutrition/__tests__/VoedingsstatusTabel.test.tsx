// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import VoedingsstatusTabel from "@/components/nutrition/VoedingsstatusTabel";
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
    // De twee kwaliteitsvragen (laag 2). Zonder deze sliders bouwt de engine
    // die rijen niet, en dan bewijst de test de samenvoeging niet.
    sugaryDrinks: 5,
    ultraProcessed: 1,
  },
  preference: "none" as const,
  allergies: [] as string[],
};

function renderTabel() {
  const rijen = buildNutritionFactRows(report);
  return render(
    <VoedingsstatusTabel
      rijen={rijen}
      report={report}
      selfReport={nutritionReportFromAnswers(report.sliders)}
      surface="test"
    />,
  );
}

describe("VoedingsstatusTabel", () => {
  it("zet de voedselgroepen en de kwaliteitsvragen in één lijst", () => {
    renderTabel();
    const rijen = screen.getAllByRole("listitem");
    expect(rijen.length).toBeGreaterThan(1);
    expect(screen.getByText("Groente")).toBeTruthy();
    // De kwaliteitsvragen stonden vroeger in een eigen blok eronder; ze delen
    // nu dezelfde kolommen als de groepen.
    expect(screen.getByText("Wat je mindert")).toBeTruthy();
    expect(screen.getByText("Bewerkingsgraad")).toBeTruthy();
  });

  it("toont de kolomkoppen die de rijen uitlijnen", () => {
    renderTabel();
    expect(screen.getByText("Categorie")).toBeTruthy();
    expect(screen.getByText("Jij")).toBeTruthy();
    expect(screen.getByText("Richtlijn")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
  });

  it("vat samen hoeveel categorieën ruimte laten zien", () => {
    renderTabel();
    // De telling in de kop, niet de filterknop met hetzelfde woord erin.
    expect(screen.getByText(/^\d+ met ruimte$/)).toBeTruthy();
    expect(screen.getByText(/^\d+ totaal$/)).toBeTruthy();
  });

  it("zet de categorie met de meeste ruimte bovenaan", () => {
    renderTabel();
    const statussen = screen.getAllByText(/^(ruimte|bijna|op orde|eigen ijkpunt)$/);
    expect(statussen.length).toBeGreaterThan(1);
    expect(statussen[0].textContent).toBe("ruimte");
  });

  it("filtert de rijen met de knoppen in de header", () => {
    renderTabel();
    const groep = screen.getByRole("group", { name: "Filter op status" });
    const ruimte = within(groep).getByRole("button", { name: /^Ruimte/ });

    fireEvent.click(ruimte);

    expect(ruimte.getAttribute("aria-pressed")).toBe("true");
    // Alleen rijen met ruimte blijven staan; de andere statussen verdwijnen
    // uit de lijst (de knoplabels blijven, met hun eigen telling).
    const lijst = screen.getByRole("list");
    expect(within(lijst).queryByText("op orde")).toBeNull();
    expect(within(lijst).getAllByText("ruimte").length).toBeGreaterThan(0);
  });

  it("keert terug naar alle rijen via Alles", () => {
    renderTabel();
    const groep = screen.getByRole("group", { name: "Filter op status" });
    fireEvent.click(within(groep).getByRole("button", { name: /^Ruimte/ }));
    const voor = screen.getAllByRole("listitem").length;

    fireEvent.click(within(groep).getByRole("button", { name: /^Alles/ }));

    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(voor);
  });

  it("klapt een categorie open en toont de bronnen erachter", () => {
    renderTabel();
    const knop = screen.getByRole("button", { name: /Noten/ });
    expect(knop.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(knop);

    expect(knop.getAttribute("aria-expanded")).toBe("true");
    const paneel = document.getElementById("voedingsstatus-detail-noten");
    expect(paneel).toBeTruthy();
    expect(within(paneel as HTMLElement).getAllByText("Bron").length).toBeGreaterThan(0);
    expect(within(paneel as HTMLElement).getAllByText("Portie").length).toBeGreaterThan(0);
    expect(within(paneel as HTMLElement).getAllByText("Levert").length).toBeGreaterThan(0);
  });

  it("houdt één categorie tegelijk open", () => {
    renderTabel();
    const noten = screen.getByRole("button", { name: /Noten/ });
    const granen = screen.getByRole("button", { name: /Granen/ });

    fireEvent.click(noten);
    expect(noten.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(granen);
    expect(granen.getAttribute("aria-expanded")).toBe("true");
    expect(noten.getAttribute("aria-expanded")).toBe("false");
  });

  it("klapt weer dicht bij een tweede klik", () => {
    renderTabel();
    const knop = screen.getByRole("button", { name: /Noten/ });
    fireEvent.click(knop);
    fireEvent.click(knop);
    expect(knop.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("voedingsstatus-detail-noten")).toBeNull();
  });

  it("geeft een categorie zonder bronnen geen doordruk-knop", () => {
    renderTabel();
    // Suiker kent geen bronnenkeuze — daar minder je, dus geen knop.
    expect(screen.queryByRole("button", { name: /Suiker/ })).toBeNull();
  });

  it("valt terug op een uitnodiging als er geen check is", () => {
    render(<VoedingsstatusTabel rijen={[]} report={null} surface="test" />);
    expect(screen.getByText(/Doe de voedingscheck/)).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Filter op status" })).toBeNull();
  });
});
