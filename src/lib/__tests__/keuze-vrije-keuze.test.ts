import { describe, expect, it } from "vitest";
import { parseVrijKeuze, planVrijVerplaats, planVrijWeg, vrijeKeuzes, vrijKeuzeId, vrijKeuzeItem } from "@/lib/keuze-vrije-keuze";

describe("keuze-vrije-keuze", () => {
  it("zet moment en sleutel in het id en leest ze terug, ook met koppeltekens in de sleutel", () => {
    expect(vrijKeuzeId("lunch", "volkoren-brood")).toBe("voeding-vrij-lunch-volkoren-brood");
    expect(parseVrijKeuze("voeding-vrij-lunch-volkoren-brood")).toEqual({ moment: "lunch", key: "volkoren-brood" });
    expect(parseVrijKeuze("voeding-vrij-nooit-brood")).toBeNull();
    expect(parseVrijKeuze("voeding-eten-omega3-haring")).toBeNull();
  });

  it("geeft elke vrije keuze één keer", () => {
    const items = [{ id: "voeding-vrij-lunch-haver" }, { id: "voeding-vrij-ontbijt-haver" }, { id: "voeding-vrij-lunch-ei" }];
    expect(vrijeKeuzes(items).map((k) => k.key)).toEqual(["haver", "ei"]);
  });

  it("wist en verplaatst", () => {
    const items = [vrijKeuzeItem("haver", "Havermout", "ontbijt")];
    expect(planVrijWeg("haver", items).verwijder.map((i) => i.id)).toEqual(["voeding-vrij-ontbijt-haver"]);
    const plan = planVrijVerplaats("haver", "Havermout", "lunch", items);
    expect(plan.verwijder.map((i) => i.id)).toEqual(["voeding-vrij-ontbijt-haver"]);
    expect(plan.voegToe.map((i) => i.id)).toEqual(["voeding-vrij-lunch-haver"]);
  });
});
