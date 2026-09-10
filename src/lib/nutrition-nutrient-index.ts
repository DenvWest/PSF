/**
 * De omgekeerde index: van nutriënt naar producten.
 *
 * `FOOD_SOURCES` staat als `nutriënt → bronnen`, en dat is precies wat je nodig
 * hebt om de vraag te beantwoorden waar deze module voor bestaat: *"welke
 * producten uit mijn categorieën dragen magnesium, en wat levert één portie?"*
 * Deze module legt daar de catalogus naast, zodat het antwoord niet "eet meer
 * noten" is maar een gerangschikte lijst van producten die je echt logt, met de
 * bijdrage per portie erbij.
 *
 * Dat is de reden dat de catalogus bestaat, en het is de plek waar de vraag
 * *uit mijn eten of uit een supplement* concreet wordt — het schap (S1).
 *
 * ## Vier randvoorwaarden, en waar ze in de code zitten
 *
 * 1. **Rangschikken op bijdrage per PORTIE, niet per 100 g.** Niemand eet 100 g
 *    tahin. Elke regel draagt een echte portie: de eerste portie uit de
 *    catalogus (die mensen het vaakst bedoelen), of — bij een rij die nog geen
 *    gehalte per 100 g heeft — de portie die de bron zelf noemt. Zie
 *    {@link NutrientBronRegel.portieBron}.
 *
 * 2. **Een band, geen punt.** De band komt uit `nutrition-spread.ts`, waar de
 *    waargenomen spreiding wint van de klassenband. Gesorteerd wordt op de
 *    **onderkant** van die band: dat is het enige getal dat we durven claimen
 *    ("minstens"), dus het is ook het enige eerlijke getal om op te ordenen.
 *    Sorteren op de puntwaarde zou ordenen op een getal dat we in de copy
 *    weigeren te noemen.
 *
 * 3. **De opname telt mee.** Bij magnesium en zink bepaalt fytaat de opname
 *    méér dan het gehalte. Elke regel draagt daarom `opname`, zodat een
 *    plantaardige bron niet te hoog in de lijst leest zonder die nuance.
 *    **Maar de fytaat:zink-verhouding is een maaltijdeigenschap** (ONDERZOEK
 *    §1.8) — die berekent deze module niet per product. Voor een concrete
 *    selectie (een gerecht, een dag) bestaat {@link opnameOordeelVoorSelectie}.
 *
 * 4. **Geen gezondheidsclaim, en de poort blijft dicht waar hij dicht is.**
 *    "Dit product levert X mg magnesium per portie" mag; "hiermee heb je geen
 *    supplement nodig" niet. Deze module kent `resolveNutritionGate` niet en
 *    importeert hem niet — de poort hangt aan de check en de ladderstatus, niet
 *    aan een productlijst. Er staan hier ook nergens percentages van een ADH:
 *    een marker toont een positie, een percentage maakt er een doel van.
 */

import {
  FOOD_SOURCES,
  type FoodSource,
  type SourceOrigin,
} from "@/data/nutrition/food-sources";
import { FOOD_CATALOG, type CatalogEntry } from "@/data/nutrition/food-catalog";
import type { FoodCategoryId } from "@/data/nutrition/food-taxonomy";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";
import {
  spreadBandForAmount,
  spreadBandForPortion,
  type SpreadBand,
} from "@/lib/nutrition-spread";

/**
 * De eenheid per stof. Staat hier omdat een rij zonder `nutrientValue` er geen
 * draagt, en een lijst met gemengde eenheden onleesbaar is.
 */
const UNIT: Record<NutrientId, "g" | "mg" | "µg"> = {
  protein: "g",
  omega3: "mg",
  magnesium: "mg",
  vitamin_d: "µg",
  zinc: "mg",
};

export interface NutrientBronRegel {
  /** De catalogussleutel — dit is wat je logt, en wat in events terechtkomt. */
  key: string;
  labelNl: string;
  category: FoodCategoryId;
  ookIn: readonly FoodCategoryId[];
  groep: VoedselgroepId;
  /** De portie waarop `band` is gerekend, zoals je hem zou noemen. */
  portieLabel: string;
  /** Gram-equivalent, of null als de bron zijn eigen portie noemt zonder gram. */
  portieGrams: number | null;
  /**
   * Waar die portie vandaan komt. `"catalogus"` = de portie die je logt, met
   * het gehalte per 100 g omgerekend. `"bron"` = de rij heeft nog geen gehalte
   * per 100 g, dus we tonen de portie waar de indicatieve waarde bij hoort.
   */
  portieBron: "catalogus" | "bron";
  /** De bijdrage van die ene portie, als band. `lo` is de "minstens"-kant. */
  band: SpreadBand;
  unit: "g" | "mg" | "µg";
  /** Fytaat en oxaalzuur remmen; dit is de annotatie, nooit een ratio. */
  opname: { reduced: boolean; why: string | null };
  /** Waar het gehalte vandaan komt — voor de bronregel onder de lijst. */
  herkomst: {
    origin: SourceOrigin;
    ref: string | null;
    edition: string | null;
    naam: string | null;
  };
  /** Slaat alleen op het gehalte, niet op het opname-oordeel. */
  verified: boolean;
  /**
   * Andere catalogusregels die exact ditzelfde gehalte delen — cultivar- of
   * naamvarianten die naar dezelfde bron wijzen (rode, groene en bruine linzen
   * naast "linzen"). Ze staan hier in plaats van als eigen regel, want vier
   * regels met identieke getallen suggereren een verschil dat de meting niet
   * kan zien — dezelfde regel die de catalogus aan bereidingsvarianten stelt.
   */
  ookGeldigVoor: readonly string[];
}

export interface NutrientBronnenLijst {
  nutrient: NutrientId;
  unit: "g" | "mg" | "µg";
  /** Aflopend op de onderkant van de band — zie randvoorwaarde 2. */
  regels: readonly NutrientBronRegel[];
  /** Hoeveel regels een geverifieerd gehalte dragen (de rest is indicatief). */
  geverifieerd: number;
  /**
   * De opname-uitspraak op lijstniveau. Geen ratio en geen oordeel over jou:
   * alleen de mededeling dat opname bij deze stof een eigenschap van de hele
   * maaltijd is. Null waar fytaat geen rol speelt.
   */
  opnameAnnotatie: string | null;
}

export interface NutrientBronnenOpties {
  /** Alleen producten die in (een van) deze zoekcategorieën te vinden zijn. */
  categorieen?: readonly FoodCategoryId[];
  /** Hoeveel regels je terug wilt. Zonder limiet: alles. */
  limiet?: number;
}

/** Zit dit product in een van de gevraagde zoekcategorieën? `ookIn` telt mee. */
function valtInCategorie(
  entry: CatalogEntry,
  categorieen: readonly FoodCategoryId[],
): boolean {
  if (categorieen.length === 0) return true;
  const gevraagd = new Set(categorieen);
  if (gevraagd.has(entry.category)) return true;
  return (entry.ookIn ?? []).some((cat) => gevraagd.has(cat));
}

/**
 * De band voor één portie van dit product bij deze stof.
 *
 * Twee paden, en het verschil is zichtbaar in `portieBron`:
 * - De rij draagt een gehalte per 100 g → reken de catalogusportie om. Dit is
 *   het pad waar `observed` kan winnen.
 * - De rij draagt alleen een indicatieve waarde bij zijn eigen portie → gebruik
 *   die portie. De klassenband werkt daar net zo goed op, maar `observed` kan
 *   er per definitie niet winnen.
 *
 * `null` als er niets te tonen valt — bijvoorbeeld een ALA-bron bij omega-3,
 * die bewust `amount: null` draagt omdat ALA en EPA/DHA niet in dezelfde
 * eenheid naast elkaar horen.
 */
function bandVoorPortie(
  source: FoodSource,
  entry: CatalogEntry,
  nutrient: NutrientId,
): { band: SpreadBand; portieLabel: string; portieGrams: number | null; portieBron: "catalogus" | "bron" } | null {
  const portie = entry.porties[0];
  if (source.nutrientValue && portie) {
    const band = spreadBandForPortion(
      source.nutrientValue,
      nutrient,
      entry.groep,
      entry.key,
      portie.grams,
    );
    if (band) {
      return {
        band,
        portieLabel: `${portie.labelNl} (${portie.grams} g)`,
        portieGrams: portie.grams,
        portieBron: "catalogus",
      };
    }
  }
  if (source.amount != null) {
    return {
      band: spreadBandForAmount(source.amount, nutrient, entry.groep, entry.key),
      portieLabel: source.portionNl,
      portieGrams: null,
      portieBron: "bron",
    };
  }
  return null;
}

/**
 * Waarom de opname bij deze stof aan de maaltijd hangt, niet aan het product.
 *
 * Alleen bij magnesium en zink: daar bindt fytaat het mineraal, en bij zink is
 * de fytaat:zink-verhouding van de héle maaltijd bepalend (ONDERZOEK §1.8).
 * Dat is precies waarom hier geen ratio per product staat.
 */
const OPNAME_ANNOTATIE: Partial<Record<NutrientId, string>> = {
  magnesium:
    "Fytaat in noten, zaden, peulvruchten en volkoren bindt magnesium. Hoeveel er aankomt hangt af van de hele maaltijd, niet van één product.",
  zinc:
    "Fytaat bindt zink, en de verhouding fytaat:zink van de hele maaltijd bepaalt de opname meer dan het gehalte van één product.",
};

/**
 * De producten die deze stof dragen, gerangschikt op wat één portie bijdraagt.
 *
 * Rangschikking op `band.lo` — de onderkant, het getal dat we als "minstens"
 * durven noemen. Bij gelijke onderkant wint de hogere puntwaarde, en daarna het
 * alfabet, zodat de volgorde stabiel is.
 */
export function nutrientBronnen(
  nutrient: NutrientId,
  opties: NutrientBronnenOpties = {},
): NutrientBronnenLijst {
  const bronnen = FOOD_SOURCES[nutrient];
  const perSleutel = new Map<string, FoodSource>();
  for (const bron of bronnen) perSleutel.set(bron.key, bron);

  const categorieen = opties.categorieen ?? [];
  // Gegroepeerd op bronsleutel: catalogusregels die dezelfde bron delen, delen
  // per constructie hetzelfde gehalte en horen als één regel te verschijnen.
  const perBron = new Map<string, NutrientBronRegel[]>();

  for (const entry of FOOD_CATALOG) {
    if (entry.bron === null) continue;
    if (!valtInCategorie(entry, categorieen)) continue;
    const source = perSleutel.get(entry.bron);
    if (!source) continue;

    const portie = bandVoorPortie(source, entry, nutrient);
    if (!portie) continue;

    const regel: NutrientBronRegel = {
      key: entry.key,
      labelNl: entry.labelNl,
      category: entry.category,
      ookIn: entry.ookIn ?? [],
      groep: entry.groep,
      portieLabel: portie.portieLabel,
      portieGrams: portie.portieGrams,
      portieBron: portie.portieBron,
      band: portie.band,
      unit: source.nutrientValue?.unit ?? UNIT[nutrient],
      opname: {
        reduced: source.bioavailability === "reduced",
        why: source.bioavailabilityWhy ?? null,
      },
      herkomst: {
        origin: source.source.origin,
        ref: source.source.ref,
        edition: source.source.edition,
        naam: source.nutrientValue?.sourceNameNl ?? null,
      },
      verified: source.verified,
      ookGeldigVoor: [],
    };
    const groep = perBron.get(entry.bron);
    if (groep) groep.push(regel);
    else perBron.set(entry.bron, [regel]);
  }

  // Eén regel per bron. De representant is de minst gekwalificeerde naam
  // ("Linzen, gekookt" vóór "Rode linzen, gekookt"): dat is de algemene vorm,
  // en de varianten blijven zichtbaar via `ookGeldigVoor`.
  const regels = [...perBron.values()].map((groep) => {
    if (groep.length === 1) return groep[0];
    const gesorteerd = [...groep].sort(
      (a, b) =>
        a.labelNl.length - b.labelNl.length ||
        a.labelNl.localeCompare(b.labelNl, "nl"),
    );
    const [eerste, ...rest] = gesorteerd;
    return { ...eerste, ookGeldigVoor: rest.map((r) => r.labelNl) };
  });

  regels.sort(
    (a, b) =>
      b.band.lo - a.band.lo ||
      b.band.point - a.band.point ||
      a.labelNl.localeCompare(b.labelNl, "nl"),
  );

  const begrensd = opties.limiet != null ? regels.slice(0, opties.limiet) : regels;

  return {
    nutrient,
    unit: UNIT[nutrient],
    regels: begrensd,
    geverifieerd: begrensd.filter((r) => r.verified).length,
    opnameAnnotatie: OPNAME_ANNOTATIE[nutrient] ?? null,
  };
}

/**
 * De stofnaam zoals hij middenin een zin staat: alleen de eerste letter omlaag,
 * de rest onaangeroerd. Plat `toLowerCase()` zou van "Vitamine D" "vitamine d"
 * maken, en dat is een andere stof dan er bedoeld wordt.
 */
function inZin(nutrient: NutrientId): string {
  const label = nutrientReferences[nutrient].label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** Nederlandse getalweergave, met de precisie die de bron waarmaakt. */
function fmt(waarde: number, unit: "g" | "mg" | "µg"): string {
  // mg leest als heel getal zodra het er een is; g en µg houden één decimaal.
  const decimalen = unit === "mg" && waarde >= 10 ? 0 : 1;
  return waarde.toFixed(decimalen).replace(".", ",");
}

/**
 * Eén regel als leesbare zin — een band, nooit een punt en nooit een claim.
 *
 * Bijvoorbeeld: *"Amandelen · handvol (25 g) — magnesium 39–110 mg"*. Wat er
 * bewust **niet** staat is een percentage van een ADH en elke suggestie over
 * supplementen; dit beschrijft een product, het geeft geen advies.
 */
export function beschrijfBijdrage(
  regel: NutrientBronRegel,
  nutrient: NutrientId,
): string {
  const lo = fmt(regel.band.lo, regel.unit);
  const hi = fmt(regel.band.hi, regel.unit);
  const band = lo === hi ? `${lo} ${regel.unit}` : `${lo}–${hi} ${regel.unit}`;
  return `${regel.labelNl} · ${regel.portieLabel} — ${inZin(nutrient)} ${band}`;
}

/**
 * De som over een selectie, met de naam die hij moet dragen.
 *
 * Een som over gekozen producten is een **ondergrens**: je noemde niet alles.
 * Het woord "minstens" reist daarom verplicht mee, ook in een compacte
 * weergave — dat ene woord is het verschil tussen een eerlijk instrument en
 * schijnprecisie (BESLUIT §2).
 */
export function beschrijfSom(
  nutrient: NutrientId,
  regels: readonly NutrientBronRegel[],
): string | null {
  if (regels.length === 0) return null;
  const unit = UNIT[nutrient];
  const lo = regels.reduce((som, r) => som + r.band.lo, 0);
  const hi = regels.reduce((som, r) => som + r.band.hi, 0);
  return `Minstens ${fmt(lo, unit)}–${fmt(hi, unit)} ${unit} ${inZin(nutrient)} uit de bronnen die je noemde.`;
}

/**
 * Het opname-oordeel over een concrete selectie — een gerecht of een dag.
 *
 * Dit is de plek waar de fytaat-uitspraak wél hoort: over een maaltijd, niet
 * over een product (ONDERZOEK §1.8). Er wordt geen fytaat:zink-ratio berekend —
 * die getallen hebben we niet, en ze verzinnen zou erger zijn dan ze weglaten.
 * Wat we wél weten is welk deel van de bijdrage uit geremde bronnen komt, en de
 * regel uit BESLUIT §2 hangt daaraan: komt meer dan de helft uit fytaatrijke
 * bronnen, dan staat dat erbij.
 *
 * `null` als er niets te melden valt — een lege selectie, of een stof waar
 * fytaat geen rol speelt.
 */
export function opnameOordeelVoorSelectie(
  nutrient: NutrientId,
  regels: readonly NutrientBronRegel[],
): string | null {
  if (!OPNAME_ANNOTATIE[nutrient]) return null;
  const totaal = regels.reduce((som, r) => som + r.band.point, 0);
  if (totaal <= 0) return null;
  const geremd = regels
    .filter((r) => r.opname.reduced)
    .reduce((som, r) => som + r.band.point, 0);
  if (geremd * 2 <= totaal) return null;
  return "Meer dan de helft komt hier uit fytaatrijke bronnen — reken op een deel van wat het getal suggereert. Hoeveel precies hangt van de hele maaltijd af, niet van één product.";
}
