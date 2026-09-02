import { parseNutritionLogSliders } from "@/lib/nutrition-answer-labels";
import {
  buildNutritionFactRows,
  resolveNutritionFocusLayer,
  nutritionRowsForLayer,
  type NutritionFactRow,
  type NutritionLadderReport,
  type NutritionLadderLayerId,
} from "@/lib/nutrition-ladder";

/**
 * De conclusiezin boven het voedingsbeeld — één zin die zegt waar hij staat.
 *
 * Beweging en slaap bevriezen hun kop in de checkin-snapshot; voeding heeft
 * die snapshot niet, dus de zin wordt hier afgeleid uit dezelfde rijen die de
 * ladder draagt. Dat is met opzet: readout-kop en laagstaat kunnen dan niet
 * uiteenlopen, want ze komen uit één berekening (lock 4, spiegelbeeld van
 * `resolveMovementFocusPriority`).
 *
 * De zin noemt nooit een score en nooit een laagnummer. Hij noemt de rij die
 * de winst draagt, in de woorden van de gebruiker.
 */

/**
 * De kop hangt aan twee dingen, niet aan één: de laag waar de winst zit, én of
 * de lagen erboven écht staan of alleen geen gat hebben.
 *
 * Dat onderscheid is de reden dat dit geen platte tabel is. "Je eetbasis
 * staat" boven een laag 1 die op *Houd in de gaten* staat is een tegenspraak
 * die de gebruiker in één blik ziet — de badge zegt iets anders dan de zin.
 * Een `near` erboven levert daarom de "grotendeels"-variant.
 */
const LAYER_CONCLUSION: Record<
  NutritionLadderLayerId,
  (rowLabel: string, aboveOnOrder: boolean) => string
> = {
  1: (row) => `Je eetbasis staat er half — je ${row.toLowerCase()} draagt hem nog niet.`,
  2: (row, above) =>
    above
      ? `Je eetbasis staat. Wat er nu telt is de kwaliteit ervan, te beginnen bij je ${row.toLowerCase()}.`
      : `Je eetbasis staat er grotendeels. De duidelijkste winst ligt nu bij je ${row.toLowerCase()}.`,
  3: (row, above) =>
    above
      ? `Je basis en je kwaliteit staan. Wat overblijft is de verdeling — je ${row.toLowerCase()}.`
      : `Je bord is op orde op de punten die tellen. Wat overblijft is de verdeling — je ${row.toLowerCase()}.`,
  4: () => "Je eetbeeld staat. Wat er nu telt is wat er bij jouw situatie past.",
  5: () => "Je eetbeeld staat. Meten en timen zijn de volgende gereedschappen, geen fundament.",
  6: () => "Je eetbasis staat. Wat je bord niet dekt, mag je nu vergelijken.",
};

/** Alles op orde — dan is volhouden het werk, en dat mag ongemakkelijk klinken. */
const ALL_ON_ORDER =
  "Je eetbasis staat. Vanaf hier is volhouden het werk — er is geen makkelijke winst meer te halen.";

/** Geen enkele rij beoordeelbaar (alles opt-out of niets ingevuld). */
const NOTHING_JUDGED =
  "Je antwoorden staan genoteerd, maar ze leveren geen meetlat op — jouw eetpatroon is hier het ijkpunt.";

export function buildNutritionHeadline(rows: readonly NutritionFactRow[]): string {
  if (rows.length === 0) {
    return NOTHING_JUDGED;
  }
  const focus = resolveNutritionFocusLayer(rows);
  if (focus === null) {
    const judged = rows.filter((row) => row.status !== "own");
    return judged.length === 0 ? NOTHING_JUDGED : ALL_ON_ORDER;
  }
  const layerRows = nutritionRowsForLayer(focus, rows);
  const driver =
    layerRows.find((row) => row.status === "below") ??
    layerRows.find((row) => row.status === "near") ??
    layerRows[0];
  const aboveOnOrder = rows
    .filter((row) => row.layer < focus && row.status !== "own")
    .every((row) => row.status === "meets");
  return LAYER_CONCLUSION[focus](driver?.label ?? "eetbasis", aboveOnOrder);
}

/**
 * De dieetcontext uit `raw_inputs`. Zonder die twee velden is een opt-out niet
 * van een nul te onderscheiden, dus ze horen bij het rapport en niet ernaast.
 */
function parseDietContext(raw: unknown): { preference: string; allergies: string[] } {
  if (!raw || typeof raw !== "object") {
    return { preference: "none", allergies: [] };
  }
  const record = raw as { preference?: unknown; allergies?: unknown };
  const preference = typeof record.preference === "string" ? record.preference : "none";
  const allergies = Array.isArray(record.allergies)
    ? record.allergies.filter((entry): entry is string => typeof entry === "string")
    : [];
  return { preference, allergies };
}

export function parseNutritionLadderReport(raw: unknown): NutritionLadderReport | null {
  const sliders = parseNutritionLogSliders(raw);
  if (!sliders) {
    return null;
  }
  return { sliders, ...parseDietContext(raw) };
}

/** Rijen rechtstreeks uit een opgeslagen log — de weg die het dashboard loopt. */
export function buildNutritionFactRowsFromRaw(raw: unknown): NutritionFactRow[] {
  const report = parseNutritionLadderReport(raw);
  return report ? buildNutritionFactRows(report) : [];
}
