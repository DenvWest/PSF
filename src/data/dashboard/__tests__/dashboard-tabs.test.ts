import { describe, expect, it } from "vitest";
import { DASHBOARD_TABS, TAB_SECTIONS } from "@/data/dashboard";

/**
 * De tabs zijn op 17 september 2026 hernoemd maar niet verplaatst: het
 * dashboard ging van zeven domeinen naar één, en dan beschrijft "Kompas" niets
 * meer. De ids bleven, omdat ze in de URL staan en in opgeslagen events.
 *
 * Deze tests bewaken dat onderscheid — labels mogen veranderen, ids niet.
 */
describe("de vier dashboardtabs", () => {
  it("houdt de ids die in URL's en events staan", () => {
    expect(DASHBOARD_TABS.map((tab) => tab.id)).toEqual([
      "vandaag",
      "agenda",
      "voortgang",
      "keuze",
    ]);
  });

  it("draagt de labels van het voedingsdashboard, niet die van het domeinenkompas", () => {
    const labels = DASHBOARD_TABS.map((tab) => tab.label);

    expect(labels).toEqual(["Dagboek", "Mijn Dag", "Je patroon", "Keuze"]);
    // "Kompas" is een metafoor die meerdere richtingen nodig heeft; met één
    // domein is hij loos. Zie BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09 §3.1.
    expect(labels).not.toContain("Kompas");
  });

  it("geeft elke tab een sectie om te renderen", () => {
    for (const tab of DASHBOARD_TABS) {
      expect(TAB_SECTIONS[tab.id]?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("laat geen tab zonder lege-staat-hint, zodat een nieuw account niets kaals ziet", () => {
    for (const tab of DASHBOARD_TABS) {
      expect(tab.emptyHint.length).toBeGreaterThan(0);
    }
  });
});
