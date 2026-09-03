import type { WerkbankPrioriteit } from "@/lib/domein-werkbank";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";

/**
 * Voeding als drie knoppen in plaats van zes.
 *
 * **Waarom dit bestand bestaat.** De eetbasis-piramide heeft zes lagen
 * (`NUTRITION_LAYERS`, canon uit BESLUIT_VOEDING_PIRAMIDE_V1) en die blijven
 * de bron: de check rekent erop, de staten hangen eraan, en de rail-deeplinks
 * verwijzen ernaar. Maar zes knoppen op één scherm, elk met een eigen paneel
 * eronder, gaven zes plekken waar hetzelfde antwoord in een andere vorm stond
 * — een ranglijst op P1, nóg een ranglijst op P3, een derde op P4. Dat is geen
 * verdieping maar herhaling.
 *
 * Dit is dus een *weergave*-laag, geen nieuwe waarheid: de zes lagen blijven
 * bestaan en worden hier op drie knoppen gelegd. Wie de piramide wil wijzigen
 * doet dat nog steeds in `lifestyle-pyramid.ts`.
 *
 * **Waarom deze drie, in deze volgorde.**
 *
 * 1. **Meten & timing** — hier vul je je logboek. Dat staat vooraan omdat het
 *    de enige plek is waar je iets *invoert*; al het andere op dit scherm is
 *    een uitkomst daarvan. Een scherm dat opent met een oordeel over eten dat
 *    je nog niet hebt ingevuld, vraagt om vertrouwen dat het nog niet verdiend
 *    heeft.
 * 2. **Voedingsbasis** — wat je eet en wat dat zegt. Hier komen de oude lagen
 *    1, 2 en 4 samen: de basis, de kwaliteit ervan, en of het volstaat voor
 *    jouw situatie. Drie vragen over dezelfde maaltijden, uit dezelfde check —
 *    ze stonden alleen apart omdat de piramide ze apart nummert.
 * 3. **Aanvullen & vergelijken** — pas als 1 en 2 er staan: haal je het uit je
 *    eten, of komt er een supplement in beeld. Dit is de laag waar het scherm
 *    naartoe werkt.
 *
 * **Wat er niet meer is.** Laag 3 (Verhoudingen) toonde de verdeling over je
 * eetmomenten. Dat is een detail van je logboek, geen eigen stap in een route
 * — het stond op het scherm als een vraag waar niemand mee binnenkomt.
 */

export type DrieluikId = "meten" | "basis" | "aanvullen";

export type DrieluikStap = {
  id: DrieluikId;
  naam: string;
  /** Eén regel: wat beantwoordt deze knop? */
  samenvatting: string;
  /**
   * De ladderlagen die hieronder vallen, in de volgorde waarin ze getoond
   * worden. De eerste is leidend voor staat en deeplink.
   */
  lagen: readonly number[];
};

export const DRIELUIK: readonly DrieluikStap[] = [
  {
    id: "meten",
    naam: "Meten & timing",
    samenvatting: "Vul je dag in — hier komt de rest vandaan.",
    lagen: [5],
  },
  {
    id: "basis",
    naam: "Voedingsbasis",
    samenvatting: "Wat je eet, hoe het staat, en of het voor jou volstaat.",
    lagen: [1, 2, 4],
  },
  {
    id: "aanvullen",
    naam: "Aanvullen & vergelijken",
    samenvatting: "Uit je eten of uit een potje — per stof.",
    lagen: [6],
  },
] as const;

/** De ladderlaag waar een knop op deeplinkt en zijn staat vandaan haalt. */
export function hoofdLaag(stap: DrieluikStap): number {
  return stap.lagen[0];
}

/** Bij welke knop een ladderlaag hoort, of null als hij niet meer getoond wordt. */
export function stapVoorLaag(laag: number): DrieluikStap | null {
  return DRIELUIK.find((stap) => stap.lagen.includes(laag)) ?? null;
}

/**
 * Eén knop, met de staat en telling van de lagen die eronder vallen.
 *
 * **Hoe drie staten er één worden.** `Voedingsbasis` bundelt de lagen 1, 2 en
 * 4, die elk hun eigen staat uit de check krijgen. De knop toont de *zwaarste*
 * daarvan: staat één van de drie op `winst`, dan is dat wat je wilt weten. Het
 * alternatief — een gemiddelde — bestaat niet: `winst` en `ok` middelen niet
 * tot iets dat ergens op slaat, en een knop die `ok` zegt terwijl er een gat
 * onder zit liegt over de enige vraag die telt.
 */
export type DrieluikKnop = {
  id: DrieluikId;
  naam: string;
  samenvatting: string;
  /** De laag waar deze knop op opent. */
  laag: number;
  /** Alle lagen die hij toont. */
  lagen: readonly number[];
  staat: LeefstijlLayerState | null;
  /** Het aantal feiten onder alle lagen samen. */
  feiten: number;
  /** Ligt hier volgens de check je grootste winst? */
  isWinst: boolean;
};

const STAAT_GEWICHT: Record<LeefstijlLayerState, number> = {
  winst: 0,
  watch: 1,
  ok: 2,
  wacht: 3,
};

function zwaarsteStaat(
  staten: readonly (LeefstijlLayerState | null)[],
): LeefstijlLayerState | null {
  let gekozen: LeefstijlLayerState | null = null;
  for (const staat of staten) {
    if (staat == null) {
      continue;
    }
    if (gekozen == null || STAAT_GEWICHT[staat] < STAAT_GEWICHT[gekozen]) {
      gekozen = staat;
    }
  }
  return gekozen;
}

/**
 * De drie knoppen, gevoed door de zes werkbank-prioriteiten.
 *
 * Werkt op `WerkbankPrioriteit[]` en niet rechtstreeks op de readout, zodat de
 * bestaande bouwers (`bouwWerkbankPrioriteiten`) de enige plek blijven waar de
 * check op lagen wordt afgebeeld.
 */
export function bouwDrieluik(
  prioriteiten: readonly WerkbankPrioriteit[],
): DrieluikKnop[] {
  return DRIELUIK.map((stap) => {
    const rijen = stap.lagen
      .map((laag) => prioriteiten.find((rij) => rij.id === laag))
      .filter((rij): rij is WerkbankPrioriteit => rij != null);

    return {
      id: stap.id,
      naam: stap.naam,
      samenvatting: stap.samenvatting,
      laag: hoofdLaag(stap),
      lagen: stap.lagen,
      staat: zwaarsteStaat(rijen.map((rij) => rij.staat)),
      feiten: rijen.reduce((som, rij) => som + rij.feiten, 0),
      isWinst: rijen.some((rij) => rij.isWinst),
    };
  });
}

/**
 * Welke knop openstaat bij binnenkomst.
 *
 * Een deeplink naar een laag opent de knop die hem draagt — ook als dat een
 * laag is die zelf geen knop meer heeft (P1, P2 en P4 openen allemaal
 * Voedingsbasis). Zonder deeplink: de eerste knop, want daar vul je in.
 */
export function kiesStartKnop({
  urlLayer,
  knoppen,
}: {
  urlLayer?: number | null;
  knoppen: readonly DrieluikKnop[];
}): DrieluikId | null {
  if (urlLayer != null) {
    const stap = stapVoorLaag(urlLayer);
    if (stap && knoppen.some((knop) => knop.id === stap.id)) {
      return stap.id;
    }
  }
  return knoppen[0]?.id ?? null;
}
