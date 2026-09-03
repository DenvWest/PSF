import { describe, expect, it } from "vitest";
import {
  EETMOMENTEN,
  groepenVoorMoment,
  ingevuldeMomenten,
  isEetmomentId,
  normaliseerWaterMl,
  portieHint,
  portiesUitMomenten,
  structuurRegel,
  waterInGlazen,
  waterRegel,
  WATER_MAX_ML,
  type DagMomenten,
} from "@/lib/nutrition-eetmomenten";
import { DAGBOEK_GROEPEN } from "@/lib/nutrition-dagboek";

describe("momenten", () => {
  it("kent vier momenten in dagvolgorde", () => {
    expect(EETMOMENTEN.map((m) => m.id)).toEqual([
      "ontbijt",
      "lunch",
      "avondeten",
      "tussendoor",
    ]);
  });

  it("valideert moment-ids", () => {
    expect(isEetmomentId("ontbijt")).toBe(true);
    expect(isEetmomentId("brunch")).toBe(false);
  });
});

describe("portiesUitMomenten", () => {
  it("telt dezelfde groep over momenten heen op", () => {
    const momenten: DagMomenten = {
      ontbijt: { zuivel: 1 },
      lunch: { zuivel: 1, groente: 2 },
      avondeten: { groente: 3 },
    };
    expect(portiesUitMomenten(momenten)).toEqual({ zuivel: 2, groente: 5 });
  });

  it("negeert nullen en lege momenten", () => {
    const momenten: DagMomenten = {
      ontbijt: { groente: 0 },
      lunch: {},
      avondeten: { vis: 1 },
    };
    expect(portiesUitMomenten(momenten)).toEqual({ vis: 1 });
  });

  it("geeft een lege map voor een lege dag", () => {
    expect(portiesUitMomenten({})).toEqual({});
  });

  it("levert precies de vorm die het dagboek al gebruikt", () => {
    // De brug naar breedte, variatie en de zelfrapport-vertaler: die rekenen
    // allemaal op DagboekDag.porties, en die blijft de waarheid.
    const porties = portiesUitMomenten({ lunch: { groente: 2, vis: 1 } });
    for (const groep of Object.keys(porties)) {
      expect(DAGBOEK_GROEPEN).toContain(groep);
    }
  });
});

describe("ingevuldeMomenten", () => {
  it("telt alleen momenten met inhoud", () => {
    const momenten: DagMomenten = {
      ontbijt: { zuivel: 1 },
      lunch: {},
      avondeten: { groente: 0 },
    };
    expect(ingevuldeMomenten(momenten)).toEqual(["ontbijt"]);
  });
});

describe("structuurRegel", () => {
  it("zwijgt bij een lege dag", () => {
    expect(structuurRegel({})).toBeNull();
  });

  it("noemt de maaltijden bij naam", () => {
    const regel = structuurRegel({
      ontbijt: { zuivel: 1 },
      avondeten: { groente: 2 },
    });
    expect(regel).toMatch(/2 maaltijden/i);
    expect(regel).toMatch(/ontbijt en avondeten/i);
  });

  it("meldt tussendoor apart", () => {
    const regel = structuurRegel({
      lunch: { granen: 2 },
      tussendoor: { suiker: 1 },
    });
    expect(regel).toMatch(/plus tussendoor/i);
  });

  it("herkent een dag met alleen tussendoor", () => {
    expect(structuurRegel({ tussendoor: { suiker: 2 } })).toMatch(/alleen tussendoor/i);
  });

  it("oordeelt niet over het aantal momenten", () => {
    // Er is geen richtlijn die zegt dat drie beter is dan twee; wie vast doet
    // dat bewust.
    const regel = structuurRegel({ avondeten: { groente: 3, vlees: 1 } }) ?? "";
    expect(regel).not.toMatch(/te weinig|zou moeten|beter|mis(t|te)|onvoldoende/i);
  });
});

describe("portieHint", () => {
  it("geeft een gram-equivalent met bron", () => {
    const hint = portieHint("groente");
    expect(hint?.label).toMatch(/100 g/);
    expect(hint?.bron).toMatch(/Voedingscentrum/);
  });

  it("geeft een bereik waar de bron dat doet", () => {
    expect(portieHint("fruit")?.label).toMatch(/120–150 g/);
  });

  it("gebruikt ml voor zuivel", () => {
    expect(portieHint("zuivel")?.label).toMatch(/ml/);
  });

  it("zwijgt bij groepen zonder portiemaat", () => {
    // Een verzonnen portie zou schijnnauwkeurigheid toevoegen.
    expect(portieHint("zetmeel")).toBeNull();
    expect(portieHint("vetten")).toBeNull();
    expect(portieHint("dranken")).toBeNull();
    expect(portieHint("suiker")).toBeNull();
  });
});

describe("groepenVoorMoment", () => {
  it("houdt alle groepen bereikbaar", () => {
    // Wie 's ochtends vis eet moet dat kunnen invullen.
    for (const moment of EETMOMENTEN) {
      const groepen = groepenVoorMoment(moment.id);
      expect(groepen.length).toBe(DAGBOEK_GROEPEN.length);
      expect(new Set(groepen).size).toBe(groepen.length);
    }
  });

  it("zet passende groepen vooraan", () => {
    expect(groepenVoorMoment("ontbijt")[0]).toBe("zuivel");
    expect(groepenVoorMoment("avondeten")[0]).toBe("groente");
  });
});

describe("water", () => {
  it("normaliseert onzin naar null", () => {
    expect(normaliseerWaterMl("veel")).toBeNull();
    expect(normaliseerWaterMl(-100)).toBeNull();
    expect(normaliseerWaterMl(Infinity)).toBeNull();
  });

  it("kapt onrealistische waarden af", () => {
    expect(normaliseerWaterMl(99999)).toBe(WATER_MAX_ML);
  });

  it("rekent glazen terug", () => {
    expect(waterInGlazen(1500)).toBe(6);
  });

  it("noemt liters en glazen zonder norm", () => {
    const regel = waterRegel(1500) ?? "";
    expect(regel).toMatch(/1,5 liter/);
    expect(regel).toMatch(/6 glazen/);
    // Geen dagbehoefte-claim: de 2-liter-vuistregel is geen richtlijn.
    expect(regel).not.toMatch(/dagbehoefte|richtlijn|te weinig|haalt/i);
  });

  it("zwijgt zonder water", () => {
    expect(waterRegel(null)).toBeNull();
    expect(waterRegel(0)).toBeNull();
  });
});
