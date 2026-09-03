import {
  DAGBOEK_GROEPEN,
  NIEUWE_DAGBOEK_GROEPEN,
  type DagboekDag,
} from "@/lib/nutrition-dagboek";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Van geregistreerde dagen naar een zelfrapport — de brug tussen dagboek en
 * nutriëntroutes.
 *
 * ## Waarom deze brug er nog niet was
 *
 * `NUTRIENT_SIGNAL_SOURCES` leest velden als `oilyFishPerWeek` en
 * `dairyServingsPerDay`. Die kwamen tot nu uitsluitend uit de check: elf
 * sliders die naar een *gemiddelde over weken* vragen. Het dagboek meet iets
 * anders — wat je op vier concrete dagen at — en sprak tot plak 7a bovendien
 * een grovere taal ("vlees & vis" als één bak, terwijl omega-3 via vis loopt
 * en zink via vlees).
 *
 * Sinds de dertien groepen is die taal fijn genoeg. Wat ontbrak is de
 * vertaling, en dat is dit bestand.
 *
 * ## Wat dit wél en niet is
 *
 * **Wel:** een tweede, onafhankelijke schatting van dezelfde velden. Daarmee
 * wordt de kalibratievraag beantwoordbaar — wat zei je in de check, en wat
 * registreerde je werkelijk.
 *
 * **Niet:** een vervanging van de check. De check blijft de bron voor de
 * banden en de score; dit levert een *vergelijking* ernaast. Zodra het dagboek
 * de check zou overschrijven, is een steekproef van vier dagen ineens
 * zwaarder dan een vraag over je hele patroon, en dat is precies de omkering
 * die we niet willen.
 *
 * **Ook niet:** milligrammen of dagtotalen. Dit levert porties per dag en per
 * week — dezelfde eenheden die de check al levert. De grens uit
 * `nutrition-contribution.ts` blijft onverkort staan.
 *
 * ## De weging bij ontbrekende dagen
 *
 * Een gemiddelde over twee doordeweekse en twee weekenddagen is niet het
 * gemiddelde over een week: er zitten vijf werkdagen in een week en twee
 * weekenddagen. Ongewogen middelen geeft het weekend 50% gewicht terwijl het
 * er 28,6% verdient — en juist het weekend wijkt af. Zie
 * {@link gewogenGemiddelde}.
 */

/** Werkdagen en weekenddagen in een week — de wegingsbasis. */
const DOORDEWEEKSE_DAGEN_PER_WEEK = 5;
const WEEKENDDAGEN_PER_WEEK = 2;
const DAGEN_PER_WEEK = DOORDEWEEKSE_DAGEN_PER_WEEK + WEEKENDDAGEN_PER_WEEK;

/**
 * Hoeveel dagen er minstens moeten staan voordat we hier iets uit afleiden.
 *
 * Onder de vier is er geen 2+2, en dan is het "gemiddelde" een gok met een
 * gemiddelde-teken erboven. Dezelfde drempel als de weekendvergelijking:
 * pas bij een compleet dagboek zeggen we iets.
 */
export const SELFREPORT_MIN_DAGEN = 4;

/**
 * Het gewogen daggemiddelde voor één groep.
 *
 * Weegt doordeweekse dagen 5/7 en weekenddagen 2/7, zodat een afwijkend
 * weekend het weekbeeld niet oververtegenwoordigt. Ontbreekt een van beide
 * soorten, dan valt hij terug op een gewoon gemiddelde over wat er is — dan
 * is er niets te wegen.
 */
export function gewogenGemiddelde(
  dagen: readonly DagboekDag[],
  groep: VoedselgroepId,
): number | null {
  const waarden = (soort: DagboekDag["soort"]) =>
    dagen
      .filter((dag) => dag.soort === soort)
      .map((dag) => dag.porties[groep])
      .filter((waarde): waarde is number => typeof waarde === "number");

  const week = waarden("doordeweeks");
  const weekend = waarden("weekend");

  const gemiddelde = (reeks: readonly number[]) =>
    reeks.length === 0 ? null : reeks.reduce((som, n) => som + n, 0) / reeks.length;

  const weekGem = gemiddelde(week);
  const weekendGem = gemiddelde(weekend);

  if (weekGem === null && weekendGem === null) {
    return null;
  }
  if (weekGem === null) return weekendGem;
  if (weekendGem === null) return weekGem;

  return (
    (weekGem * DOORDEWEEKSE_DAGEN_PER_WEEK + weekendGem * WEEKENDDAGEN_PER_WEEK) /
    DAGEN_PER_WEEK
  );
}

/** Som van meerdere groepen, waarbij een ontbrekende groep als afwezig telt. */
function somVanGroepen(
  dagen: readonly DagboekDag[],
  groepen: readonly VoedselgroepId[],
): number | null {
  const delen = groepen
    .map((groep) => gewogenGemiddelde(dagen, groep))
    .filter((waarde): waarde is number => waarde !== null);
  if (delen.length === 0) {
    return null;
  }
  return delen.reduce((som, deel) => som + deel, 0);
}

function naarWeek(perDag: number | null): number | undefined {
  return perDag === null ? undefined : perDag * DAGEN_PER_WEEK;
}

function afronden(waarde: number | null): number | undefined {
  if (waarde === null) return undefined;
  // Eén decimaal: het dagboek telt hele porties, maar een gewogen gemiddelde
  // over vier dagen landt zelden op een rond getal. Meer decimalen zouden
  // precisie claimen die de invoer niet heeft.
  return Math.round(waarde * 10) / 10;
}

/**
 * Kan dit dagboek een zelfrapport dragen?
 *
 * Twee voorwaarden. Genoeg dagen is de eerste; de tweede is dat het de
 * *nieuwe* groepen gebruikt — een registratie uit het zeven-groepen-tijdperk
 * bundelt vlees en vis, en daar is omega-3 niet uit te halen zonder te gokken.
 */
export function kanZelfrapportDragen(dagen: readonly DagboekDag[]): boolean {
  if (dagen.length < SELFREPORT_MIN_DAGEN) {
    return false;
  }
  return dagen.every((dag) =>
    NIEUWE_DAGBOEK_GROEPEN.some((groep) => dag.porties[groep] !== undefined),
  );
}

/**
 * Bouw een zelfrapport uit geregistreerde dagen.
 *
 * De mapping volgt `CATEGORIE_PORTIEGROEPEN` in `nutrition-categorie-detail.ts`:
 * elk veld krijgt de groepen die in `food-sources.ts` daadwerkelijk de
 * bijbehorende portiegroep dragen. Waar de check één vraag stelt over
 * meerdere groepen, telt het dagboek ze hier op.
 *
 * `sunExposurePerWeek` blijft leeg: daglicht is geen voedselgroep, dus het
 * dagboek kan er niets over zeggen. Vitamine D blijft daarom volledig op de
 * check leunen — precies zoals het hoort, want in Nederland komt die stof
 * vooral van de huid.
 */
export function selfReportUitDagboek(
  dagen: readonly DagboekDag[],
): NutritionSelfReport | null {
  if (!kanZelfrapportDragen(dagen)) {
    return null;
  }

  const report: NutritionSelfReport = {};

  // Eiwitmomenten: alles wat als eiwitbron telt, opgeteld per dag. Dat is
  // ruimer dan "eetmomenten" — twee porties bij één maaltijd tellen hier los —
  // maar de check maakt datzelfde onderscheid ook niet (zie de weight-1
  // toelichting bij protein in NUTRIENT_SIGNAL_SOURCES).
  const eiwit = afronden(
    somVanGroepen(dagen, ["vis", "vlees", "eieren", "zuivel", "peulvruchten"]),
  );
  if (eiwit !== undefined) {
    report.proteinMealsPerDay = eiwit;
  }

  // Vette vis per week — de enige route naar EPA/DHA, en nu voor het eerst
  // los te meten omdat vis een eigen groep heeft.
  const vis = afronden(naarWeek(gewogenGemiddelde(dagen, "vis")) ?? null);
  if (vis !== undefined) {
    report.oilyFishPerWeek = vis;
  }

  // Plantporties: groente en fruit samen, zoals de plant-equivalentie in
  // nutrition-ladder.ts ze ook optelt.
  const planten = afronden(somVanGroepen(dagen, ["groente", "fruit"]));
  if (planten !== undefined) {
    report.vegFruitPerDay = planten;
  }

  const zuivel = afronden(gewogenGemiddelde(dagen, "zuivel"));
  if (zuivel !== undefined) {
    report.dairyServingsPerDay = zuivel;
  }

  // Vlees, vis en peulvruchten samen — het veld dat zink draagt en magnesium
  // zwak aanvult.
  const vleesVisPeul = afronden(somVanGroepen(dagen, ["vis", "vlees", "peulvruchten"]));
  if (vleesVisPeul !== undefined) {
    report.meatLegumesPerDay = vleesVisPeul;
  }

  // Noten, zaden en peulvruchten per week — de dichtste magnesiumbron.
  const notenPeul = afronden(
    naarWeek(somVanGroepen(dagen, ["noten", "peulvruchten"])) ?? null,
  );
  if (notenPeul !== undefined) {
    report.nutsSeedsLegumesPerWeek = notenPeul;
  }

  return report;
}

/** Eén veld waarop check en dagboek uiteenlopen. */
export type KalibratieRij = {
  field: keyof NutritionSelfReport;
  labelNl: string;
  /** Wat je in de check zei. */
  check: number;
  /** Wat je registreerde. */
  dagboek: number;
  /** Positief = je registreerde méér dan je zei. */
  verschil: number;
};

const VELD_LABELS: Partial<Record<keyof NutritionSelfReport, string>> = {
  proteinMealsPerDay: "Eiwitmomenten per dag",
  oilyFishPerWeek: "Vette vis per week",
  vegFruitPerDay: "Plantporties per dag",
  dairyServingsPerDay: "Zuivel per dag",
  meatLegumesPerDay: "Vlees, vis, peulvruchten per dag",
  nutsSeedsLegumesPerWeek: "Noten, zaden, peulvruchten per week",
};

/**
 * Vanaf welk verschil we het benoemen.
 *
 * Een halve portie valt binnen wat een steekproef van vier dagen niet kan
 * uitsluiten. Eén hele portie is de kleinste eenheid die het dagboek kent —
 * dezelfde drempel als de weekendvergelijking, en om dezelfde reden.
 */
const KALIBRATIE_DREMPEL = 1;

/**
 * Waar lopen je check-antwoorden en je registratie uiteen?
 *
 * Nadrukkelijk geen foutmelding. Beide zijn zelfrapportage, en geen van beide
 * is "de waarheid": de check vraagt naar een patroon over weken, het dagboek
 * naar vier concrete dagen. Lopen ze uiteen, dan is dat informatie over hoe
 * zeker we van het patroon mogen zijn — een dekkingsmaat, geen correctie.
 *
 * Daarom past dit ook nergens in de score. Het hoort naast de meting, op de
 * laag die over meten gaat.
 */
export function kalibratieRijen(
  check: NutritionSelfReport,
  dagboek: NutritionSelfReport | null,
): KalibratieRij[] {
  if (!dagboek) {
    return [];
  }

  const rijen: KalibratieRij[] = [];
  for (const [field, labelNl] of Object.entries(VELD_LABELS) as [
    keyof NutritionSelfReport,
    string,
  ][]) {
    const checkWaarde = check[field];
    const dagboekWaarde = dagboek[field];
    if (typeof checkWaarde !== "number" || typeof dagboekWaarde !== "number") {
      continue;
    }
    const verschil = dagboekWaarde - checkWaarde;
    if (Math.abs(verschil) < KALIBRATIE_DREMPEL) {
      continue;
    }
    rijen.push({ field, labelNl, check: checkWaarde, dagboek: dagboekWaarde, verschil });
  }

  return rijen.sort((a, b) => Math.abs(b.verschil) - Math.abs(a.verschil));
}

/**
 * Eén regel over de kalibratie.
 *
 * Geen oordeel over wie er "gelijk" heeft: de conclusie is dat je patroon
 * wisselt, niet dat je verkeerd antwoordde.
 */
export function kalibratieRegel(rijen: readonly KalibratieRij[]): string | null {
  if (rijen.length === 0) {
    return null;
  }

  const grootste = rijen[0];
  const richting = grootste.verschil > 0 ? "meer" : "minder";
  const rest =
    rijen.length > 1
      ? ` Op ${rijen.length - 1} ${rijen.length === 2 ? "ander punt" : "andere punten"} loopt het ook uiteen.`
      : "";

  return `Je registreerde ${richting} ${grootste.labelNl.toLowerCase().replace(/ per (dag|week)$/, "")} dan je check aangaf.${rest} Allebei zijn het schattingen — dit zegt vooral dat je patroon wisselt.`;
}

/** Alle groepen die het dagboek kent, voor consumenten die de lijst nodig hebben. */
export { DAGBOEK_GROEPEN };
