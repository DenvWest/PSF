import type { NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { aandeelVanRi, REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  nutrientenUitItems,
  sanitizeItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";

/**
 * Het tekortsysteem: hoe hardnekkig is een tekort, gemeten over vier vensters.
 *
 * ## Waarom vier vensters en niet één gemiddelde
 *
 * Dit is de kern van het hele dashboard, en hij gaat tegen de intuïtie in.
 *
 * Omega-3 staat op een dag met zalm op ver boven de drempel en over een week
 * op een derde daarvan. De gebruikelijke reflex is die twee te middelen tot
 * één getal — maar dan verdwijnt precies de bevinding. **Een piek is iets
 * anders dan een patroon.** Een stof die in alle vier de vensters laag staat,
 * is een structureel tekort; een stof die alleen vandaag laag staat, is een
 * dag.
 *
 * Daarom staan 1, 7, 14 en 30 dagen náást elkaar en wordt er nooit één
 * samengesteld cijfer van gemaakt. Het verschil tússen de vensters is de
 * informatie.
 *
 * ## Wat een venster meet
 *
 * Het gemiddelde over de dagen die je registreerde — niet over de dagen die
 * het venster lang is, en niet over de dagen waarop de stof toevallig
 * voorkwam. Wie in dertig dagen zes dagen registreerde, krijgt het gemiddelde
 * van die zes; `dagen` zegt hoeveel dat er waren, zodat de UI "dit is je
 * maand" van "dit zijn zes dagen uit je maand" kan onderscheiden.
 *
 * Die tweede noemer is de makkelijkste fout in dit hele systeem. Wie één keer
 * per week vis eet, haalt op díé dag ruim de omega-3-drempel. Middel je alleen
 * over de visdagen, dan staat er "je gemiddelde dag haalt 500 %" terwijl je op
 * zes van de zeven dagen niets binnenkreeg. Een dag zonder deze stof is een
 * echte nul: je noemde die dag wél bronnen, en geen ervan droeg hem.
 * `dagenMetBron` houdt het onderscheid zichtbaar.
 *
 * ## De asymmetrie-regel blijft gelden
 *
 * Elk bedrag hier is een **ondergrens** — het komt uit `nutrientenUitItems`,
 * dat optelt over de producten die je noemde. Daaruit volgt wat de UI wel en
 * niet mag zeggen:
 *
 * > Een ondergrens kan "gehaald" bewijzen, en "niet gehaald" nooit.
 *
 * Een venster dat de RI haalt, bewijst dekking; wat je vergat te noemen kan er
 * alleen bij komen. Een venster dat hem niet haalt, bewijst niets — daarom
 * heet het veld `gedekt` en niet `tekort`, en daarom draagt
 * {@link Vensterreeks} een `bewijsbaar`-vlag.
 *
 * ## Niet elke stof is bewijsbaar
 *
 * Zink levert 1–4 mg per portie tegen een RI van 10 mg; alleen oesters halen
 * dat in één portie. Vitamine D komt bij vrijwel iedereen uit zonlicht en
 * verrijking, niet uit voeding. Een dagboek dat niet álles vangt, komt daar
 * nooit aan — en meer dagen meten maakt een onmeetbare stof niet meetbaar.
 *
 * Een kolom die nooit een vinkje kan geven, leest als falen terwijl hij een
 * eigenschap van de méétmethode toont. Daarom krijgen die twee geen
 * dekkingsoordeel maar alleen hun bronnentelling, met de reden erbij.
 */

/** De vier vensters, in dagen. Vast — het verschil ertussen is de bevinding. */
export const VENSTERS = [1, 7, 14, 30] as const;

export type VensterLengte = (typeof VENSTERS)[number];

export type Venster = {
  dagen_terug: VensterLengte;
  /** Gemiddelde ondergrens per dag over de dagen die er zijn. */
  gemiddeld: number;
  /** Deel van de RI dat dat dekt, of null wanneer het doel elders vandaan komt. */
  aandeel: number | null;
  /** Hoeveel geregistreerde dagen in dit venster vielen — de noemer. */
  dagen: number;
  /**
   * Op hoeveel van die dagen een bron voor déze stof stond.
   *
   * Het verschil met `dagen` is zelf een bevinding: omega-3 uit één visdag per
   * week is iets anders dan omega-3 dat elke dag een beetje binnenkomt, ook
   * als het gemiddelde gelijk is.
   */
  dagenMetBron: number;
  /**
   * Of de ondergrens de RI haalt.
   *
   * True bewijst dekking. False bewijst *niets* — zie de asymmetrie-regel in
   * de moduledoc. Null wanneer de stof niet bewijsbaar is.
   */
  gedekt: boolean | null;
};

export type Richting = "verbetert" | "verslechtert" | "vlak" | "piekt" | "onbekend";

export type Vensterreeks = {
  nutrient: NutrientId;
  label: string;
  unit: "g" | "mg" | "µg";
  vensters: Venster[];
  /**
   * Of een dagboek deze stof überhaupt kan aantonen.
   *
   * False bij zink en vitamine D: de bronnen leveren te weinig per portie om
   * de RI met een onvolledige registratie te halen. Dan toont de UI de
   * bronnentelling en geen oordeel.
   */
  bewijsbaar: boolean;
  richting: Richting;
};

/**
 * Stoffen die een dagboek niet kan aantonen, met de reden.
 *
 * Geen instelling maar een eigenschap van de meetmethode: zie de moduledoc.
 */
export const NIET_BEWIJSBAAR: Partial<Record<NutrientId, string>> = {
  zinc:
    "Bronnen leveren 1 tot 4 mg per portie tegen een referentie-inname van 10 mg. Alleen oesters halen dat in één keer, dus een dagboek dat niet alles vangt komt er nooit aan.",
  vitamin_d:
    "Komt bij vrijwel iedereen uit zonlicht en verrijkte producten, niet uit gewone voeding. Alleen vette vis tilt een dag erboven.",
};

function itemsVan(dag: DagboekDag): DagboekItem[] {
  return sanitizeItems(dag.items ?? []);
}

/**
 * Bepaalt de richting uit de reeks, van het langste venster naar vandaag.
 *
 * "Piekt" is een eigen uitkomst en geen variant van verbeteren: één dag ver
 * boven een vlakke maand betekent dat je gisteren zalm at, niet dat je patroon
 * verandert. Het onderscheid bestaat omdat de UI er iets anders mee moet — bij
 * een piek is het advies "houd dit vast", bij verbetering "dit werkt".
 */
function bepaalRichting(vensters: readonly Venster[]): Richting {
  const gevuld = vensters.filter((v) => v.dagen > 0);
  if (gevuld.length < 2) return "onbekend";

  const kort = gevuld[0]!;
  const lang = gevuld[gevuld.length - 1]!;
  if (lang.gemiddeld === 0) return "onbekend";

  const verhouding = kort.gemiddeld / lang.gemiddeld;

  // Eén dag die meer dan het dubbele van de lange termijn laat zien, is een
  // uitschieter en geen trend — zeker bij stoffen die uit één bron komen.
  if (kort.dagen_terug === 1 && verhouding >= 2) return "piekt";
  if (verhouding >= 1.15) return "verbetert";
  if (verhouding <= 0.85) return "verslechtert";
  return "vlak";
}

function bouwVenster(
  nutrient: NutrientId,
  dagen: readonly DagboekDag[],
  lengte: VensterLengte,
  vandaag: string,
): Venster {
  const grens = new Date(vandaag);
  grens.setDate(grens.getDate() - (lengte - 1));
  const grensIso = grens.toISOString().slice(0, 10);

  const inVenster = dagen.filter((dag) => dag.date >= grensIso && dag.date <= vandaag);

  let som = 0;
  let metBron = 0;
  for (const dag of inVenster) {
    const stof = nutrientenUitItems(itemsVan(dag)).find((n) => n.nutrient === nutrient);
    if (!stof) continue;
    som += stof.minstens;
    metBron += 1;
  }

  // Delen door álle geregistreerde dagen, niet alleen door de dagen waarop
  // deze stof voorkwam. Dat verschil is groot en makkelijk mis te gaan: wie
  // één keer per week vis eet, haalt op die dag ruim de omega-3-drempel. Zou
  // je alleen over de visdagen middelen, dan staat er "je gemiddelde dag haalt
  // 500 %" — terwijl je op zes van de zeven dagen niets binnenkreeg.
  //
  // De noemer is dus het aantal dagen dat je iets registreerde. Een dag zonder
  // deze stof is een echte nul voor deze stof: je noemde die dag wél bronnen,
  // en geen ervan droeg hem.
  const geregistreerd = inVenster.length;
  const gemiddeld =
    geregistreerd > 0 ? Math.round((som / geregistreerd) * 10) / 10 : 0;
  const aandeel = geregistreerd > 0 ? aandeelVanRi(nutrient, gemiddeld) : null;
  const bewijsbaar = !(nutrient in NIET_BEWIJSBAAR);

  return {
    dagen_terug: lengte,
    gemiddeld,
    aandeel,
    dagen: geregistreerd,
    dagenMetBron: metBron,
    // Alleen een gehaalde RI is een bewijs. Niet gehaald blijft null noch
    // false-als-oordeel: het veld zegt "wel bewezen" of "niet bewezen", en de
    // UI vertaalt dat nooit naar "je komt tekort".
    gedekt:
      !bewijsbaar || geregistreerd === 0 || aandeel === null ? null : aandeel >= 1,
  };
}

/**
 * De vier vensters per nutriënt, op volgorde van `NUTRIENT_ORDER`.
 *
 * `vandaag` wordt meegegeven in plaats van hier bepaald, zodat dit puur blijft
 * en een test een vaste dag kan kiezen.
 */
export function bouwTekortsysteem(
  dagen: readonly DagboekDag[],
  vandaag: string,
): Vensterreeks[] {
  return NUTRIENT_ORDER.map((nutrient) => {
    const vensters = VENSTERS.map((lengte) =>
      bouwVenster(nutrient, dagen, lengte, vandaag),
    );
    return {
      nutrient,
      label: nutrientReferences[nutrient].label,
      unit: REFERENCE_INTAKES[nutrient].unit,
      vensters,
      bewijsbaar: !(nutrient in NIET_BEWIJSBAAR),
      richting: bepaalRichting(vensters),
    };
  });
}

export type Bevinding = {
  nutrient: NutrientId;
  label: string;
  /** Op hoeveel van de geregistreerde dagen in 30 dagen de RI niet bewezen werd. */
  dagenOnder: number;
  dagenGemeten: number;
  /** Het aandeel op het langste gevulde venster, als fractie. */
  aandeelLang: number;
  richting: Richting;
};

/**
 * De ene stof die er het meest toe doet: laag over álle vensters, en met de
 * meeste dagen eronder.
 *
 * Alleen bewijsbare stoffen komen in aanmerking. Zink staat bijna altijd het
 * laagst, en zou de bevinding dus permanent bezetten met een uitkomst waar
 * niemand iets aan heeft — precies de reden dat `bewijsbaar` bestaat.
 *
 * Null wanneer er te weinig gemeten is of wanneer alles gedekt is. Dan heeft
 * het scherm geen bevinding, en dat is een eerlijker uitkomst dan de minst
 * goede stof tot probleem verheffen.
 */
export function bepaalBevinding(
  reeksen: readonly Vensterreeks[],
  dagen: readonly DagboekDag[],
  vandaag: string,
): Bevinding | null {
  const grens = new Date(vandaag);
  grens.setDate(grens.getDate() - 29);
  const grensIso = grens.toISOString().slice(0, 10);
  const maand = dagen.filter((dag) => dag.date >= grensIso && dag.date <= vandaag);

  let beste: Bevinding | null = null;

  for (const reeks of reeksen) {
    if (!reeks.bewijsbaar) continue;

    const langste = [...reeks.vensters].reverse().find((v) => v.dagen > 0);
    if (!langste || langste.aandeel === null || langste.aandeel >= 1) continue;

    let dagenOnder = 0;
    let dagenGemeten = 0;
    for (const dag of maand) {
      const stof = nutrientenUitItems(itemsVan(dag)).find((n) => n.nutrient === reeks.nutrient);
      if (!stof) continue;
      dagenGemeten += 1;
      const aandeel = aandeelVanRi(reeks.nutrient, stof.minstens);
      if (aandeel !== null && aandeel < 1) dagenOnder += 1;
    }

    if (dagenGemeten === 0) continue;

    const kandidaat: Bevinding = {
      nutrient: reeks.nutrient,
      label: reeks.label,
      dagenOnder,
      dagenGemeten,
      aandeelLang: langste.aandeel,
      richting: reeks.richting,
    };

    // Hardnekkigheid eerst: op hoeveel van je dagen kwam je er niet aan. Bij
    // gelijke stand wint het laagste aandeel — dan is het gat groter.
    const hardnekkiger =
      !beste ||
      kandidaat.dagenOnder > beste.dagenOnder ||
      (kandidaat.dagenOnder === beste.dagenOnder &&
        kandidaat.aandeelLang < beste.aandeelLang);

    if (hardnekkiger) beste = kandidaat;
  }

  return beste;
}
