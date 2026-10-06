import type { NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenUitItems, sanitizeItems, zonderBenadering } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { aandeelVanNorm, normVoor, type KernstofNormen } from "@/lib/nutrition-normen";
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
  /**
   * Of de referentie bewezen gehaald is: zonder benaderingen
   * (`BESLUIT_MICRO_IN_BEELD_2026-10.md` §1b). Null bij onbewijsbare stoffen.
   */
  gedekt: boolean | null;
  /** Of een benadering aan het gemiddelde bijdroeg: toon met ≈. */
  benaderd?: boolean;
  /** `aandeel` zonder benaderingen: alleen hiermee mag "gehaald". */
  aandeelZonderBenadering?: number | null;
  /** Of een dagboek deze stof kan aantonen. */
  bewijsbaar: boolean;
  /** Pad naar de vergelijkingspagina van deze stof. */
  comparisonPath: string;
  /** Som over alle geregistreerde dagen: een ondergrens voor de hele periode. */
  totaal: number;
  /**
   * Hoe `aandeel` en `gedekt` gelezen worden. `per_dag`: gemiddelde per
   * geregistreerde dag tegen de dagnorm. `periodetotaal`: het totaal tegen
   * de norm × kalenderdagen — alleen voor omega-3 bij
   * {@link bouwPeriodeOverzicht} met `omega3AlsPeriodetotaal`.
   */
  lezing: "per_dag" | "periodetotaal";
  /** Bij `periodetotaal`: de norm over de hele periode. */
  normPeriode: number | null;
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
  normen: KernstofNormen,
): Weekoverzicht {
  return bouwPeriodeOverzicht(dagen, weekDatums(start), normen);
}

/**
 * Hetzelfde overzicht over een willekeurige reeks aaneengesloten datums.
 *
 * ## Omega-3 als periodetotaal
 *
 * De omega-3-norm (250 mg EPA+DHA per dag) is in de praktijk een weeknorm:
 * de Gezondheidsraad vertaalt hem naar één keer per week vette vis. Een
 * gemiddelde per geregistreerde dag blaast één visdag op tot honderden
 * procenten. Met `omega3AlsPeriodetotaal` telt omega-3 als som over de
 * periode tegen de norm × het aantal kalenderdagen. Die som is een harde
 * ondergrens (niet-geregistreerde dagen kunnen er alleen bij), dus een ✓ is
 * dan echt bewezen.
 */
export function bouwPeriodeOverzicht(
  dagen: readonly DagboekDag[],
  datums: readonly string[],
  normen: KernstofNormen,
  { omega3AlsPeriodetotaal = false }: { omega3AlsPeriodetotaal?: boolean } = {},
): Weekoverzicht {
  const start = datums[0] ?? "";
  const eind = datums[datums.length - 1] ?? "";
  const inWeek = dagen.filter(
    (dag) => dag.date >= start && dag.date <= eind && (dag.items?.length ?? 0) > 0,
  );

  const rijen = NUTRIENT_ORDER.map((nutrient): WeekRij => {
    const referentieRij = REFERENCE_INTAKES[nutrient];
    const bewijsbaar = !(nutrient in NIET_BEWIJSBAAR);

    let som = 0;
    let somStreng = 0;
    let dagenMetBron = 0;
    for (const dag of inWeek) {
      const stof = nutrientenUitItems(sanitizeItems(dag.items ?? [])).find(
        (n) => n.nutrient === nutrient,
      );
      if (!stof) continue;
      som += stof.minstens;
      somStreng += zonderBenadering(stof);
      dagenMetBron += 1;
    }

    // Dezelfde noemer als in het tekortsysteem: álle dagen waarop je iets
    // registreerde, niet alleen de dagen waarop deze stof voorkwam. Wie één
    // keer per week vis eet en alleen over de visdag middelt, leest "je haalt
    // 500 %" terwijl het op zes van de zeven dagen nul was.
    const gemiddeld =
      inWeek.length > 0 ? Math.round((som / inWeek.length) * 10) / 10 : 0;
    const referentie = normVoor(normen, nutrient)?.waarde ?? null;
    const periodetotaal = omega3AlsPeriodetotaal && nutrient === "omega3" && referentie !== null;
    const normPeriode = periodetotaal ? referentie * datums.length : null;
    const aandeel =
      inWeek.length === 0
        ? null
        : normPeriode !== null
          ? som / normPeriode
          : aandeelVanNorm(normen, nutrient, gemiddeld);
    const aandeelStreng =
      inWeek.length === 0
        ? null
        : normPeriode !== null
          ? somStreng / normPeriode
          : aandeelVanNorm(normen, nutrient, Math.round((somStreng / inWeek.length) * 10) / 10);

    // Alleen een bewijsbare stof mag een afstand tonen. Zink en vitamine D
    // hebben wel een norm (referentie is dus niet null), maar §3.4
    // van het besluit zegt: die twee krijgen geen oordeel, alleen hun
    // bronnentelling — een "te gaan"-getal zou hier alsnog een oordeel zijn,
    // verpakt als afstand in plaats van als tekort.
    const teGaan =
      bewijsbaar && referentie !== null && aandeel !== null && aandeel < 1
        ? normPeriode !== null
          ? Math.round((normPeriode - som) * 10) / 10
          : Math.round((referentie - gemiddeld) * 10) / 10
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
        !bewijsbaar || aandeelStreng === null ? null : aandeelStreng >= 1,
      benaderd: somStreng < som,
      aandeelZonderBenadering: aandeelStreng,
      bewijsbaar,
      comparisonPath: nutrientReferences[nutrient].comparisonPath,
      totaal: Math.round(som * 10) / 10,
      lezing: normPeriode !== null ? "periodetotaal" : "per_dag",
      normPeriode,
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
