import { describe, it, expect } from "vitest";
import {
  FOOD_SOURCES,
  amountForPortion,
  type FoodSource,
} from "@/data/nutrition/food-sources";
import { NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";

/**
 * Interne-consistentie-audit van de bronrijen — de API-onafhankelijke helft van
 * "een eerlijke audit van wat er staat" (ONDERZOEK etappe 3, taak 1.3). De
 * volledige audit legt elke waarde naast het echte FDC-record; dat vraagt
 * netwerktoegang. Deze tests vragen dat niet: ze bewaken wat je zonder de bron
 * al kunt controleren — dat de eenheid bij de stof past, dat de afgeleide
 * portiewaarde klopt bij de gepubliceerde per-100 g-waarde, en dat een
 * `observed`-band een echte band is.
 *
 * Ze bewaken twee dingen tegelijk: de 85 WebSearch-rijen van september 2026, én
 * de rijen die een latere `scripts/usda-extract.mjs`-run met `observed` vult.
 */

const EENHEID_PER_STOF: Record<NutrientId, "g" | "mg" | "µg"> = {
  protein: "g",
  omega3: "mg",
  magnesium: "mg",
  zinc: "mg",
  vitamin_d: "µg",
};

const ALLE_RIJEN: readonly { id: NutrientId; source: FoodSource }[] =
  NUTRIENT_IDS.flatMap((id) =>
    (FOOD_SOURCES[id] as FoodSource[]).map((source) => ({ id, source })),
  );

/** De grammen uit een portielabel als "25 g (handvol)"; null bij ml of stuks. */
function gramsUitPortie(portionNl: string): number | null {
  const m = portionNl.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

describe("de bronrijen zijn intern consistent — audit zonder de brondataset", () => {
  it("draagt per stof de juiste eenheid: eiwit in g, mineralen in mg, vitamine D in µg", () => {
    const fout = ALLE_RIJEN.filter(
      ({ id, source }) =>
        source.nutrientValue && source.nutrientValue.unit !== EENHEID_PER_STOF[id],
    ).map(
      ({ id, source }) =>
        `${id}/${source.key}: ${source.nutrientValue?.unit} ≠ ${EENHEID_PER_STOF[id]}`,
    );
    expect(fout).toEqual([]);
  });

  it("leidt `amount` recht af uit de gepubliceerde waarde × de portie", () => {
    // `amount` is onze bewerking van `nutrientValue.value` naar de portie in
    // `portionNl`. Wijkt hij af, dan is er een getal met de hand aangepast
    // zonder het andere mee te nemen — precies het soort stille fout dat een
    // audit hoort te vangen. Alleen rijen met een gepubliceerde waarde én een
    // portie in grammen: ml en stuks lopen via de portie-dictionary.
    const fout: string[] = [];
    for (const { id, source } of ALLE_RIJEN) {
      if (!source.nutrientValue || source.amount === null) continue;
      const grams = gramsUitPortie(source.portionNl);
      if (grams === null) continue;
      const verwacht = amountForPortion(source.nutrientValue, grams);
      if (verwacht !== null && Math.abs(verwacht - source.amount) > 0.15) {
        fout.push(
          `${id}/${source.key}: amount ${source.amount} ≠ ${verwacht} ` +
            `(=${source.nutrientValue.value}×${grams}/100)`,
        );
      }
    }
    expect(fout).toEqual([]);
  });

  it("laat een observed-band een echte band zijn: min ≤ median ≤ max, en de waarde valt erbinnen", () => {
    // Vandaag draagt geen rij `observed` (de WebSearch-route leverde hem niet).
    // Deze test staat er voor de API-run die hem wél vult: één monster is geen
    // spreiding, en een band waar de waarde buiten valt is een fout.
    const fout: string[] = [];
    for (const { id, source } of ALLE_RIJEN) {
      const o = source.nutrientValue?.observed;
      if (!o) continue;
      if (!(o.min <= o.max)) fout.push(`${id}/${source.key}: min > max`);
      if (!(o.samples >= 1)) fout.push(`${id}/${source.key}: samples < 1`);
      if (o.median != null && (o.median < o.min || o.median > o.max)) {
        fout.push(`${id}/${source.key}: median buiten [min,max]`);
      }
      const waarde = source.nutrientValue!.value;
      if (waarde < o.min || waarde > o.max) {
        fout.push(`${id}/${source.key}: value ${waarde} buiten [${o.min},${o.max}]`);
      }
    }
    expect(fout).toEqual([]);
  });
});

describe("de USDA-import van 17 september 2026 — de vallen die hij opleverde", () => {
  /**
   * De eenheid staat al onder "intern consistent" hierboven; wat deze groep
   * toevoegt is de orde van grootte. USDA publiceert EPA en DHA in **gram**,
   * terwijl deze tabel omega-3 in milligram voert: gekweekte zalm staat er als
   * `0.318 g` EPA en `0.585 g` DHA, samen 903 mg. De eenheidstest ziet zo'n
   * fout niet — `unit: "mg"` klopt dan nog steeds, alleen de waarde is 1000×
   * te klein. Dat is geen getal dat opvalt bij het nalezen.
   */
  it("houdt elke omega-3-waarde in een orde van grootte die bij mg hoort", () => {
    // Een EPA+DHA-gehalte per 100 g ligt tussen ~10 mg (mager wit vis) en
    // ~4.000 mg (makreel, haring). Onder de 10 staat er vrijwel zeker een
    // gram-waarde die niet is omgerekend; boven de 10.000 een dubbele conversie.
    const fout = ALLE_RIJEN.filter(({ id, source }) => {
      if (id !== "omega3" || !source.nutrientValue) return false;
      const v = source.nutrientValue.value;
      return v > 0 && (v < 10 || v > 10000);
    }).map(({ source }) => `${source.key}: ${source.nutrientValue?.value} mg/100g`);
    expect(fout).toEqual([]);
  });

  it("laat ALA-bronnen op `amount: null` staan, ook na een USDA-import", () => {
    // Walnoten en lijnzaad dragen wél een USDA-record, maar hun EPA/DHA is nul:
    // ALA zet maar voor enkele procenten om. Een import die hier een getal
    // neerzet, presenteert een ALA-bron als visvervanger.
    const fout = ALLE_RIJEN.filter(
      ({ source }) => source.omega3Kind === "ala" && source.amount !== null,
    ).map(({ source }) => `${source.key}: amount ${source.amount}`);
    expect(fout).toEqual([]);
  });

  it("draagt `observed` alleen waar er meer dan één monster is", () => {
    // `samples` is USDA `dataPoints`. Eén monster is geen spreiding — dan hoort
    // de rij terug te vallen op de klassenband uit ONDERZOEK §1.7 in plaats van
    // een band van één meting te suggereren.
    const fout = ALLE_RIJEN.filter(
      ({ source }) =>
        source.nutrientValue?.observed && source.nutrientValue.observed.samples < 2,
    ).map(
      ({ source }) =>
        `${source.key}: samples ${source.nutrientValue?.observed?.samples}`,
    );
    expect(fout).toEqual([]);
  });

  it("citeert bij elke observed-band het USDA-record waar hij vandaan komt", () => {
    // `observed` bestaat alleen in FDC. Een band zonder USDA-herkomst is met de
    // hand ingevoerd en daarmee niet te controleren.
    const fout = ALLE_RIJEN.filter(({ source }) => {
      const nv = source.nutrientValue;
      return nv?.observed && (nv.source.origin !== "usda" || !nv.source.ref);
    }).map(({ source }) => `${source.key}: ${source.nutrientValue?.source.origin}`);
    expect(fout).toEqual([]);
  });
});

describe("de USDA-audit van 17 september 2026 — één record, één voedingsmiddel", () => {
  /**
   * De audit legde alle 40 WebSearch-rijen naast hun echte FDC-record en vond
   * vier fouten die geen enkele test ving:
   *
   *   - `tuinbonen-gekookt` wees naar 173735 (zwarte bonen) terwijl de waarden
   *     7,6 g en 43 mg exact bij 173753 (tuinbonen) horen — twee cijfers
   *     omgewisseld, data goed, citatie fout.
   *   - `feta` droeg 19,7 g eiwit, de waarde van Foundation 2259796, onder het
   *     id van SR 173420 (14,2 g). De waarde van het ene record, het id van het
   *     andere.
   *   - `melk-vol` stond als "SR Legacy" gelabeld terwijl 746782 Foundation is.
   *   - vier rijen weken 2–4 % af omdat een afgerond getal was overgenomen.
   *
   * Wat die vier gemeen hebben: het getal was plausibel en de rij zag er af
   * uit. Alleen het record ernaast leggen bracht het aan het licht. Deze tests
   * bewaken wat daarvan zonder netwerktoegang te controleren is.
   */
  it("laat geen twee verschillende voedingsmiddelen hetzelfde FDC-record delen", () => {
    // Een gedeeld record betekent óf een foute toekenning (de val uit de eerste
    // API-run: zes groenten kregen hetzelfde boerenkoolrecord), óf een bewuste
    // aanname die dan in een qualityNote hoort te staan.
    const perRecord = new Map<string, Set<string>>();
    for (const { source } of ALLE_RIJEN) {
      const ref = source.nutrientValue?.source;
      if (ref?.origin !== "usda" || !ref.ref) continue;
      if (!perRecord.has(ref.ref)) perRecord.set(ref.ref, new Set());
      perRecord.get(ref.ref)!.add(source.key);
    }
    const gedeeld = [...perRecord.entries()]
      .filter(([, keys]) => keys.size > 1)
      .map(([ref, keys]) => ({ ref, keys: [...keys] }));

    // Jonge en belegen kaas delen bewust "Cheese, gouda": USDA kent geen
    // rijpingsgraad. Die aanname staat in beide rijen als qualityNote.
    const TOEGESTAAN = [["belegen-kaas", "jonge-kaas"]];
    const onverklaard = gedeeld.filter(
      ({ keys }) =>
        !TOEGESTAAN.some(
          (toe) =>
            toe.length === keys.length && toe.every((k) => keys.includes(k)),
        ),
    );
    expect(onverklaard).toEqual([]);
  });

  it("verantwoordt een bewust gedeeld record in een qualityNote op elke rij", () => {
    // Zonder die notitie is niet te zien dat twee identieke getallen een
    // aanname zijn en geen twee losse metingen.
    const fout = ALLE_RIJEN.filter(
      ({ source }) =>
        ["belegen-kaas", "jonge-kaas"].includes(source.key) &&
        source.nutrientValue &&
        !source.qualityNote,
    ).map(({ id, source }) => `${id}/${source.key}`);
    expect(fout).toEqual([]);
  });

  it("citeert een fdcId als cijferreeks, niet als naam of losse tekst", () => {
    // Een `ref` die geen fdcId is, is niet tegen FDC te leggen — en dan kan de
    // audit van deze ronde niet herhaald worden.
    const fout = ALLE_RIJEN.filter(({ source }) => {
      const ref = source.nutrientValue?.source;
      return ref?.origin === "usda" && (!ref.ref || !/^\d{3,8}$/.test(ref.ref));
    }).map(({ source }) => `${source.key}: ref "${source.nutrientValue?.source.ref}"`);
    expect(fout).toEqual([]);
  });

  it("voert bij een USDA-bron een datatype dat FDC ook kent", () => {
    // "SR Legacy" waar het record Foundation is (melk-vol) maakt de citatie
    // onnauwkeurig: het datatype bepaalt of er observed-data hoort te zijn.
    const fout = ALLE_RIJEN.filter(({ source }) => {
      const ref = source.nutrientValue?.source;
      return (
        ref?.origin === "usda" &&
        ref.edition !== "Foundation" &&
        ref.edition !== "SR Legacy"
      );
    }).map(({ source }) => `${source.key}: edition "${source.nutrientValue?.source.edition}"`);
    expect(fout).toEqual([]);
  });
});
