import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { gehalteWeergavePer100g } from "@/lib/nutrition-catalog-gehalte";
import { bedragVanItem, supplementVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { HOOFDMAALTIJDEN, verwachteMaaltijden } from "@/lib/nutrition-eetpatroon";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import type { StofBron, StofPerMoment } from "@/lib/nutrition-stof-bronnen";
import type { SupermarktPortie, SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { toBase } from "@/lib/nutrition-units";
import { berekenVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Eén stof gemeten per dag en per maaltijd, voor kernstoffen én gevolgde
 * stoffen, met wat een dagboek erover kan zeggen.
 *
 * ## Twee soorten stof, één vorm
 *
 * Een kernstof (magnesium, zink, …) rekent per dagboekregel met
 * `bedragVanItem`, dezelfde som als de krans en Per stof. Een gevolgde stof
 * (calcium, ijzer, …) rekent met `berekenVoedingswaarde`, dezelfde som als de
 * voedingswaardetabel, en telt ook etiketproducten mee. Daarna hebben ze
 * dezelfde vorm, zodat Trend, het stof-detail en de "waarom"-regel voor
 * iedere stof hetzelfde werken. Een nieuwe stof in `VOEDINGSWAARDE_VELDEN`
 * of `NUTRIENT_ORDER` doet zonder verbouwing mee.
 *
 * ## Wanneer een dag "volledig" is
 *
 * Een dagtotaal is een ondergrens: wat je niet registreerde kan er alleen bij.
 * Ontbreekt een hoofdmaaltijd, dan zegt een dag onder de norm niets. Daarom
 * heet een dag pas volledig als ontbijt, lunch én avondeten erin staan. Op
 * een onvolledige dag mag "gehaald" nog wel (een ondergrens die de norm haalt
 * is bewijs), "niet gehaald" niet. Over een maaltijd die je wél registreerde
 * valt altijd iets te zeggen (`BESLUIT_PATROON_STOF_EN_TREND_2026-10.md` §4).
 */

export type PatroonStof = NutrientId | SupermarktVeld;

export function isKernstof(stof: PatroonStof): stof is NutrientId {
  return (NUTRIENT_ORDER as readonly string[]).includes(stof);
}

/**
 * Waar een stof naar de supplementvergelijking linkt. Kernstoffen via hun
 * `comparisonPath`; een gevolgde stof krijgt hier een regel zodra er een
 * `/beste/*`-pagina voor bestaat. Eén plek, zodat een nieuwe stof of een
 * nieuwe vergelijking geen schermwerk vraagt.
 */
const VERGELIJKING_GEVOLGD: Partial<Record<SupermarktVeld, string>> = {};

export function supplementVergelijkingVoor(stof: PatroonStof): string | null {
  return isKernstof(stof) ? nutrientReferences[stof].comparisonPath : (VERGELIJKING_GEVOLGD[stof] ?? null);
}

export { HOOFDMAALTIJDEN };

export type VoedingsdataBron = {
  itemsPerDag: ReadonlyMap<string, readonly DagboekItem[]>;
  etiketPerDag: Readonly<Record<string, readonly SupermarktPortie[]>>;
  nevoProducten: ReadonlyMap<string, SupermarktProduct>;
  /** Hoofdmaaltijden die op die dag bewust niet gegeten zijn ("niet gegeten" in het dagboek). */
  overgeslagenPerDag?: ReadonlyMap<string, readonly EetmomentId[]>;
  /** Je gewone maaltijden uit Je doelen; leeg of weggelaten = alle drie. */
  gewoneMaaltijden?: readonly EetmomentId[] | null;
};

/** Wat één product op één maaltijd van deze stof leverde. `bedrag` null = geen gehalte bekend. */
export type StofBijdrage = {
  naam: string;
  moment: EetmomentId;
  bedrag: number | null;
  benaderd: boolean;
  supplement: boolean;
};

export type MomentMeting = {
  moment: EetmomentId;
  /** Of er op dit moment iets in het dagboek stond (ook zonder deze stof), of hij als "niet gegeten" staat. */
  geregistreerd: boolean;
  /** Bewust niet gegeten: geregistreerd met 0, niet in het gebruikelijke gemiddelde. */
  overgeslagen: boolean;
  som: number;
  /** De som zonder benaderingen: alleen hiermee mag "gehaald". */
  somStreng: number;
};

export type DagMeting = {
  datum: string;
  geregistreerd: boolean;
  /** Al je gewone maaltijden geregistreerd (of als niet gegeten gemarkeerd). */
  volledig: boolean;
  /** Je gewone maaltijden: wat deze dag nodig had om volledig te zijn. */
  verwacht: readonly EetmomentId[];
  som: number;
  somStreng: number;
  benaderd: boolean;
  momenten: MomentMeting[];
  bijdragen: StofBijdrage[];
};

function afgerond(waarde: number): number {
  return Math.round(waarde * 10) / 10;
}

function alsMoment(moment: string): EetmomentId {
  return EETMOMENTEN.find((m) => m.id === moment)?.id ?? "tussendoor";
}

function naamVanLog(log: SupermarktPortie): string | null {
  return log.product ? [log.product.merk, log.product.naam].filter(Boolean).join(" ") || null : null;
}

function kernBijdrage(item: DagboekItem, stof: NutrientId): StofBijdrage | null {
  const supplement = item.bron === "supplement";
  const naam = supplement ? supplementVanItem(item)?.labelNl : catalogEntry(item.key)?.labelNl;
  if (!naam) return null;
  const bedrag = bedragVanItem(item, stof);
  if (bedrag) {
    const inBasis = toBase(bedrag.value, bedrag.unit, stof);
    return { naam, moment: item.moment, bedrag: inBasis, benaderd: bedrag.benaderd === true, supplement };
  }
  // Een supplement van een andere stof hoort niet in deze lijst.
  if (supplement) return null;
  const weergave = gehalteWeergavePer100g(catalogEntry(item.key), stof);
  const bekendNul = weergave.soort === "nul" || weergave.soort === "spoor";
  return { naam, moment: item.moment, bedrag: bekendNul ? 0 : null, benaderd: false, supplement };
}

function gevolgdeBijdrage(
  stof: SupermarktVeld,
  naam: string,
  moment: EetmomentId,
  invoer: Parameters<typeof berekenVoedingswaarde>[0],
): StofBijdrage {
  const rij = berekenVoedingswaarde(invoer).rijen.find((r) => r.veld === stof);
  return { naam, moment, bedrag: rij?.waarde ?? null, benaderd: rij?.benaderd === true, supplement: false };
}

function bijdragenVanDag(stof: PatroonStof, bron: VoedingsdataBron, datum: string): StofBijdrage[] {
  const items = bron.itemsPerDag.get(datum) ?? [];
  if (isKernstof(stof)) {
    // Etiketproducten dragen geen kernstoffen: ze staan erin als "geen gehalte".
    const etiket = (bron.etiketPerDag[datum] ?? []).flatMap((log): StofBijdrage[] => {
      const naam = naamVanLog(log);
      return naam ? [{ naam, moment: alsMoment(log.moment), bedrag: null, benaderd: false, supplement: false }] : [];
    });
    return [...items.flatMap((item) => kernBijdrage(item, stof) ?? []), ...etiket];
  }
  const uitItems = items.flatMap((item) => {
    // Supplementen dragen in de catalogus geen gevolgde stoffen.
    if (item.bron === "supplement") return [];
    const naam = catalogEntry(item.key)?.labelNl;
    if (!naam) return [];
    return [gevolgdeBijdrage(stof, naam, item.moment, { items: [item], nevoProducten: bron.nevoProducten })];
  });
  const uitEtiket = (bron.etiketPerDag[datum] ?? []).flatMap((log) => {
    const naam = naamVanLog(log);
    if (!naam) return [];
    return [gevolgdeBijdrage(stof, naam, alsMoment(log.moment), { items: [], supermarktLogs: [log], nevoProducten: bron.nevoProducten })];
  });
  return [...uitItems, ...uitEtiket];
}

function geregistreerdeMomenten(bron: VoedingsdataBron, datum: string): Set<EetmomentId> {
  const momenten = new Set<EetmomentId>();
  for (const item of bron.itemsPerDag.get(datum) ?? []) momenten.add(item.moment);
  for (const log of bron.etiketPerDag[datum] ?? []) momenten.add(alsMoment(log.moment));
  return momenten;
}

export function meetDag(stof: PatroonStof, bron: VoedingsdataBron, datum: string): DagMeting {
  const bijdragen = bijdragenVanDag(stof, bron, datum);
  const gegeten = geregistreerdeMomenten(bron, datum);
  // Wat je toch at, telt als gegeten: een maaltijd met items is niet overgeslagen.
  const overgeslagen = new Set(
    (bron.overgeslagenPerDag?.get(datum) ?? []).filter((moment) => !gegeten.has(moment)),
  );
  const geregistreerd = new Set([...gegeten, ...overgeslagen]);
  const verwacht = verwachteMaaltijden(bron.gewoneMaaltijden);

  const momenten = EETMOMENTEN.map(({ id }): MomentMeting => {
    let som = 0;
    let somStreng = 0;
    for (const bijdrage of bijdragen) {
      if (bijdrage.moment !== id || bijdrage.bedrag === null) continue;
      som += bijdrage.bedrag;
      if (!bijdrage.benaderd) somStreng += bijdrage.bedrag;
    }
    return {
      moment: id,
      geregistreerd: geregistreerd.has(id),
      overgeslagen: overgeslagen.has(id),
      som: afgerond(som),
      somStreng: afgerond(somStreng),
    };
  });

  return {
    datum,
    geregistreerd: geregistreerd.size > 0,
    volledig: verwacht.every((moment) => geregistreerd.has(moment)),
    verwacht,
    som: afgerond(momenten.reduce((totaal, m) => totaal + m.som, 0)),
    somStreng: afgerond(momenten.reduce((totaal, m) => totaal + m.somStreng, 0)),
    benaderd: bijdragen.some((b) => b.benaderd && b.bedrag !== null && b.bedrag > 0),
    momenten,
    bijdragen,
  };
}

export function meetPeriode(stof: PatroonStof, bron: VoedingsdataBron, datums: readonly string[]): DagMeting[] {
  return datums.map((datum) => meetDag(stof, bron, datum));
}

function volgorde(moment: EetmomentId): number {
  return EETMOMENTEN.findIndex((m) => m.id === moment);
}

/** Per product de som over de periode, grootste eerst: "Jouw bronnen" in het stof-detail. */
export function bronnenUitMeting(dagen: readonly DagMeting[], unit: string): StofBron[] {
  const perNaam = new Map<string, { totaal: number; dagen: Set<string>; momenten: Map<string, { datum: string; moment: EetmomentId }>; supplement: boolean }>();
  for (const dag of dagen) {
    for (const bijdrage of dag.bijdragen) {
      if (bijdrage.bedrag === null || bijdrage.bedrag <= 0) continue;
      const huidig = perNaam.get(bijdrage.naam) ?? {
        totaal: 0,
        dagen: new Set<string>(),
        momenten: new Map(),
        supplement: bijdrage.supplement,
      };
      huidig.totaal += bijdrage.bedrag;
      huidig.dagen.add(dag.datum);
      huidig.momenten.set(`${dag.datum}|${bijdrage.moment}`, { datum: dag.datum, moment: bijdrage.moment });
      perNaam.set(bijdrage.naam, huidig);
    }
  }
  return [...perNaam.entries()]
    .map(([naam, { totaal, dagen: opDagen, momenten, supplement }]) => ({
      naam,
      totaal: afgerond(totaal),
      unit,
      dagen: opDagen.size,
      momenten: [...momenten.values()].sort(
        (a, b) => a.datum.localeCompare(b.datum) || volgorde(a.moment) - volgorde(b.moment),
      ),
      supplement,
    }))
    .sort((a, b) => b.totaal - a.totaal);
}

/** Per maaltijd de som over de periode en hoe vaak hij geregistreerd is. */
export function perMomentUitMeting(dagen: readonly DagMeting[]): StofPerMoment[] {
  return EETMOMENTEN.map(({ id, label }) => {
    const metingen = dagen.flatMap((dag) => dag.momenten.filter((m) => m.moment === id && m.geregistreerd));
    return {
      moment: id,
      label,
      totaal: afgerond(metingen.reduce((som, m) => som + m.som, 0)),
      keer: metingen.length,
    };
  });
}

/** Producten zonder gehalte voor deze stof in de periode, uniek op naam. */
export function productenZonderGehalte(dagen: readonly DagMeting[]): string[] {
  return [...new Set(dagen.flatMap((dag) => dag.bijdragen.filter((b) => b.bedrag === null).map((b) => b.naam)))];
}
