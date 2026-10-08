import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  bouwVoedingsmiddelen,
  doelTokens,
  kandidaten,
  naarEenheid,
  nevoWaardeVoor,
  parseCatalogusLabels,
  parseDelimited,
  parseFoodSources,
  parseWaarde,
  scoreKandidaat,
  STERKE_SCORE,
  tokens,
} from "../nevo-extract.mjs";
import { leesCatalogus } from "../usda-extract.mjs";

const KOP = [
  "NEVO-versie/NEVO-version",
  "Voedingsmiddelgroep",
  "Food group",
  "NEVO-code",
  "Voedingsmiddelnaam/Dutch food name",
  "Engelse naam/Food name",
  "Hoeveelheid/Quantity",
  "Voedingsstofgroep",
  "Component group",
  "Nutrient-code",
  "Voedingsstof",
  "Component",
  "Gehalte/Value",
  "Eenheid/Unit",
  "Spoor / Verrijkt/Trace / Fortified",
  "Broncode/Source code",
  "Referentie/Reference",
];

function regel(code, naam, stof, waarde, { eenheid = "g", vlag = "", per = "per 100g", groep = "Eiwitten" } = {}) {
  return ["NEVO-Online 2025 9.0", "Groep", "Group", code, naam, "", per, groep, "", stof, ` ${stof} `, "", waarde, eenheid, vlag, "REF.1", "bron"];
}

function voedingsmiddel(naam, code = "1") {
  return { code, naam, stoffen: {} };
}

describe("parseDelimited", () => {
  it("splitst op | en haalt CRLF weg", () => {
    expect(parseDelimited("a|b|c\r\nd|e|f\r\n")).toEqual([
      ["a", "b", "c"],
      ["d", "e", "f"],
    ]);
  });

  it("leest velden tussen aanhalingstekens, ook met een scheidingsteken erin", () => {
    expect(parseDelimited('"a|b"|"371"|x\n')).toEqual([["a|b", "371", "x"]]);
  });

  it("neemt een laatste regel zonder regeleinde mee", () => {
    expect(parseDelimited("a|b\nc|d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("parseWaarde", () => {
  it("leest een decimale komma als punt, zonder af te ronden", () => {
    expect(parseWaarde("1,8")).toBe(1.8);
    expect(parseWaarde("0,0035")).toBe(0.0035);
    expect(parseWaarde("371")).toBe(371);
  });

  it("geeft null bij alles wat geen getal is, nooit een gok", () => {
    for (const ruw of ["", "tr", "<0,1", "abc", "1,2,3", "NaN"]) expect(parseWaarde(ruw)).toBeNull();
  });
});

describe("bouwVoedingsmiddelen", () => {
  it("bewaart waarde, spoor en verrijking ongewijzigd en leest 100 ml", () => {
    const data = bouwVoedingsmiddelen([
      KOP,
      regel("1", "Melk halfvolle", "PROT", "3,4"),
      regel("1", "Melk halfvolle", "VITD", "0", { eenheid: "µg", vlag: "TR" }),
      regel("1", "Melk halfvolle", "CA", "120", { eenheid: "mg", vlag: "+" }),
      regel("2", "Drink amandel-", "PROT", "0,5", { per: "per 100ml" }),
    ]);
    const melk = data.voedingsmiddelen.find((v) => v.code === "1");
    expect(melk.stoffen.PROT).toEqual({ w: 3.4, b: "REF.1" });
    expect(melk.stoffen.VITD).toMatchObject({ w: 0, spoor: true });
    expect(melk.stoffen.CA).toMatchObject({ w: 120, verrijkt: true });
    expect(data.voedingsmiddelen.find((v) => v.code === "2").per).toBe("100ml");
    expect(data.stoffen.VITD.eenheid).toBe("µg");
    expect(data.problemen).toEqual([]);
  });

  it("telt een identieke herhaling onder een tweede stofgroep als herhaling, niet als probleem", () => {
    const data = bouwVoedingsmiddelen([
      KOP,
      regel("1", "Ei", "PROT", "12,6", { groep: "Energie en macronutriënten" }),
      regel("1", "Ei", "PROT", "12,6", { groep: "Eiwitten" }),
    ]);
    expect(data.herhalingen).toBe(1);
    expect(data.problemen).toEqual([]);
    expect(Object.keys(data.voedingsmiddelen[0].stoffen)).toEqual(["PROT"]);
  });

  it("meldt een dubbele regel met een afwijkende waarde als probleem en behoudt de eerste", () => {
    const data = bouwVoedingsmiddelen([KOP, regel("1", "Ei", "PROT", "12,6"), regel("1", "Ei", "PROT", "13")]);
    expect(data.problemen).toHaveLength(1);
    expect(data.voedingsmiddelen[0].stoffen.PROT.w).toBe(12.6);
  });

  it("zet een onleesbare waarde niet als verzonnen 0 in de data", () => {
    const data = bouwVoedingsmiddelen([KOP, regel("1", "Ei", "PROT", "veel")]);
    expect(data.voedingsmiddelen[0].stoffen.PROT).toBeUndefined();
    expect(data.problemen[0].probleem).toContain("geen getal");
  });

  it("faalt luid als een verwachte kolom ontbreekt", () => {
    expect(() => bouwVoedingsmiddelen([KOP.filter((k) => !k.startsWith("Gehalte")), []])).toThrow(/Gehalte/);
  });

  it("meldt een wisselende eenheid per stof", () => {
    const data = bouwVoedingsmiddelen([
      KOP,
      regel("1", "A", "NA", "5", { eenheid: "mg" }),
      regel("2", "B", "NA", "0,005", { eenheid: "g" }),
    ]);
    expect(data.problemen.some((p) => p.probleem.includes("eenheid"))).toBe(true);
  });
});

describe("naarEenheid", () => {
  it("rekent tussen g, mg en µg", () => {
    expect(naarEenheid(0.318, "g", "mg")).toBeCloseTo(318);
    expect(naarEenheid(25, "µg", "mg")).toBeCloseTo(0.025);
    expect(naarEenheid(1, "kcal", "g")).toBeNull();
  });
});

describe("nevoWaardeVoor", () => {
  it("telt EPA en DHA op in de eenheid van food-sources.ts, en geeft null als een van beide ontbreekt", () => {
    const v = { stoffen: { "F20:5CN3": { w: 0.9 }, "F22:6CN3": { w: 1.6 } } };
    const stoffen = { "F20:5CN3": { eenheid: "g" }, "F22:6CN3": { eenheid: "g" } };
    const omega3 = { nevo: ["F20:5CN3", "F22:6CN3"], eenheid: "mg" };
    expect(nevoWaardeVoor(v, omega3, stoffen)).toBeCloseTo(2500);
    expect(nevoWaardeVoor({ stoffen: { "F20:5CN3": { w: 0.9 } } }, omega3, stoffen)).toBeNull();
  });
});

describe("matchen op naam", () => {
  const lijst = [
    "Melk halfvolle",
    "Melk rauwe",
    "Noten cashew- ongezouten",
    "Noten borrel-",
    "Vlokken haver-",
    "Pap havermout- bereid m volle melk ongezoet",
    "Kikkererwten geroosterd leblebi Turks",
    "Margarine 80% vet >24 g verz vetz gezouten",
    "Pannenkoek huishoudelijk bereid m margarine",
    "Runderbiefstuk rauw",
    "Drink amandel- z suiker",
    "Kaas Mozzarella gemaakt v koemelk",
    "Pizza m mozzarella Margherita",
    "Ei kippen- rauw gem",
    "Prei gekookt",
    "Drink haver- z suiker verrijkt m calcium en vitamines",
    "Eiwitreep m pinda",
  ].map((naam, i) => ({ ...voedingsmiddel(naam, String(i)), _tokens: tokens(naam) }));
  const beste = (label) => kandidaten(label, lijst, 1, 0.5)[0]?.v.naam ?? null;

  it("vindt een samenstelling die NEVO gesplitst schrijft", () => {
    expect(beste("Cashewnoten")).toBe("Noten cashew- ongezouten");
    expect(beste("Amandeldrink")).toBe("Drink amandel- z suiker");
    expect(beste("Biefstuk")).toBe("Runderbiefstuk rauw");
  });

  it("kent de naamgeving-aliassen (eieren → ei, havermout → vlokken haver)", () => {
    expect(beste("Eieren")).toBe("Ei kippen- rauw gem");
    expect(beste("Havermout")).toBe("Vlokken haver-");
  });

  it("raakt een kandidaat die alleen de kop deelt niet aan: een ander soort melk is geen havermelk", () => {
    expect(beste("Rijstmelk")).toBeNull();
    expect(beste("Kokosmelk")).toBeNull();
  });

  it("vindt havermelk onder NEVO's naam voor haverdrank, en een proteïnereep onder eiwitreep", () => {
    expect(beste("Havermelk")).toBe("Drink haver- z suiker verrijkt m calcium en vitamines");
    expect(beste("Proteïnereep")).toBe("Eiwitreep m pinda");
  });

  it("laat 'haver' niet in 'havermout' besloten zitten", () => {
    const doel = doelTokens("Haver");
    expect(scoreKandidaat(doel, tokens("Pap havermout- bereid m volle melk ongezoet"))).toBe(0);
  });

  it("verkiest het ingrediënt boven het gerecht", () => {
    expect(beste("Margarine")).toBe("Margarine 80% vet >24 g verz vetz gezouten");
    expect(beste("Mozzarella")).toBe("Kaas Mozzarella gemaakt v koemelk");
  });

  it("markeert een bewerkt product als zwakke kandidaat, niet als sterke", () => {
    const k = kandidaten("Kikkererwten", lijst, 1, 0.5)[0];
    expect(k.v.naam).toContain("leblebi");
    expect(k.score).toBeLessThan(STERKE_SCORE);
  });

  it("geeft een sterke kandidaat als alle woorden kloppen", () => {
    const k = kandidaten("Halfvolle melk", lijst, 1, 0.5)[0];
    expect(k.v.naam).toBe("Melk halfvolle");
    expect(k.score).toBeGreaterThanOrEqual(STERKE_SCORE);
  });
});

describe("de bestaande code lezen", () => {
  const foodSources = parseFoodSources(fs.readFileSync(path.join("src", "data", "nutrition", "food-sources.ts"), "utf8"));

  it("vindt rijen voor alle vijf de kernstoffen", () => {
    const stoffen = new Set(foodSources.map((x) => x.stof));
    expect([...stoffen].sort()).toEqual(["magnesium", "omega3", "protein", "vitamin_d", "zinc"]);
    expect(foodSources.length).toBeGreaterThan(100);
  });

  it("leest de huidige waarde en bron per rij", () => {
    const sardines = foodSources.find((x) => x.key === "sardines" && x.stof === "vitamin_d");
    expect(sardines?.huidig).toMatchObject({ origin: "nevo", ref: "355", eenheid: "µg" });
  });

  it("leest evenveel catalogusregels als de USDA-parser", () => {
    const labels = parseCatalogusLabels(fs.readFileSync(path.join("src", "data", "nutrition", "food-catalog.ts"), "utf8"));
    expect(labels.map((l) => l.key).sort()).toEqual(leesCatalogus().map((e) => e.key).sort());
  });
});

/**
 * De reproduceerbaarheidstest uit BESLUIT_NEVO_BRONVERMELDING.md: elke
 * `origin: "nevo"`-waarde in food-sources.ts moet exact in het brondbestand
 * staan. Het bestand (88 MB) staat niet in git, dus deze test draait alleen waar
 * het lokaal ligt; in CI wordt hij overgeslagen.
 */
const NEVO_CSV = process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");

describe.skipIf(!fs.existsSync(NEVO_CSV))("tegen het echte NEVO-bestand", () => {
  // Pas in beforeAll lezen: de body van een overgeslagen describe draait wel.
  let data;
  let foodSources;
  beforeAll(() => {
    data = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(NEVO_CSV, "utf8")));
    foodSources = parseFoodSources(fs.readFileSync(path.join("src", "data", "nutrition", "food-sources.ts"), "utf8"));
    // Het hele NEVO-bestand inlezen duurt naast een draaiende dev-server soms langer dan de standaard 10 s.
  }, 60_000);

  it("is versie 2025/9.0 en bevat 2.328 voedingsmiddelen zonder onleesbare regels", () => {
    expect(data.versies).toEqual(["NEVO-Online 2025 9.0"]);
    expect(data.voedingsmiddelen).toHaveLength(2328);
    expect(data.problemen).toEqual([]);
  });

  it("heeft kcal, eiwit, vet, koolhydraten en vezels voor vrijwel elk voedingsmiddel", () => {
    const volledig = data.voedingsmiddelen.filter((v) => ["ENERCC", "PROT", "FAT", "CHO", "FIBT"].every((c) => v.stoffen[c]));
    expect(volledig.length).toBeGreaterThanOrEqual(2300);
  });

  it("bevestigt elke NEVO-waarde in food-sources.ts exact", () => {
    const perCode = new Map(data.voedingsmiddelen.map((v) => [v.code, v]));
    const afwijkend = [];
    for (const rij of foodSources.filter((x) => x.huidig?.origin === "nevo")) {
      const v = perCode.get(rij.huidig.ref);
      const nevo = v ? nevoWaardeVoor(v, rij._stof, data.stoffen) : null;
      if (nevo === null || Math.abs(nevo - rij.huidig.waarde) > Math.max(0.05, rij.huidig.waarde * 0.005)) {
        afwijkend.push(`${rij.stof}/${rij.key} (NEVO ${rij.huidig.ref}): code ${rij.huidig.waarde}, bestand ${nevo}`);
      }
    }
    expect(afwijkend).toEqual([]);
  });
});
