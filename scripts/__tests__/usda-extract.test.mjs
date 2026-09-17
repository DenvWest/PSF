import { describe, it, expect } from "vitest";
import {
  QUERIES,
  NIET_UIT_USDA,
  leesCatalogus,
  bouwDoelen,
} from "../usda-extract.mjs";

const entries = leesCatalogus();
const doelen = bouwDoelen(entries);
const identiteiten = new Set(doelen.map((d) => d.key));

describe("de catalogus-parser leest food-catalog.ts betrouwbaar", () => {
  it("vindt elke regel met een schone key", () => {
    expect(entries.length).toBeGreaterThan(300);
    const kapot = entries.filter(
      (e) => !e.key || /["()]/.test(e.key) || e.key.includes("f "),
    );
    expect(kapot).toEqual([]);
  });

  it("verdeelt elke regel over precies één van drie stapels", () => {
    const open = entries.filter((e) => e.bron === null && !e.geenBron);
    const gevuld = entries.filter((e) => e.bron !== null);
    const geen = entries.filter((e) => e.geenBron);
    // Disjunct: een regel met bron kan geen geenBron dragen (zie food-catalog.test.ts).
    expect(gevuld.every((e) => !e.geenBron)).toBe(true);
    expect(open.length + gevuld.length + geen.length).toBe(entries.length);
  });
});

describe("de zoeklijst blijft aan de catalogus vast — geen momentopname meer", () => {
  it("laat elke QUERIES-sleutel op een bestaande fetchbare identiteit wijzen", () => {
    // Dit is de invariant die de vorige lijst miste: een query die naar niets
    // (meer) wijst, is dode instructie. Verplaats een regel naar geenBron of
    // hernoem een key, en deze test wijst de verweesde query aan.
    const verweesd = Object.keys(QUERIES).filter((k) => !identiteiten.has(k));
    expect(verweesd).toEqual([]);
  });

  it("zoekt nooit naar een geenBron- of NIET_UIT_USDA-identiteit", () => {
    const geenBronKeys = new Set(entries.filter((e) => e.geenBron).map((e) => e.key));
    const foutGesorteerd = [...identiteiten].filter(
      (id) => geenBronKeys.has(id) || id in NIET_UIT_USDA,
    );
    expect(foutGesorteerd).toEqual([]);
  });

  it("dekt de hele catalogus: elke fetchbare regel valt onder een doel", () => {
    const fetchbaar = entries.filter(
      (e) => !e.geenBron && !((e.bron ?? e.key) in NIET_UIT_USDA),
    );
    const gedekt = new Set(doelen.flatMap((d) => d.catalogusKeys));
    const ongedekt = fetchbaar.filter((e) => !gedekt.has(e.key));
    expect(ongedekt.map((e) => e.key)).toEqual([]);
  });
});

describe("een doel weet of het audit of nieuw werk is", () => {
  it("markeert een doel met een gevulde bron als audit, anders als open", () => {
    const bronPerIdentiteit = new Map();
    for (const e of entries) {
      if (e.bron) bronPerIdentiteit.set(e.bron, true);
    }
    for (const d of doelen) {
      const verwacht = bronPerIdentiteit.has(d.key) ? "audit" : "open";
      expect(`${d.key}:${d.soort}`).toBe(`${d.key}:${verwacht}`);
    }
  });
});

describe("elke query draagt een kern — de vangrail tegen foute matches", () => {
  // Waarom deze test bestaat: in de eerste echte API-run (17 sep 2026) zat 13
  // van de 53 rijen ernaast. "herring atlantic raw" gaf kabeljauw, "black beans
  // cooked boiled" gaf boerenkool, "tofu raw firm" gaf bieten. FDC sorteert op
  // relevantie en geeft bij een zoekterm zonder echte treffer gewoon het
  // populairste record dat één woord deelt. Zonder kern is elke nieuwe query
  // een herhaling van die fout, met een getal dat er goed uitziet.
  it("heeft voor elke query minstens één kern-term", () => {
    const zonder = Object.entries(QUERIES)
      .filter(([, v]) => !Array.isArray(v.kern) || v.kern.length === 0)
      .map(([k]) => k);
    expect(zonder).toEqual([]);
  });

  it("gebruikt kern-termen in kleine letters — de vergelijking is lowercase", () => {
    const fout = Object.entries(QUERIES)
      .flatMap(([k, v]) => (v.kern ?? []).map((t) => [k, t]))
      .filter(([, t]) => t !== t.toLowerCase());
    expect(fout).toEqual([]);
  });

  it("laat de kern niet naar een ander voedingsmiddel wijzen dan de query", () => {
    // Een kern die nergens in de eigen query voorkomt, is een typefout of een
    // verkeerd gekopieerde regel. "beans" bij `haring` zou hier vallen.
    const losgeraakt = Object.entries(QUERIES).filter(([, v]) => {
      const q = v.q.toLowerCase();
      return !(v.kern ?? []).some((t) => {
        const stam = t.toLowerCase().replace(/[,\s].*$/, "").replace(/s$/, "");
        return q.includes(stam);
      });
    });
    expect(losgeraakt.map(([k]) => k)).toEqual([]);
  });
});
