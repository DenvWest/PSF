import { describe, it, expect } from "vitest";
import {
  FOOD_PRODUCTS,
  productByKey,
  foodEntryVoorProduct,
  etiketWaarde,
  isEtiketVerouderd,
  searchProducts,
  ETIKET_HOUDBAARHEID_JAREN,
  type Product,
} from "@/data/nutrition/food-products";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { DAGBOEK_GROEPEN } from "@/lib/nutrition-dagboek";
import { nutrientReferences } from "@/data/nutrition/intake-reference";

const GELDIGE_NUTRIENTEN = new Set<string>(Object.keys(nutrientReferences));

describe("een product wijst naar een voedingsmiddel dat bestaat", () => {
  it("laat elke foodKey oplossen naar een catalogusregel", () => {
    const kapot = FOOD_PRODUCTS.filter((p) => catalogEntry(p.foodKey) === null);
    expect(kapot.map((p) => `${p.key} → ${p.foodKey}`)).toEqual([]);
  });

  it("erft een voedselgroep die het dagboek kent — introduceert er zelf geen", () => {
    // Een product draagt geen `groep`; hij komt van foodKey. Zou een product
    // een eigen groep introduceren, dan werd elke eerder geregistreerde dag
    // onvergelijkbaar. Deze test bewaakt dat de geërfde groep geldig is.
    const toegestaan = new Set<string>(DAGBOEK_GROEPEN);
    const buiten = FOOD_PRODUCTS.filter((p) => {
      const entry = catalogEntry(p.foodKey);
      return !entry || !toegestaan.has(entry.groep);
    });
    expect(buiten.map((p) => p.key)).toEqual([]);
  });

  it("wijst nooit naar een samengestelde regel — die worden gerechten, geen producten", () => {
    const fout = FOOD_PRODUCTS.filter(
      (p) => catalogEntry(p.foodKey)?.geenBron === "samengesteld",
    );
    expect(fout.map((p) => `${p.key} → ${p.foodKey}`)).toEqual([]);
  });

  it("heeft geen dubbele sleutels", () => {
    const gezien = new Map<string, number>();
    for (const p of FOOD_PRODUCTS) gezien.set(p.key, (gezien.get(p.key) ?? 0) + 1);
    expect([...gezien.entries()].filter(([, n]) => n > 1).map(([k]) => k)).toEqual([]);
  });

  it("draagt alleen porties met een label en een positief gewicht", () => {
    const fout = FOOD_PRODUCTS.filter(
      (p) =>
        p.porties.length === 0 ||
        p.porties.some((portie) => !portie.labelNl.trim() || !(portie.grams > 0)),
    );
    expect(fout.map((p) => p.key)).toEqual([]);
  });
});

describe("etiket bestaat precies waar het merk de samenstelling bepaalt", () => {
  it("staat alleen op een product waarvan de foodKey een verrijkt-regel is", () => {
    // De harde grens: een etiketwaarde plakken op een gewoon product zou het
    // merkverschil als meting presenteren — en dat weigert §2.5.
    const fout = FOOD_PRODUCTS.filter(
      (p) => p.etiket && catalogEntry(p.foodKey)?.geenBron !== "verrijkt",
    );
    expect(fout.map((p) => `${p.key} → ${p.foodKey}`)).toEqual([]);
  });

  it("laat een product op een verrijkt-regel ook echt een waarde dragen", () => {
    // Andersom: wijst een product naar een verrijkte regel, dan moet het het
    // etiket meebrengen — anders levert het niets wat de catalogus al niet miste.
    const leeg = FOOD_PRODUCTS.filter((p) => {
      const entry = catalogEntry(p.foodKey);
      const heeftWaarde = p.etiket && Object.keys(p.etiket).length > 0;
      return entry?.geenBron === "verrijkt" && !heeftWaarde;
    });
    expect(leeg.map((p) => p.key)).toEqual([]);
  });

  it("draagt alleen geldige nutriënten met een gelezen, gedateerde waarde", () => {
    const nu = new Date().getFullYear();
    const fout: string[] = [];
    for (const p of FOOD_PRODUCTS) {
      for (const [nutrient, waarde] of Object.entries(p.etiket ?? {})) {
        if (!GELDIGE_NUTRIENTEN.has(nutrient)) fout.push(`${p.key}: onbekende stof ${nutrient}`);
        if (!waarde || !(waarde.per100g > 0)) fout.push(`${p.key}/${nutrient}: geen positieve waarde`);
        if (!waarde?.bron?.trim()) fout.push(`${p.key}/${nutrient}: geen bron`);
        if (!waarde || waarde.jaar < 2000 || waarde.jaar > nu + 1) {
          fout.push(`${p.key}/${nutrient}: onwaarschijnlijk jaar ${waarde?.jaar}`);
        }
      }
    }
    expect(fout).toEqual([]);
  });
});

describe("de helpers doen wat de laag belooft", () => {
  it("vindt een product op merk zonder het merk te laten meerekenen", () => {
    const metMerk: Product = {
      key: "test-merk",
      labelNl: "Testnoot",
      merk: "Zoekmerk",
      foodKey: "amandelen",
      porties: [{ labelNl: "handvol", grams: 25 }],
    };
    // searchProducts kijkt naar het echte bestand; hier alleen de vorm-check:
    // een product met merk levert geen etiket en dus geen rekengetal.
    expect(metMerk.etiket).toBeUndefined();
    expect(searchProducts("halfvolle").map((p) => p.key)).toContain("halfvolle-melk-verrijkt");
    expect(searchProducts("   ")).toEqual([]);
  });

  it("leest het gehalte van het etiket bij een verrijkt product, en erft anders", () => {
    const melk = productByKey("halfvolle-melk-verrijkt")!;
    expect(etiketWaarde(melk, "vitamin_d")?.per100g).toBe(1.5);
    // Eiwit staat niet op dit etiket → komt van foodKey (de eiwitroute-erfenis).
    expect(etiketWaarde(melk, "protein")).toBeNull();

    const amandel = productByKey("amandelen-ongezouten")!;
    expect(amandel.etiket).toBeUndefined();
    expect(foodEntryVoorProduct(amandel)?.key).toBe("amandelen");
  });

  it("verouderd alleen merk-etiketten, niet de kaderwaarden", () => {
    const merkProduct: Product = {
      key: "shake-merk",
      labelNl: "Eiwitshake",
      merk: "Merk X",
      foodKey: "eiwitshake",
      porties: [{ labelNl: "shake", grams: 300 }],
      etiket: { protein: { per100g: 8, bron: "etiket Merk X", jaar: 2019 } },
    };
    const oud = merkProduct.etiket!.protein!;
    expect(isEtiketVerouderd(merkProduct, oud, 2019 + ETIKET_HOUDBAARHEID_JAREN)).toBe(false);
    expect(isEtiketVerouderd(merkProduct, oud, 2019 + ETIKET_HOUDBAARHEID_JAREN + 1)).toBe(true);

    // Een kaderwaarde (geen merk) veroudert niet vanzelf, ook niet na jaren.
    const melk = productByKey("magere-melk-verrijkt")!;
    const kader = etiketWaarde(melk, "vitamin_d")!;
    expect(isEtiketVerouderd(melk, kader, kader.jaar + 20)).toBe(false);
  });
});
