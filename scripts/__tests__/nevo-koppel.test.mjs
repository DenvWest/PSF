import { describe, expect, it } from "vitest";
import { tokens } from "../nevo-extract.mjs";
import { bereidingBotst, koppel, leesCatalogusRegels, overbodigeWoorden } from "../nevo-koppel.mjs";

const nevo = (code, naam) => ({ code, naam, _tokens: tokens(naam) });
const VOEDINGSMIDDELEN = [
  nevo("7", "Andijvie rauw"),
  nevo("8", "Andijvie gekookt"),
  nevo("1657", "Sap zuurkool-"),
  nevo("2659", "Snoep schuim-/gum-"),
  nevo("51", "Spinazie rauw"),
];

describe("bereidingBotst", () => {
  it("laat een passende bereiding door", () => {
    expect(bereidingBotst("gekookt", "Andijvie gekookt")).toBe(false);
  });

  it("ziet een andere bereiding als botsing", () => {
    expect(bereidingBotst("gekookt", "Andijvie rauw")).toBe(true);
    expect(bereidingBotst("rauw", "Andijvie gekookt")).toBe(true);
  });

  it("botst niet als de regel geen bereiding noemt", () => {
    expect(bereidingBotst(null, "Andijvie rauw")).toBe(false);
  });
});

describe("overbodigeWoorden", () => {
  it("telt de woorden die het label niet noemt", () => {
    expect(overbodigeWoorden("Ui, gebakken", "Ui gebakken in plantaardige olie").length).toBeGreaterThan(1);
    expect(overbodigeWoorden("Andijvie, rauw", "Andijvie rauw")).toEqual([]);
  });
});

describe("koppel", () => {
  const regel = (key, label, extra = {}) => ({ key, label, bron: null, geenBron: null, bereiding: null, ...extra });

  it("koppelt zeker via de naam als één sterke kandidaat de juiste bereiding heeft", () => {
    const [k] = koppel({ regels: [regel("andijvie-rauw", "Andijvie, rauw", { bereiding: "rauw" })], foodSources: [], voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k).toMatchObject({ status: "zeker", basis: "naam", code: "7" });
  });

  it("koppelt via de bron als FOOD_SOURCES-rij al uit NEVO komt", () => {
    const foodSources = [{ key: "spinazie-rauw", huidig: { origin: "nevo", ref: "51" } }];
    const [k] = koppel({ regels: [regel("spinazie-rauw", "Spinazie, rauw", { bron: "spinazie-rauw" })], foodSources, voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k).toMatchObject({ status: "zeker", basis: "bron", code: "51" });
  });

  it("laat een bron met twee verschillende NEVO-codes onzeker", () => {
    const foodSources = [
      { key: "x", huidig: { origin: "nevo", ref: "7" } },
      { key: "x", huidig: { origin: "nevo", ref: "8" } },
    ];
    const [k] = koppel({ regels: [regel("x", "Andijvie", { bron: "x" })], foodSources, voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k.status).toBe("onzeker");
  });

  it("koppelt een bereiding die botst niet automatisch", () => {
    const [k] = koppel({ regels: [regel("andijvie-gekookt", "Andijvie", { bereiding: "gekookt" })], foodSources: [], voedingsmiddelen: [nevo("7", "Andijvie rauw")] });
    expect(k.status).toBe("onzeker");
  });

  it("koppelt samengestelde en verrijkte regels niet automatisch", () => {
    const [k] = koppel({ regels: [regel("spinazie", "Spinazie rauw", { geenBron: "verrijkt" })], foodSources: [], voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k.status).toBe("onzeker");
  });

  it("koppelt 'Snoep' niet aan één specifiek snoepje", () => {
    const [k] = koppel({ regels: [regel("snoep", "Snoep")], foodSources: [], voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k.status).not.toBe("zeker");
  });

  it("geeft 'geen' als er niets op lijkt", () => {
    const [k] = koppel({ regels: [regel("kimchi", "Kimchi")], foodSources: [], voedingsmiddelen: VOEDINGSMIDDELEN });
    expect(k.status).toBe("geen");
  });
});

describe("leesCatalogusRegels", () => {
  it("leest sleutel, label, bron, geenBron en bereiding", () => {
    const tekst = [
      'f("andijvie-rauw", "Andijvie, rauw", "bladgroente", "groente", P.groente, "andijvie", { bereiding: "rauw" }),',
      'f("water", "Water", "dranken", "overig", P.glas, null, { geenBron: "verwaarloosbaar" }),',
    ].join("\n");
    expect(leesCatalogusRegels(tekst)).toEqual([
      { key: "andijvie-rauw", label: "Andijvie, rauw", bron: "andijvie", geenBron: null, bereiding: "rauw" },
      { key: "water", label: "Water", bron: null, geenBron: "verwaarloosbaar", bereiding: null },
    ]);
  });
});

describe("beslissingen", () => {
  const regel = (key, label) => ({ key, label, bron: null, geenBron: null, bereiding: null });
  const basis = { regels: [regel("snoep", "Snoep"), regel("zuurkool", "Zuurkool")], foodSources: [], voedingsmiddelen: VOEDINGSMIDDELEN };

  it("volgt een handmatige keuze, ook als de naammatching twijfelt", () => {
    const [k] = koppel({ ...basis, beslissingen: { handmatig: { snoep: { code: "2659", opm: "test" } }, bewustNiet: {} } });
    expect(k).toMatchObject({ status: "zeker", basis: "handmatig", code: "2659" });
  });

  it("legt een bewuste niet-koppeling vast met reden", () => {
    const k = koppel({ ...basis, beslissingen: { handmatig: {}, bewustNiet: { zuurkool: "alleen sap" } } })[1];
    expect(k).toMatchObject({ status: "bewust-niet", reden: "alleen sap" });
  });

  it("weigert een code die niet in NEVO bestaat", () => {
    expect(() => koppel({ ...basis, beslissingen: { handmatig: { snoep: { code: "9999999", opm: "" } }, bewustNiet: {} } })).toThrow(/bestaat niet/);
  });

  it("weigert een beslissing voor een onbekende catalogusregel", () => {
    expect(() => koppel({ ...basis, beslissingen: { handmatig: {}, bewustNiet: { typfout: "x" } } })).toThrow(/onbekende/);
  });

  it("weigert dezelfde regel bij handmatig én bewustNiet", () => {
    expect(() => koppel({ ...basis, beslissingen: { handmatig: { snoep: { code: "2659", opm: "" } }, bewustNiet: { snoep: "x" } } })).toThrow(/zowel/);
  });

  it("koppelt een benadering en markeert hem als zodanig", () => {
    const [k] = koppel({ ...basis, beslissingen: { handmatig: {}, bewustNiet: {}, benadering: { snoep: { code: "2659", opm: "vergelijkbaar" } } } });
    expect(k).toMatchObject({ status: "zeker", basis: "benadering", code: "2659" });
  });

  it("weigert een benadering met een onbekende code of een dubbele beslissing", () => {
    expect(() => koppel({ ...basis, beslissingen: { handmatig: {}, bewustNiet: {}, benadering: { snoep: { code: "0", opm: "" } } } })).toThrow(/bestaat niet/);
    expect(() => koppel({ ...basis, beslissingen: { handmatig: {}, bewustNiet: { snoep: "x" }, benadering: { snoep: { code: "2659", opm: "" } } } })).toThrow(/zowel/);
  });
});
