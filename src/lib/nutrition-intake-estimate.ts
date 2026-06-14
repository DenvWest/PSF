/**
 * Deterministische inname-schat-engine voor de voedings zelf-evaluatie-lus (F1).
 *
 * Regels:
 * - Pure functies, geen I/O, geen randomness.
 * - Grof en frequentie-gebaseerd — geen grammen, geen BMR/TDEE/macro.
 * - Ontbrekende input → band "around" (neutraal, nooit alarmerend).
 * - Drempelwaarden komen uit de referentietabel, niet hardcoded hier.
 */

import {
  nutrientReferences,
  NUTRIENT_IDS,
  type NutrientId,
} from "@/data/nutrition/intake-reference";

/** Semver van de engine — wordt opgeslagen in intake_intake_log.estimate_version (F0). */
// 1.1.0: magnesium-vraag meet nu magnesium-rijke voeding i.p.v. groente/fruit; vragen naar gewoonte-venster (gewone dag/week).
export const ESTIMATE_VERSION = "1.1.0";

/**
 * Plat record van frequentie-antwoorden uit het gewoonte-zelfrapport (gewone dag/week).
 * Dit is exact de vorm die in intake_intake_log.raw_inputs (F0) wordt opgeslagen.
 * Alle velden zijn optioneel — ontbrekende input levert band "around".
 */
export interface NutritionSelfReport {
  /** Porties eiwitrijke voeding (vlees/vis/ei/zuivel/peulvruchten) per dag. */
  proteinMealsPerDay?: number;
  /** Porties vette vis (zalm, makreel, haring, sardines) per week. */
  oilyFishPerWeek?: number;
  /** Porties magnesium-rijke voeding (bladgroenten, noten, peulvruchten) op een gewone dag.
   *  Storage-key blijft vegFruitPerDay voor backward-compat met bestaande raw_inputs. */
  vegFruitPerDay?: number;
  /** Porties zuivel (melk, yoghurt, kaas) per dag. */
  dairyServingsPerDay?: number;
  /** Porties vlees, vis of peulvruchten per dag. */
  meatLegumesPerDay?: number;
  /** Keer per week buiten (huid aan daglicht, min. 15 minuten). */
  sunExposurePerWeek?: number;
}

/** Drie inname-banden t.o.v. een veelgebruikte richtlijn. */
export type IntakeBand = "below" | "around" | "meets";

/**
 * Geschatte inname t.o.v. een veelgebruikte richtlijn voor één nutriënt.
 * Dit is exact de element-vorm van de array die in intake_intake_log.estimate (F0) landt.
 */
export interface IntakeEstimate {
  nutrient: NutrientId;
  band: IntakeBand;
  /** Kopie van referenceLabel uit de referentietabel, voor directe weergave. */
  referenceLabel: string;
}

/**
 * Vertaal een frequentie-signaal naar een intake-band via de drempelwaarden
 * uit de referentietabel. Ontbrekende input (undefined, NaN, negatief) → "around".
 */
function signalToBand(
  signal: number | undefined,
  belowMax: number,
  meetsMin: number
): IntakeBand {
  if (signal === undefined || !Number.isFinite(signal) || signal < 0) {
    return "around";
  }
  if (signal < belowMax) return "below";
  if (signal >= meetsMin) return "meets";
  return "around";
}

/**
 * Combineer meerdere signalen tot één representatief getal.
 * Strategie: neem het maximum (conservatief: als één bron hoog is, telt dat mee).
 * Ontbrekende signalen (undefined) worden genegeerd; als alles ontbreekt → undefined.
 */
function combineSignals(
  signals: (number | undefined)[]
): number | undefined {
  const defined = signals.filter(
    (v): v is number => v !== undefined && Number.isFinite(v) && v >= 0
  );
  if (defined.length === 0) return undefined;
  return Math.max(...defined);
}

/**
 * Schat de voedings-inname per nutriënt op basis van een gewoonte-zelfrapport (gewone dag/week).
 * Deterministisch, puur — dezelfde input geeft altijd dezelfde output.
 *
 * @param report - Frequentie-antwoorden van de gebruiker (F0: raw_inputs).
 * @returns Array van IntakeEstimate (F0: estimate), één per nutriënt.
 */
export function estimateNutritionIntake(
  report: NutritionSelfReport
): IntakeEstimate[] {
  return NUTRIENT_IDS.map((id) => {
    const ref = nutrientReferences[id];
    const { belowMax, meetsMin } = ref.thresholds;

    let signal: number | undefined;

    switch (id) {
      case "protein":
        // Eiwit: eiwitrijke maaltijden per dag als primair signaal;
        // vlees/peulvruchten als alternatief als proteinMealsPerDay ontbreekt.
        signal = combineSignals([
          report.proteinMealsPerDay,
          report.meatLegumesPerDay,
        ]);
        break;

      case "omega3":
        // Omega-3: vette vis per week.
        signal = report.oilyFishPerWeek;
        break;

      case "magnesium":
        // Magnesium: magnesium-rijke voeding (bladgroenten, noten, peulvruchten) als primair
        // signaal — opgeslagen onder vegFruitPerDay; vlees/peulvruchten als aanvullend signaal.
        signal = combineSignals([
          report.vegFruitPerDay,
          report.meatLegumesPerDay,
        ]);
        break;

      case "vitamin_d":
        // Vitamine D: zonlichtexpositie per week.
        signal = report.sunExposurePerWeek;
        break;

      case "zinc":
        // Zink: vlees, vis of peulvruchten per dag.
        signal = combineSignals([
          report.meatLegumesPerDay,
          report.dairyServingsPerDay,
        ]);
        break;
    }

    const band = signalToBand(signal, belowMax, meetsMin);

    return {
      nutrient: id,
      band,
      referenceLabel: ref.referenceLabel,
    };
  });
}
