import { describe, expect, it } from "vitest";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import {
  parseStoredScoreInputs,
  scoreInputOptions,
  staticToStored,
  validateScoreInputs,
  type StoredScoreInputs,
} from "@/lib/product-admin/score-inputs";
import { backfillScoreInputs } from "@/lib/supplement-catalog-db/score-inputs-backfill";

const magnesiumSlug = Object.keys(PRODUCT_SCORE_INPUTS.magnesium)[0];

function valid(): StoredScoreInputs {
  return {
    formKey: scoreInputOptions("magnesium").forms[0].key,
    label: {
      werkzameStofGekwantificeerd: true,
      dagdoseringVermeld: true,
      samenstellingUitgesplitst: true,
      proprietaryBlend: false,
    },
    certificeringen: [],
    kwaliteitsmarkers: {},
    dosisOnzekerReden: null,
  };
}

describe("staticToStored", () => {
  it("laat de prijsvelden weg (de score is prijsvrij)", () => {
    const stored = staticToStored(PRODUCT_SCORE_INPUTS.magnesium[magnesiumSlug]);
    expect(stored).not.toHaveProperty("prijsPerEtiketdagCent");
    expect(stored).not.toHaveProperty("prijsGecontroleerdOp");
  });

  it("levert voor alle statische producten invoer op die de validatie doorstaat", () => {
    for (const [category, products] of Object.entries(PRODUCT_SCORE_INPUTS)) {
      for (const [slug, inputs] of Object.entries(products)) {
        const error = validateScoreInputs(category as keyof typeof PRODUCT_SCORE_INPUTS, staticToStored(inputs));
        expect(error, `${category}/${slug}`).toBeNull();
      }
    }
  });
});

describe("parseStoredScoreInputs", () => {
  it("leest een round-trip terug", () => {
    const stored = valid();
    expect(parseStoredScoreInputs(JSON.parse(JSON.stringify(stored)))).toEqual(stored);
  });

  it("geeft null bij ontbrekende of verkeerde velden", () => {
    expect(parseStoredScoreInputs(null)).toBeNull();
    expect(parseStoredScoreInputs("tekst")).toBeNull();
    expect(parseStoredScoreInputs({ formKey: "x" })).toBeNull();
    expect(parseStoredScoreInputs({ formKey: "x", label: { werkzameStofGekwantificeerd: "ja" } })).toBeNull();
  });

  it("negeert niet-booleaanse markers en niet-tekst certificeringen", () => {
    const parsed = parseStoredScoreInputs({ ...valid(), kwaliteitsmarkers: { a: true, b: "ja" }, certificeringen: ["x", 3] });
    expect(parsed?.kwaliteitsmarkers).toEqual({ a: true });
    expect(parsed?.certificeringen).toEqual(["x"]);
  });
});

describe("validateScoreInputs", () => {
  it("accepteert geldige invoer", () => {
    expect(validateScoreInputs("magnesium", valid())).toBeNull();
  });
  it("wijst een onbekende vorm af", () => {
    expect(validateScoreInputs("magnesium", { ...valid(), formKey: "bestaat-niet" })).not.toBeNull();
  });
  it("wijst een onbekende marker af", () => {
    expect(validateScoreInputs("magnesium", { ...valid(), kwaliteitsmarkers: { verzonnen: true } })).not.toBeNull();
  });
  it("wijst een blend af die tegelijk uitgesplitst is", () => {
    const inputs = valid();
    inputs.label.proprietaryBlend = true;
    inputs.label.samenstellingUitgesplitst = true;
    expect(validateScoreInputs("magnesium", inputs)).not.toBeNull();
  });
});

describe("backfillScoreInputs", () => {
  function fakeDb(existing: Record<string, unknown>) {
    const updates: Record<string, unknown>[] = [];
    const db = {
      from() {
        return {
          select() {
            return {
              eq(_col: string, slug: string) {
                return {
                  async maybeSingle() {
                    if (slug === "bestaat-niet") return { data: null, error: null };
                    return { data: { id: `id-${slug}`, score_inputs: existing[slug] ?? null }, error: null };
                  },
                };
              },
            };
          },
          update(values: Record<string, unknown>) {
            return {
              async eq() {
                updates.push(values);
                return { error: null };
              },
            };
          },
        };
      },
    };
    return { db, updates };
  }

  it("schrijft alleen rijen zonder bestaande waarde en overschrijft niets", async () => {
    const { db, updates } = fakeDb({ [magnesiumSlug]: { formKey: "handmatig" } });
    const total = Object.values(PRODUCT_SCORE_INPUTS).reduce((n, products) => n + Object.keys(products).length, 0);
    const result = await backfillScoreInputs(db as never);
    expect(result.skippedExisting).toBe(1);
    expect(result.written).toBe(total - 1);
    expect(updates).toHaveLength(total - 1);
    expect(result.errors).toEqual([]);
  });
});
