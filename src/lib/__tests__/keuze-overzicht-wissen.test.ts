import { describe, expect, it } from "vitest";
import { omgekeerdWisPlan, planAllesWeg, planEtenWeg, planSupplementWeg } from "@/lib/keuze-overzicht-wissen";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

const item = (id: string): VoortgangFavoriteItem => ({ id, title: id, kind: "activiteit", domain: "voeding", source: "mijn_keuze" });

describe("keuze-overzicht-wissen", () => {
  it("wist een voedingsmiddel met zijn moment en laat de rest staan", () => {
    const items = [
      item("voeding-eten-protein-kwark"),
      item("voeding-itemmoment-protein-ontbijt-kwark"),
      item("voeding-eten-protein-ei"),
      item("los-iets"),
    ];
    const plan = planEtenWeg("protein", "kwark", items);
    expect(plan.verwijder.map((i) => i.id)).toEqual([
      "voeding-eten-protein-kwark",
      "voeding-itemmoment-protein-ontbijt-kwark",
    ]);
    expect(plan.voegToe).toEqual([]);
  });

  it("zet 'beide' terug op 'uit mijn eten' als je het supplement wist", () => {
    const items = [item("voeding-route-protein-beide"), item("voeding-route-magnesium-potje")];
    const plan = planSupplementWeg("protein", items);
    expect(plan.verwijder.map((i) => i.id)).toEqual(["voeding-route-protein-beide"]);
    expect(plan.voegToe.map((i) => i.id)).toEqual(["voeding-route-protein-bord"]);
  });

  it("wist de route volledig als er geen eten bij zat", () => {
    const plan = planSupplementWeg("magnesium", [item("voeding-route-magnesium-potje")]);
    expect(plan.verwijder).toHaveLength(1);
    expect(plan.voegToe).toEqual([]);
  });

  it("wist alles van de stofkeuzes en geen andere favorieten; ongedaan is het omgekeerde", () => {
    const items = [item("voeding-route-protein-bord"), item("voeding-eten-protein-ei"), item("slaap-iets")];
    const plan = planAllesWeg(items);
    expect(plan.verwijder.map((i) => i.id)).toEqual(["voeding-route-protein-bord", "voeding-eten-protein-ei"]);
    expect(omgekeerdWisPlan(plan).voegToe).toEqual(plan.verwijder);
  });
});
