import type { SymptomId } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import { getDisplayStatus } from "@/lib/score-display";
import { resolveVitaliteitFacets, type FacetKey } from "@/lib/vitaliteit";

const SYMPTOM_FRAGMENT: Record<SymptomId, string> = {
  stress: "minder rust en meer prikkelbaarheid",
  slaap: "moeite met slapen",
  energie: "een lege batterij",
};

/**
 * Herkenningszin uit de symptomen die de gebruiker in fase 1 koos.
 * Spiegelt de persoon terug vóór het oordeel (begrip → urgentie → actie).
 */
export function getRecognitionLine(symptoms: SymptomId[]): string | null {
  const fragments: string[] = [];
  for (const symptom of symptoms) {
    const fragment = SYMPTOM_FRAGMENT[symptom];
    if (fragment && !fragments.includes(fragment)) {
      fragments.push(fragment);
    }
  }
  if (fragments.length === 0) {
    return null;
  }
  const joined =
    fragments.length === 1
      ? fragments[0]
      : `${fragments.slice(0, -1).join(", ")} en ${fragments[fragments.length - 1]}`;
  return `Je begon met ${joined}.`;
}

const FACET_LABEL: Record<FacetKey, string> = {
  sleep: "slaap",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
  recovery: "herstel",
};

export type VitalityFraming = {
  driverLine: string | null;
  strengthLine: string | null;
};

/**
 * Verklaart de vitaliteits-band via zijn eigen drivers:
 * - driverLine: de 1–2 zwakste gebieden (Aandacht/Prioriteit, < 60) — maakt het
 *   oordeel verdiend i.p.v. beweerd.
 * - strengthLine: het sterkste gebied (>= 60) — contrast, "je wordt gezien".
 * Beide los null wanneer niet van toepassing: alles laag → geen valse lof;
 * alles hoog → geen aandacht-frame.
 */
export function getVitalityFraming(scores: DomainScores): VitalityFraming {
  const ascending = resolveVitaliteitFacets(scores)
    .filter((facet) => Number.isFinite(facet.value))
    .sort((a, b) => a.value - b.value);

  if (ascending.length === 0) {
    return { driverLine: null, strengthLine: null };
  }

  const weakest = ascending.filter((facet) => {
    const status = getDisplayStatus(facet.value);
    return status === "Aandacht" || status === "Prioriteit";
  });
  const strongest = ascending[ascending.length - 1];

  let driverLine: string | null = null;
  if (weakest.length >= 2) {
    driverLine = `Vooral ${FACET_LABEL[weakest[0].key]} en ${FACET_LABEL[weakest[1].key]} vragen nu aandacht.`;
  } else if (weakest.length === 1) {
    driverLine = `Vooral je ${FACET_LABEL[weakest[0].key]} vraagt nu aandacht.`;
  }

  const strengthLine =
    strongest.value >= 60
      ? `Je ${FACET_LABEL[strongest.key]} staat er goed voor — daar bouw je op voort.`
      : null;

  return { driverLine, strengthLine };
}
