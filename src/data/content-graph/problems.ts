import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DeficiencySignals } from "@/lib/intake-engine";
import type { ContentCheckId } from "@/data/content-graph/checks";

/**
 * De problemen van de graaf — met opzet géén nieuw veld op contentitems.
 *
 * ## Waarom dit een registry is en geen `problem`-veld
 *
 * `CONTENT_METADATA` draagt al `gapSignal`, een sleutel uit `DeficiencySignals`.
 * Dat ís de probleemverwijzing: het is wat de check meet en wat de
 * aanbevelingsmotor als trigger gebruikt. Er een tweede veld naast zetten dat
 * hetzelfde bedoelt, levert gegarandeerd twee waarheden op die uit de pas gaan
 * lopen.
 *
 * Deze registry geeft die bestaande sleutels dus alleen een naam, een zin in
 * gebruikerstaal en hun plek in de graaf. Eén bron, twee lezingen: de engine
 * leest het signaal, de content leest het probleem.
 *
 * ## Waarom niet elk signaal een nutriënt heeft
 *
 * `cortisol_risk` en `sleep_issue_no_stress` zijn echte problemen zonder
 * voedingsstof erachter. Ze een nutriënt toekennen zou suggereren dat er iets
 * te suppleren valt waar dat niet zo is — precies de kortsluiting die de
 * volgorde *begrijpen → controleren → verbeteren → aanvullen* moet voorkomen.
 */

export type ProblemId = keyof DeficiencySignals;

export interface Problem {
  id: ProblemId;
  /** Kort label, zoals een beheerder het in een lijst wil zien. */
  label: string;
  /** Het probleem in de taal van de bezoeker — herkenning, geen diagnose. */
  herkenningNl: string;
  /** De stof die eronder ligt, als die er is. */
  nutrient: NutrientId | null;
  /** De check die dit probleem daadwerkelijk meet. */
  check: ContentCheckId;
}

export const PROBLEMS: Record<ProblemId, Problem> = {
  omega3_deficiency: {
    id: "omega3_deficiency",
    label: "Weinig omega-3 uit voeding",
    herkenningNl: "Je eet zelden vette vis, en je weet niet of dat uitmaakt.",
    nutrient: "omega3",
    check: "voeding",
  },
  magnesium_signal: {
    id: "magnesium_signal",
    label: "Aanwijzing magnesiumtekort",
    herkenningNl:
      "Gespannen spieren, onrustige nachten — en weinig noten, groente of volkoren op je bord.",
    nutrient: "magnesium",
    check: "voeding",
  },
  protein_gap_signal: {
    id: "protein_gap_signal",
    label: "Eiwitinname blijft achter",
    herkenningNl:
      "Je traint of herstelt traag, terwijl er weinig eiwit in je dag zit.",
    nutrient: "protein",
    check: "voeding",
  },
  cortisol_risk: {
    id: "cortisol_risk",
    label: "Aanhoudende spanning",
    herkenningNl:
      "Je staat lang aan en komt 's avonds moeilijk uit die stand.",
    nutrient: null,
    check: "stress",
  },
  creatine_signal: {
    id: "creatine_signal",
    label: "Belasting hoger dan herstel",
    herkenningNl:
      "Je traint stevig, maar je herstelt er niet in hetzelfde tempo bij.",
    nutrient: null,
    check: "beweging",
  },
  melatonine_signal: {
    id: "melatonine_signal",
    label: "Moeilijk inslapen bij spanning",
    herkenningNl: "Je ligt wakker met een hoofd dat nog aan staat.",
    nutrient: null,
    check: "slaap",
  },
  low_recovery_no_load: {
    id: "low_recovery_no_load",
    label: "Onderherstel zonder trainingsbelasting",
    herkenningNl:
      "Je bent moe zonder dat je lijf er die dag hard voor heeft gewerkt.",
    nutrient: null,
    check: "leefstijl",
  },
  sleep_issue_no_stress: {
    id: "sleep_issue_no_stress",
    label: "Slaapprobleem zonder stressverklaring",
    herkenningNl:
      "Je slaapt slecht terwijl je spanning eigenlijk meevalt — dan zit het ergens anders.",
    nutrient: null,
    check: "slaap",
  },
  energy_dip_unexplained: {
    id: "energy_dip_unexplained",
    label: "Energiedip zonder verklaring",
    herkenningNl:
      "Je energie zakt weg terwijl slaap en eten op orde lijken.",
    nutrient: null,
    check: "leefstijl",
  },
};

export const PROBLEM_IDS = Object.keys(PROBLEMS) as ProblemId[];

export function getProblem(id: ProblemId): Problem {
  return PROBLEMS[id];
}
