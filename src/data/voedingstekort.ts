/**
 * Redactionele data voor de voedingstekort-gids (/voedingstekort).
 *
 * Dekkingscijfers zijn een algemeen beeld van typische inname t.o.v. een
 * praktische doelwaarde — geen ADH, geen bloedwaarde, geen diagnose.
 * Geen milligrammen: de grafiek praat in relatieve dekking, net als de
 * levenslijn van de bewegingsgids in relatieve reservebalken.
 */

export const NUTRITION_GAP_ACCENT = "oklch(0.66 0.085 148)";

export type NutritionGapPatternId = "mixed" | "plant" | "plantClosed";

export type NutritionGapNutrientId =
  | "b12"
  | "iron"
  | "iodine"
  | "omega3"
  | "vitaminD"
  | "calcium"
  | "zinc"
  | "selenium";

export type NutritionGapPattern = {
  id: NutritionGapPatternId;
  label: string;
  short: string;
  hint: string;
};

export type NutritionGapNutrient = {
  id: NutritionGapNutrientId;
  label: string;
  bodyRole: string;
  chronicShortage: string;
  veganNote: string;
  href: string;
  coverage: Record<NutritionGapPatternId, number>;
};

export const NUTRITION_GAP_PATTERNS: readonly NutritionGapPattern[] = [
  {
    id: "mixed",
    label: "Gemengd eten",
    short: "Vlees, vis of zuivel komt nog langs",
    hint: "B12 en calcium zitten vaak wel. Vis en zon zijn de zwakke plekken.",
  },
  {
    id: "plant",
    label: "Plantaardig, zonder extra aandacht",
    short: "Vegan of bijna, zonder B12 of verrijkte producten",
    hint: "Het bord kan vol en gezond ogen — en tóch structureel leeg zijn op een paar stoffen.",
  },
  {
    id: "plantClosed",
    label: "Plantaardig, mét de gaten dicht",
    short: "B12, jodium, algen/DHA, verrijkte drank, vitamine D in de winter",
    hint: "Hetzelfde patroon, andere uitkomst. De gaten zijn klein en voorspelbaar.",
  },
];

export const NUTRITION_GAP_NUTRIENTS: readonly NutritionGapNutrient[] = [
  {
    id: "b12",
    label: "Vitamine B12",
    bodyRole:
      "Helpt bij de aanmaak van rode bloedcellen en de normale werking van het zenuwstelsel.",
    chronicShortage:
      "De lever kan B12 jarenlang vasthouden. Daarom voelt een plantaardig patroon eerst ‘prima’ — tot de voorraad opraakt. Daarna: sluimerende moeheid, concentratie die zwaarder wordt, later tintelingen. Dat is geen diagnose; het is waarom wachten riskant is.",
    veganNote:
      "Zit vrijwel alleen in dierlijke producten. Zonder verrijkte voeding of een B12-supplement is een vegan patroon hier structureel leeg.",
    href: "/blog/vermoeidheid-bloedwaarden-checken-mannen",
    coverage: { mixed: 90, plant: 6, plantClosed: 94 },
  },
  {
    id: "iron",
    label: "IJzer",
    bodyRole:
      "Zit in hemoglobine, dat zuurstof naar spieren en brein brengt. Minder ijzer, zwaarder werk voor hetzelfde traplopen.",
    chronicShortage:
      "Eerst: eerder buiten adem, koud, moe na gewone dagen. Plantaardig ijzer (non-heem) neemt je lichaam lastiger op, vooral naast thee, koffie of veel volkoren. Chronisch laag houdt herstel en energie stil — zonder dat je ‘ziek’ bent.",
    veganNote:
      "Peulvruchten en bladgroen leveren ijzer, maar de opname is lager dan uit vlees. Vitamine C bij de maaltijd helpt; thee erbij juist niet.",
    href: "/blog/vermoeidheid-bloedwaarden-checken-mannen",
    coverage: { mixed: 78, plant: 48, plantClosed: 72 },
  },
  {
    id: "iodine",
    label: "Jodium",
    bodyRole:
      "Bouwsteen voor schildklierhormoon — het ritme van stofwisseling, temperatuur en energie.",
    chronicShortage:
      "Zonder vis, zuivel of gejodeerd zout zakt de inname vaak stil. Dat merkt je lichaam niet in een week, wel in een traag tempo: kouwelijk, zwaarder denken, energie die niet meer vanzelf komt. Schildklier hoort bij je huisarts, niet bij een webshop.",
    veganNote:
      "Zuivel en vis vallen weg. Gejodeerd zout en nori zijn de praktische knoppen — wilde zeewier kan juist te hoog zitten.",
    href: "/voeding-na-40",
    coverage: { mixed: 72, plant: 22, plantClosed: 80 },
  },
  {
    id: "omega3",
    label: "Omega-3 (EPA/DHA)",
    bodyRole:
      "EPA en DHA ondersteunen hart en brein. ALA uit lijnzaad is een andere stof — je lichaam zet er maar een paar procent van om.",
    chronicShortage:
      "Weinig vette vis betekent weinig EPA/DHA, jaar in jaar uit. Dat is geen acute crash, wel een stille achterstand in de vetzuren die je celwanden en brein gebruiken. Plantaardig omega-3 vult die vorm nauwelijks.",
    veganNote:
      "Walnoot en lijnzaad helpen, maar vervangen vis niet. Algenolie is de directe plantaardige bron van DHA.",
    href: "/voedingsstoffen/omega-3",
    coverage: { mixed: 42, plant: 10, plantClosed: 78 },
  },
  {
    id: "vitaminD",
    label: "Vitamine D",
    bodyRole:
      "Helpt calcium opnemen en draagt bij aan spieren, botten en het immuunsysteem. In Nederland maakt je huid van oktober tot maart nauwelijks wat aan.",
    chronicShortage:
      "Een winter zonder zon is voor bijna iedereen krap — of je nu vlees eet of niet. Langdurig laag hangt samen met vermoeidheid en spierzwakte. Voeding dekt dit gat zelden; vette vis helpt een beetje, planten bijna niet.",
    veganNote:
      "Zonder verrijkte drank of een wintersupplement is de plantaardige bijdrage verwaarloosbaar. Dit gat deelt een veganist met de meeste Nederlanders.",
    href: "/kennisbank/vitamine-d",
    coverage: { mixed: 38, plant: 28, plantClosed: 74 },
  },
  {
    id: "calcium",
    label: "Calcium",
    bodyRole:
      "Bouwsteen van botten en tanden; nodig voor spieren en zenuwen. Vitamine D bepaalt hoeveel je ervan benut.",
    chronicShortage:
      "Botweefsel vernieuwt langzaam. Jaren met te weinig calcium én vitamine D merk je niet op je 35e — wel in hoe stevig je skelet later nog is. Zuivel dekt dit makkelijk; zonder zuivel moet je het expres organiseren.",
    veganNote:
      "Verrijkte plantaardige drank, tofu met calciumzout en sesam zijn de vaste bronnen. Groene groenten alleen redden het zelden.",
    href: "/voeding-na-40",
    coverage: { mixed: 82, plant: 38, plantClosed: 76 },
  },
  {
    id: "zinc",
    label: "Zink",
    bodyRole:
      "Speelt mee in immuunsysteem, huid en herstel. Fytaat in granen en peulvruchten remt de opname.",
    chronicShortage:
      "Een structureel krappe zinkinname zie je niet op een weegschaal. Wel in hoe traag kleine wondjes genezen, hoe vaak je ‘net iets te lang’ een verkoudheid meesleept, hoe vlak herstel aanvoelt na training.",
    veganNote:
      "Pompoenpitten, peulvruchten en volkoren helpen, maar fytaat houdt een deel tegen. Spreiding over de dag is hier meer waard dan één mega-portie.",
    href: "/voedingsstoffen/zink",
    coverage: { mixed: 76, plant: 42, plantClosed: 70 },
  },
  {
    id: "selenium",
    label: "Selenium",
    bodyRole:
      "Ondersteunt de schildklier en antioxidatieve enzymen. In Nederland hangt de bodemstatus sterk af van wat er op je bord ligt.",
    chronicShortage:
      "Te weinig selenium is zeldzamer dan te weinig B12, maar in een strak plantaardig patroon zonder noten of vis verdwijnt het stilletjes. Het werkt achter de schermen — schildklier en celherstel — niet als een acute dip.",
    veganNote:
      "Eén paranoot per dag dekt dit gat meestal. Vis en eieren doen dat in een gemengd patroon vanzelf.",
    href: "/voeding-na-40",
    coverage: { mixed: 70, plant: 46, plantClosed: 74 },
  },
];

export function nutritionGapPattern(
  id: NutritionGapPatternId,
): NutritionGapPattern {
  const match = NUTRITION_GAP_PATTERNS.find((pattern) => pattern.id === id);
  if (!match) {
    throw new Error(`Onbekend voedingstekort-patroon: ${id}`);
  }
  return match;
}

export function nutritionGapNutrient(
  id: NutritionGapNutrientId,
): NutritionGapNutrient {
  const match = NUTRITION_GAP_NUTRIENTS.find((item) => item.id === id);
  if (!match) {
    throw new Error(`Onbekende micronutriënt: ${id}`);
  }
  return match;
}

export function nutritionGapCoverage(
  nutrientId: NutritionGapNutrientId,
  patternId: NutritionGapPatternId,
): number {
  return nutritionGapNutrient(nutrientId).coverage[patternId];
}

/** Hoeveel stoffen in dit patroon onder de krappe-drempel (50) zitten. */
export function nutritionGapLowCount(patternId: NutritionGapPatternId): number {
  return NUTRITION_GAP_NUTRIENTS.filter(
    (item) => item.coverage[patternId] < 50,
  ).length;
}
