/**
 * De twee voedingsvragen die níét meescoren: context en doel.
 *
 * `NUT_STRUCT`, `NUT_QUAL`, `NUT_O3` en `NUT_PROT` meten hoe je eet en gaan
 * daarom de voedingsscore in. Deze twee meten iets anders, en het verschil is
 * niet cosmetisch:
 *
 * - **`NUT_CONTEXT`** beschrijft je omstandigheden. Vegetarisch eten is geen
 *   tekort en medicatie is geen fout; ze bepalen alleen welke meetlat van jou
 *   is en welke vraag we beter niet stellen. Zou dit meescoren, dan kreeg een
 *   veganist een lagere voedingsscore om iets dat geen gebrek is.
 * - **`NUT_DOEL`** beschrijft waar je heen wilt. Het kleurt de vólgorde van je
 *   prioriteiten en de bewoording eromheen — nooit de meting. Anders krijgen
 *   twee mensen met exact hetzelfde eetpatroon een andere score omdat ze iets
 *   anders willen, en dan is de score geen meting meer.
 *
 * Ze horen dus in de check (ze bepalen wat je te zien krijgt) en niet in
 * `calcDomainScores` (ze bepalen niet hoe goed je eet).
 *
 * ## De doorverwijs-uitgang
 *
 * Twee antwoorden zetten de check stil op dit punt: medicatie die je eten
 * raakt, en klachten waar je iets voor wilt doen. Daar past geen leefstijl-
 * oordeel bij, en de eerlijke uitkomst is dan dat we er géén geven — met de
 * reden erbij. Zie {@link needsNutritionReferral}.
 */

export type NutritionContextId =
  | "vegetarisch"
  | "veganistisch"
  | "intolerantie"
  | "gewicht"
  | "medicatie"
  | "geen";

export type NutritionGoalId =
  | "energie"
  | "gewicht_omlaag"
  | "spier_behoud"
  | "algemeen"
  | "klachten"
  | "onbekend";

export type NutritionContextOption = {
  id: NutritionContextId;
  label: string;
};

export type NutritionGoalOption = {
  id: NutritionGoalId;
  label: string;
};

/**
 * Meerkeuze: iemand kan tegelijk vegetariër zijn én medicatie gebruiken.
 * "Geen van deze" sluit de rest uit — dat handelt de UI af.
 */
export const NUTRITION_CONTEXT_OPTIONS: readonly NutritionContextOption[] = [
  { id: "vegetarisch", label: "Ik eet vegetarisch" },
  { id: "veganistisch", label: "Ik eet veganistisch" },
  { id: "intolerantie", label: "Ik heb een allergie of intolerantie" },
  { id: "gewicht", label: "Ik wil afvallen of aankomen" },
  { id: "medicatie", label: "Ik gebruik medicatie die mijn eten raakt" },
  { id: "geen", label: "Geen van deze" },
] as const;

/**
 * Enkelvoudig: één richting tegelijk. Meer doelen tegelijk is realistisch maar
 * onbruikbaar om prioriteiten mee te ordenen — dan wint er alsnog één, en dan
 * kun je die net zo goed vragen.
 *
 * "Weet ik nog niet" is een volwaardig antwoord en geen overslaan: wie dat
 * kiest krijgt de neutrale volgorde (laagste laag eerst), en dat is precies
 * wat `resolveNutritionFocusLayer` sowieso doet.
 */
export const NUTRITION_GOAL_OPTIONS: readonly NutritionGoalOption[] = [
  { id: "energie", label: "Meer energie overdag" },
  { id: "gewicht_omlaag", label: "Gewicht omlaag" },
  { id: "spier_behoud", label: "Spierkracht behouden" },
  { id: "algemeen", label: "Algemeen gezonder eten" },
  { id: "klachten", label: "Klachten verminderen" },
  { id: "onbekend", label: "Weet ik nog niet" },
] as const;

export const NUTRITION_CONTEXT_QUESTION =
  "Speelt er iets dat bepaalt hoe jij eet?" as const;

export const NUTRITION_CONTEXT_SUBTITLE =
  "Meerdere antwoorden mogelijk. Dit bepaalt welke vragen we je later wel en niet stellen." as const;

export const NUTRITION_GOAL_QUESTION =
  "Waar wil je met je voeding naartoe?" as const;

export const NUTRITION_GOAL_SUBTITLE =
  "Dit bepaalt de volgorde van je adviezen — niet je score." as const;

export function isNutritionContextId(value: string): value is NutritionContextId {
  return NUTRITION_CONTEXT_OPTIONS.some((option) => option.id === value);
}

export function isNutritionGoalId(value: string): value is NutritionGoalId {
  return NUTRITION_GOAL_OPTIONS.some((option) => option.id === value);
}

/**
 * Valt deze combinatie buiten wat een leefstijlcheck kan beoordelen?
 *
 * Twee gevallen, en beide om dezelfde reden: er is iets aan de hand waar een
 * algemene vragenlijst geen uitspraak over hoort te doen.
 *
 * - **Medicatie die eten raakt** — interacties zijn per middel anders, en een
 *   generiek voedingsadvies kan er dwars tegenin gaan.
 * - **Klachten verminderen als doel** — dan is de vraag medisch geworden, ook
 *   als de klacht dat (nog) niet is.
 *
 * Dit is een *stop op het oordeel*, geen stop op de check: de rest van de
 * uitkomst blijft gewoon staan. Wat wegvalt is de stelligheid, en wat ervoor
 * in de plaats komt is de reden.
 */
export function needsNutritionReferral(
  context: readonly NutritionContextId[],
  goal: NutritionGoalId | null,
): boolean {
  return context.includes("medicatie") || goal === "klachten";
}

/**
 * De regel bij een doorverwijzing.
 *
 * Geen alarm en geen diagnose — allebei zouden een uitspraak zijn die we juist
 * niet doen. Wat er staat is wat we níét kunnen beoordelen en bij wie dat wel
 * kan.
 */
export function nutritionReferralLine(
  context: readonly NutritionContextId[],
  goal: NutritionGoalId | null,
): string | null {
  if (!needsNutritionReferral(context, goal)) {
    return null;
  }
  if (context.includes("medicatie")) {
    return "Je gaf aan medicatie te gebruiken die je eten raakt. Voedingsadvies kan daarmee wisselwerken, dus we houden onze uitspraken hier algemeen — je huisarts of apotheker kan zeggen wat voor jou geldt.";
  }
  return "Je wilt klachten verminderen. Daar hoort een beoordeling bij die verder gaat dan een leefstijlcheck; bespreek dit met je huisarts of een diëtist. Wat je hier ziet blijft algemeen.";
}

/**
 * Welke dieetvoorkeur volgt uit de context-antwoorden?
 *
 * Sluit aan op de bestaande `preference` uit de voedingscheck, zodat de
 * opt-outs in `nutrition-ladder.ts` (geen vis, geen zuivel) meteen werken
 * zonder dat iemand dezelfde vraag twee keer krijgt.
 */
export function preferenceFromContext(
  context: readonly NutritionContextId[],
): "vegan" | "vegetarian" | "none" {
  if (context.includes("veganistisch")) return "vegan";
  if (context.includes("vegetarisch")) return "vegetarian";
  return "none";
}
