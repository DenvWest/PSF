import type { NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { aandeelVanRi, REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenUitItems, sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";

/**
 * Eén week voedingsstoffen: de tabel gemiddeld / referentie / te gaan.
 *
 * ## Waarom een week een eigen module is, naast het tekortsysteem
 *
 * `nutrition-tekortsysteem.ts` beantwoordt "hoe hardnekkig is dit" en zet
 * daarvoor vier vensters náást elkaar. Deze module beantwoordt een andere
 * vraag: "hoe ging déze week", met een week die je vooruit en achteruit kunt
 * bladeren. Dat is geen venster maar een periode met een begin en een eind, en
 * die twee door elkaar halen zou de vier vensters ineens verplaatsbaar maken —
 * precies wat ze niet zijn.
 *
 * ## De kolom heet "te gaan", niet "over" en niet "tekort"
 *
 * De bronapp waar de vorm vandaan komt noemt die kolom "Over" en vult hem met
 * het hele doel zodra je niets logde: 121 g eiwit "over" op een lege week. Dat
 * werkt daar omdat logging het product is — niet loggen is daar een
 * gebruikersfout.
 *
 * Hier is het andersom. Wat je niet registreerde bestaat niet als nul; het is
 * onbekend, en de ondergrens-regel zegt dat het er alleen bij kan komen. Een
 * getal in die kolom is dus alleen eerlijk als er iets gemeten is, en het heet
 * de afstand tot de referentie en nooit een tekort in jou. Zie §3.4 van
 * BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md.
 *
 * ## Waarom vijf stoffen en geen elf
 *
 * De catalogus draagt gehaltes voor eiwit, magnesium, zink, omega-3 en
 * vitamine D. Voor vitamine A of kalium bestaat er geen getal, en een rij die
 * permanent "0" toont leest als "je kreeg niets binnen" terwijl er in
 * werkelijkheid niets gemeten is. Deze module leest daarom `NUTRIENT_ORDER`:
 * komt er een stof bij in de data, dan staat hij hier vanzelf, zonder dat het
 * scherm verbouwd hoeft te worden.
 */

export type WeekRij = {
  nutrient: NutrientId;
  label: string;
  unit: "g" | "mg" | "µg";
  /** Gemiddelde ondergrens per geregistreerde dag in deze week. */
  gemiddeld: number;
  /** De wettelijke referentie, of null wanneer het doel elders vandaan komt. */
  referentie: number | null;
  /** Deel van de referentie dat het gemiddelde dekt. */
  aandeel: number | null;
  /** Afstand tot de referentie; null zodra hij gehaald is of niets gemeten is. */
  teGaan: number | null;
  /** Op hoeveel van de geregistreerde dagen een bron voor deze stof stond. */
  dagenMetBron: number;
  /** Of de referentie bewezen gehaald is. Null bij onbewijsbare stoffen. */
  gedekt: boolean | null;
  /** Of een dagboek deze stof kan aantonen. */
  bewijsbaar: boolean;
  /** Pad naar de vergelijkingspagina van deze stof. */
  comparisonPath: string;
};

export type Weekoverzicht = {
  /** Maandag van deze week, ISO. */
  start: string;
  /** Zondag van deze week, ISO. */
  eind: string;
  /** Hoeveel dagen in deze week iets geregistreerd hebben. */
  dagenGeregistreerd: number;
  /** Per stof, op volgorde van `NUTRIENT_ORDER`. */
  rijen: WeekRij[];
};

/** Maandag van de week waar `datum` in valt. */
export function weekStart(datum: string): string {
  const dag = new Date(datum);
  dag.setDate(dag.getDate() - ((dag.getDay() + 6) % 7));
  return dag.toISOString().slice(0, 10);
}

/** De week `n` weken verschoven — negatief is terug. */
export function verschuifWeek(start: string, weken: number): string {
  const dag = new Date(start);
  dag.setDate(dag.getDate() + weken * 7);
  return dag.toISOString().slice(0, 10);
}

/** De zeven ISO-datums van de week die op `start` begint. */
export function weekDatums(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const dag = new Date(start);
    dag.setDate(dag.getDate() + i);
    return dag.toISOString().slice(0, 10);
  });
}

export function bouwWeekoverzicht(
  dagen: readonly DagboekDag[],
  start: string,
): Weekoverzicht {
  const datums = weekDatums(start);
  const eind = datums[6]!;
  const inWeek = dagen.filter(
    (dag) => dag.date >= start && dag.date <= eind && (dag.items?.length ?? 0) > 0,
  );

  const rijen = NUTRIENT_ORDER.map((nutrient): WeekRij => {
    const referentieRij = REFERENCE_INTAKES[nutrient];
    const bewijsbaar = !(nutrient in NIET_BEWIJSBAAR);

    let som = 0;
    let dagenMetBron = 0;
    for (const dag of inWeek) {
      const stof = nutrientenUitItems(sanitizeItems(dag.items ?? [])).find(
        (n) => n.nutrient === nutrient,
      );
      if (!stof) continue;
      som += stof.minstens;
      dagenMetBron += 1;
    }

    // Dezelfde noemer als in het tekortsysteem: álle dagen waarop je iets
    // registreerde, niet alleen de dagen waarop deze stof voorkwam. Wie één
    // keer per week vis eet en alleen over de visdag middelt, leest "je haalt
    // 500 %" terwijl het op zes van de zeven dagen nul was.
    const gemiddeld =
      inWeek.length > 0 ? Math.round((som / inWeek.length) * 10) / 10 : 0;
    const aandeel = inWeek.length > 0 ? aandeelVanRi(nutrient, gemiddeld) : null;
    const referentie = referentieRij.personalTarget ? null : referentieRij.value;

    // Alleen een bewijsbare stof mag een afstand tonen. Zink en vitamine D
    // hebben wel een wettelijke RI (referentie is dus niet null), maar §3.4
    // van het besluit zegt: die twee krijgen geen oordeel, alleen hun
    // bronnentelling — een "te gaan"-getal zou hier alsnog een oordeel zijn,
    // verpakt als afstand in plaats van als tekort.
    const teGaan =
      bewijsbaar && referentie !== null && aandeel !== null && aandeel < 1
        ? Math.round((referentie - gemiddeld) * 10) / 10
        : null;

    return {
      nutrient,
      label: nutrientReferences[nutrient].label,
      unit: referentieRij.unit,
      gemiddeld,
      referentie,
      aandeel,
      teGaan: teGaan !== null && teGaan > 0 ? teGaan : null,
      dagenMetBron,
      gedekt:
        !bewijsbaar || aandeel === null ? null : aandeel >= 1,
      bewijsbaar,
      comparisonPath: nutrientReferences[nutrient].comparisonPath,
    };
  });

  return {
    start,
    eind,
    dagenGeregistreerd: inWeek.length,
    rijen,
  };
}

/** "31 augustus - 6 september 2026", zoals de kop van het weekoverzicht. */
export function weekLabel(start: string, eind: string): string {
  const van = new Date(start);
  const tot = new Date(eind);
  const zelfdeMaand = van.getMonth() === tot.getMonth();

  const vanTekst = van.toLocaleDateString("nl-NL", {
    day: "numeric",
    ...(zelfdeMaand ? {} : { month: "long" }),
  });
  const totTekst = tot.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${vanTekst} – ${totTekst}`;
}
