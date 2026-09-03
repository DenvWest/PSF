import { describe, expect, it } from "vitest";
import {
  analyseerDagboek,
  berekenBreedte,
  dagboekVoortgang,
  dagSoortVoor,
  dekkingsRegel,
  DAGBOEK_GROEPEN,
  DAGBOEK_LABELS,
  DAGBOEK_TOTAAL,
  LEGACY_DAGBOEK_GROEPEN,
  NIEUWE_DAGBOEK_GROEPEN,
  VOLWAARDIGE_GROEPEN,
  type DagboekDag,
} from "@/lib/nutrition-dagboek";
import { VOEDSELGROEPEN } from "@/lib/nutrition-voedselgroepen";

function dag(
  date: string,
  porties: DagboekDag["porties"],
): DagboekDag {
  return { date, soort: dagSoortVoor(date), porties };
}

/** Twee doordeweekse en twee weekenddagen rond 3 september 2026 (donderdag). */
const MA = "2026-08-31";
const DI = "2026-09-01";
const ZA = "2026-09-05";
const ZO = "2026-09-06";

describe("dagSoortVoor", () => {
  it("herkent zaterdag en zondag als weekend", () => {
    expect(dagSoortVoor(ZA)).toBe("weekend");
    expect(dagSoortVoor(ZO)).toBe("weekend");
  });

  it("herkent doordeweekse dagen", () => {
    expect(dagSoortVoor(MA)).toBe("doordeweeks");
    expect(dagSoortVoor(DI)).toBe("doordeweeks");
    expect(dagSoortVoor("2026-09-04")).toBe("doordeweeks");
  });
});

describe("dagboekVoortgang", () => {
  it("vraagt eerst een doordeweekse dag als er nog niets staat", () => {
    const voortgang = dagboekVoortgang([]);
    expect(voortgang.compleet).toBe(false);
    expect(voortgang.volgende).toBe("doordeweeks");
  });

  it("schakelt naar weekend zodra doordeweeks vol is", () => {
    const dagen = [dag(MA, { groente: 2 }), dag(DI, { groente: 2 })];
    expect(dagboekVoortgang(dagen).volgende).toBe("weekend");
  });

  it("vraagt door op wat achterloopt", () => {
    const dagen = [dag(MA, { groente: 2 }), dag(ZA, { groente: 3 }), dag(ZO, { groente: 3 })];
    expect(dagboekVoortgang(dagen).volgende).toBe("doordeweeks");
  });

  it("is compleet bij twee van elk", () => {
    const dagen = [
      dag(MA, { groente: 2 }),
      dag(DI, { groente: 2 }),
      dag(ZA, { groente: 2 }),
      dag(ZO, { groente: 2 }),
    ];
    const voortgang = dagboekVoortgang(dagen);
    expect(voortgang.compleet).toBe(true);
    expect(voortgang.volgende).toBeNull();
    expect(voortgang.doordeweeks + voortgang.weekend).toBe(DAGBOEK_TOTAAL);
  });
});

describe("analyseerDagboek", () => {
  it("zegt niets zolang het dagboek niet compleet is", () => {
    const uitkomst = analyseerDagboek([dag(MA, { groente: 4 }), dag(ZA, { groente: 0 })]);
    expect(uitkomst.verschillen).toEqual([]);
    expect(uitkomst.samenvatting).toBeNull();
  });

  it("vindt een weekendafwijking en noemt de richting", () => {
    const dagen = [
      dag(MA, { groente: 4, suiker: 0 }),
      dag(DI, { groente: 4, suiker: 0 }),
      dag(ZA, { groente: 1, suiker: 3 }),
      dag(ZO, { groente: 1, suiker: 3 }),
    ];
    const uitkomst = analyseerDagboek(dagen);
    expect(uitkomst.verschillen.length).toBeGreaterThan(0);
    // Grootste verschil eerst.
    const grootste = uitkomst.verschillen[0];
    expect(Math.abs(grootste.verschil)).toBeGreaterThanOrEqual(
      Math.abs(uitkomst.verschillen[uitkomst.verschillen.length - 1].verschil),
    );
    expect(uitkomst.samenvatting).toMatch(/weekend/i);
  });

  it("negeert verschillen onder één portie als ruis", () => {
    const dagen = [
      dag(MA, { groente: 3 }),
      dag(DI, { groente: 3 }),
      dag(ZA, { groente: 3 }),
      dag(ZO, { groente: 4 }),
    ];
    // Gemiddeld verschil is 0,5 — onder de drempel.
    expect(analyseerDagboek(dagen).verschillen).toEqual([]);
  });

  it("meldt expliciet wanneer week en weekend gelijk lopen", () => {
    const dagen = [
      dag(MA, { groente: 3 }),
      dag(DI, { groente: 3 }),
      dag(ZA, { groente: 3 }),
      dag(ZO, { groente: 3 }),
    ];
    const uitkomst = analyseerDagboek(dagen);
    expect(uitkomst.verschillen).toEqual([]);
    expect(uitkomst.samenvatting).toMatch(/eet als je week/i);
  });

  it("slaat groepen over die niet in beide soorten zijn ingevuld", () => {
    const dagen = [
      dag(MA, { groente: 3, noten: 2 }),
      dag(DI, { groente: 3 }),
      dag(ZA, { groente: 0 }),
      dag(ZO, { groente: 0 }),
    ];
    const uitkomst = analyseerDagboek(dagen);
    // Noten staat alleen doordeweeks: geen vergelijking, dus geen rij.
    expect(uitkomst.verschillen.some((rij) => rij.groep === "noten")).toBe(false);
    expect(uitkomst.verschillen.some((rij) => rij.groep === "groente")).toBe(true);
  });

  it("noemt nooit een score, calorie of gram", () => {
    const dagen = [
      dag(MA, { groente: 4, suiker: 0 }),
      dag(DI, { groente: 4, suiker: 0 }),
      dag(ZA, { groente: 1, suiker: 3 }),
      dag(ZO, { groente: 1, suiker: 3 }),
    ];
    const tekst = `${analyseerDagboek(dagen).samenvatting ?? ""} ${dekkingsRegel(analyseerDagboek(dagen)) ?? ""}`;
    expect(tekst).not.toMatch(/score|kcal|calorie|gram\b|\bg\b/i);
  });
});

describe("dekkingsRegel", () => {
  it("zwijgt zolang er niets is ingevuld", () => {
    expect(dekkingsRegel(analyseerDagboek([]))).toBeNull();
  });

  it("telt de voortgang zolang het dagboek loopt", () => {
    const regel = dekkingsRegel(analyseerDagboek([dag(MA, { groente: 2 })]));
    expect(regel).toMatch(/1 van 4/);
  });

  it("meldt de uitkomst zodra het compleet is", () => {
    const dagen = [
      dag(MA, { groente: 3 }),
      dag(DI, { groente: 3 }),
      dag(ZA, { groente: 3 }),
      dag(ZO, { groente: 3 }),
    ];
    expect(dekkingsRegel(analyseerDagboek(dagen))).toMatch(/vier dagen/i);
  });
});

describe("berekenBreedte", () => {
  it("zwijgt zonder dagen", () => {
    const breedte = berekenBreedte([]);
    expect(breedte.regel).toBeNull();
    expect(breedte.gemiddeldPerDag).toBe(0);
  });

  it("telt al vanaf één dag", () => {
    // Anders dan de weekendvergelijking: "je at uit drie groepen" is meteen
    // waar, ook zonder vier dagen.
    const breedte = berekenBreedte([dag(MA, { groente: 2, fruit: 1, granen: 3 })]);
    expect(breedte.gemiddeldPerDag).toBe(3);
    expect(breedte.regel).toMatch(/3,0 van de 7/);
  });

  it("telt nul porties niet als gegeten", () => {
    const breedte = berekenBreedte([dag(MA, { groente: 2, "vlees-vis": 0 })]);
    expect(breedte.gemiddeldPerDag).toBe(1);
  });

  it("middelt over de geregistreerde dagen", () => {
    const breedte = berekenBreedte([
      dag(MA, { groente: 1, fruit: 1 }),
      dag(DI, { groente: 1, fruit: 1, noten: 1, granen: 1 }),
    ]);
    expect(breedte.gemiddeldPerDag).toBe(3);
  });

  it("noemt groepen die op geen enkele dag voorkwamen", () => {
    const breedte = berekenBreedte([
      dag(MA, { groente: 2, fruit: 1 }),
      dag(DI, { groente: 2, fruit: 1 }),
    ]);
    const ontbrekendeIds = breedte.ontbrekend.map((rij) => rij.groep);
    expect(ontbrekendeIds).toContain("vlees-vis");
    expect(ontbrekendeIds).toContain("noten");
    expect(ontbrekendeIds).not.toContain("groente");
    expect(breedte.regel).toMatch(/geen enkele dag/i);
  });

  it("meldt het expliciet als elke groep voorkwam", () => {
    const alles = Object.fromEntries(
      DAGBOEK_GROEPEN.map((groep) => [groep, 1]),
    ) as Record<string, number>;
    const breedte = berekenBreedte([dag(MA, alles)]);
    expect(breedte.ontbrekend).toEqual([]);
    expect(breedte.regel).toMatch(/elke groep/i);
  });

  it("vult de breedte ook in als het dagboek nog niet compleet is", () => {
    // De weekendverschillen hebben vier dagen nodig; breedte niet.
    const uitkomst = analyseerDagboek([dag(MA, { groente: 2, fruit: 1 })]);
    expect(uitkomst.voortgang.compleet).toBe(false);
    expect(uitkomst.verschillen).toEqual([]);
    expect(uitkomst.breedte.regel).not.toBeNull();
  });

  it("claimt nooit diversiteit binnen een groep", () => {
    // Het dagboek kent geen bronnen, alleen porties per groep. De copy mag
    // dus niet suggereren dat hij variatie meet.
    const breedte = berekenBreedte([dag(MA, { groente: 5 })]);
    expect(breedte.regel ?? "").not.toMatch(/divers|variatie|afwisseling|soorten/i);
  });
});

describe("groepen", () => {
  it("is fijner dan de check-tabel", () => {
    // Het dagboek vraagt wat je gisteren at; dat weet je preciezer dan een
    // gemiddelde over weken. De splitsingen bestaan om de nutriëntroutes te
    // kunnen voeden — vis, vlees en noten los.
    expect(DAGBOEK_GROEPEN.length).toBeGreaterThan(VOEDSELGROEPEN.length);
    expect(DAGBOEK_GROEPEN).toContain("vis");
    expect(DAGBOEK_GROEPEN).toContain("vlees");
    expect(DAGBOEK_GROEPEN).toContain("peulvruchten");
  });

  it("bundelt vlees en vis niet meer", () => {
    // "vlees-vis" is de legacy-bak: omega-3 en zink zijn er niet uit te halen.
    expect(DAGBOEK_GROEPEN).not.toContain("vlees-vis");
    expect(LEGACY_DAGBOEK_GROEPEN).toContain("vlees-vis");
  });

  it("geeft elke dagboekgroep een label", () => {
    for (const groep of DAGBOEK_GROEPEN) {
      expect(DAGBOEK_LABELS[groep]).toBeTruthy();
    }
  });

  it("telt variatie alleen binnen volwaardige groepen", () => {
    // Dertig ultrabewerkte producten is geen gevarieerd patroon.
    expect(VOLWAARDIGE_GROEPEN).not.toContain("suiker");
    expect(VOLWAARDIGE_GROEPEN).not.toContain("dranken");
    expect(VOLWAARDIGE_GROEPEN).toContain("groente");
  });

  it("houdt legacy en nieuw uit elkaar", () => {
    // Samen dekken ze het dagboek; overlap zou de versie-vingerafdruk
    // onbruikbaar maken.
    for (const groep of NIEUWE_DAGBOEK_GROEPEN) {
      expect(LEGACY_DAGBOEK_GROEPEN).not.toContain(groep);
      expect(DAGBOEK_GROEPEN).toContain(groep);
    }
  });
});

describe("breedte over de groepen-uitbreiding heen", () => {
  it("meet een oude dag tegen zeven, niet tegen dertien", () => {
    // Zonder deze regel wordt "3 van de 7" ineens "3 van de 13" — een
    // verslechtering die alleen in de noemer zit.
    const oud = dag(MA, { groente: 2, fruit: 1, granen: 1 });
    expect(berekenBreedte([oud]).regel).toMatch(/van de 7 groepen/);
  });

  it("meet een nieuwe dag tegen dertien", () => {
    const nieuw = dag(MA, { groente: 2, vis: 1, vlees: 0 });
    expect(berekenBreedte([nieuw]).regel).toMatch(/van de 13 groepen/);
  });

  it("valt terug op de smalste noemer in een gemengde set", () => {
    // Eén oude dag in de set betekent dat dertien niet de lat was waartegen
    // alles liep.
    const gemengd = [
      dag(MA, { groente: 2, fruit: 1 }),
      dag(DI, { groente: 2, vis: 1 }),
    ];
    expect(berekenBreedte(gemengd).regel).toMatch(/van de 7 groepen/);
  });

  it("noemt een nieuwe groep niet ontbrekend op een oude dag", () => {
    // Er is toen niet naar gevraagd; dat is geen gat.
    const oud = dag(MA, { groente: 2, fruit: 1 });
    const ontbrekend = berekenBreedte([oud]).ontbrekend.map((rij) => rij.groep);
    expect(ontbrekend).not.toContain("vis");
    expect(ontbrekend).toContain("zuivel");
  });
});
