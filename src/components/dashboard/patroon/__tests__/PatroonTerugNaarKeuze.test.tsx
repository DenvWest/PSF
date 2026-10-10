/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonEnergieVerdeling from "@/components/dashboard/patroon/PatroonEnergieVerdeling";
import PatroonTerugNaarKeuze from "@/components/dashboard/patroon/PatroonTerugNaarKeuze";

const ga = vi.hoisted(() => ({ gaNaarDashboard: vi.fn() }));
vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/dagboek-deeplink", () => ({ gaNaarDashboard: ga.gaNaarDashboard }));

afterEach(cleanup);

describe("PatroonTerugNaarKeuze", () => {
  it("legt uit waarom je hier bent en brengt je terug naar dezelfde stof in Keuze", () => {
    render(<PatroonTerugNaarKeuze stof="protein" periode={{ van: "2026-10-04", tot: "2026-10-10" }} />);
    expect(screen.getByText(/Je kwam van Keuze · Eiwit/)).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: /Terug naar Keuze/ }));
    expect(ga.gaNaarDashboard).toHaveBeenCalledWith("/dashboard?tab=keuze&stof=protein");
  });
});

describe("PatroonEnergieVerdeling", () => {
  it("noemt bij vet wat je ermee kunt en opent omega-3", () => {
    const onNaarOmega3 = vi.fn();
    render(
      <PatroonEnergieVerdeling
        stof="fatG"
        energie={null}
        vet={{ vetG: 60, verzadigdG: 15, aandeelVerzadigd: 0.25 }}
        onNaarMaaltijden={() => {}}
        onNaarOmega3={onNaarOmega3}
      />,
    );
    expect(screen.getByText(/25%/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Bekijk omega-3/ }));
    expect(onNaarOmega3).toHaveBeenCalled();
  });
});
