import { getVoedingsmiddel, type Voedingsmiddel } from "@/data/nutrition/food-items";
import {
  EETMOMENTEN,
  isEetmomentId,
  type DagMomenten,
  type EetmomentId,
  type MomentInhoud,
} from "@/lib/nutrition-eetmomenten";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Het dagboek op productniveau.
 *
 * ## Waarom er een derde vorm bij komt
 *
 * Het dagboek kende twee vormen, en beide blijven bestaan:
 *
 * 1. `portions` — porties per voedselgroep per dag. De bron waar alle analyse
 *    op rekent (breedte, variatie, weekendverschil, de zelfrapport-brug).
 * 2. `meals` — dezelfde porties, maar per eetmoment. De invoervorm sinds
 *    september: mensen halen hun dag per moment terug, niet per groep.
 *
 * Wat allebei niet kunnen is de vraag beantwoorden waar het Kompas over gaat:
 * *welke stoffen kwamen er vandaag langs?* "3 porties groente" is voor
 * magnesium en foliumzuur een heel ander antwoord bij spinazie dan bij
 * komkommer. Zonder het product te kennen kan het scherm alleen een gemiddelde
 * groente verzinnen, en dat is precies het soort schijnnauwkeurigheid dat deze
 * codebase elders weigert.
 *
 * 3. `items` — welk product, hoeveel porties, bij welk moment. Dat is deze
 *    module.
 *
 * ## Waarom de andere twee niet vervallen
 *
 * `items` is rijker maar niet completer: wie weet dát hij groente at maar niet
 * meer welke, moet dat kwijt kunnen. De groepsvorm blijft daarom de vangnet-
 * invoer, en `items` telt er automatisch naar toe op — één product hoort bij
 * één dagboekgroep, dus `itemsNaarMomenten` levert exact de map die `meals`
 * altijd al was. Alles wat op `portions` rekent blijft daardoor werken zonder
 * één regel wijziging, en een dag uit de groepen-tijd blijft leesbaar.
 */

export type DagItem = {
  /** Sleutel in `VOEDINGSMIDDELEN`. */
  key: string;
  /** Aantal porties van dat product op dat moment. Hele porties. */
  porties: number;
};

/** Wat er op één dag per eetmoment op tafel stond, op productniveau. */
export type DagItems = Partial<Record<EetmomentId, DagItem[]>>;

/** Bovengrens per regel. Hoger is vrijwel altijd een typefout. */
export const MAX_PORTIES_PER_ITEM = 20;
/** Bovengrens per moment — een lijst die langer is, is geen maaltijd meer. */
export const MAX_ITEMS_PER_MOMENT = 30;

/**
 * Tel de items op tot porties per voedselgroep per moment.
 *
 * Dit is de brug naar alles wat er al staat. Twee producten uit dezelfde groep
 * op hetzelfde moment (spinazie én tomaat bij het avondeten) tellen op tot twee
 * porties groente — precies wat iemand met de groepsvorm zelf had ingevuld.
 */
export function itemsNaarMomenten(items: DagItems): DagMomenten {
  const momenten: DagMomenten = {};

  for (const moment of EETMOMENTEN) {
    const regels = items[moment.id];
    if (!regels || regels.length === 0) continue;

    const inhoud: MomentInhoud = {};
    for (const regel of regels) {
      const product = getVoedingsmiddel(regel.key);
      if (!product || regel.porties <= 0) continue;
      const groep: VoedselgroepId = product.groep;
      inhoud[groep] = (inhoud[groep] ?? 0) + Math.trunc(regel.porties);
    }
    if (Object.keys(inhoud).length > 0) {
      momenten[moment.id] = inhoud;
    }
  }

  return momenten;
}

/** Alle regels van een dag, in de volgorde van de eetmomenten. */
export function alleDagItems(items: DagItems): { moment: EetmomentId; item: DagItem }[] {
  const rijen: { moment: EetmomentId; item: DagItem }[] = [];
  for (const moment of EETMOMENTEN) {
    for (const item of items[moment.id] ?? []) {
      rijen.push({ moment: moment.id, item });
    }
  }
  return rijen;
}

/** De producten van een dag, met hun aantal porties opgeteld over de momenten. */
export function productenVanDag(
  items: DagItems,
): { product: Voedingsmiddel; porties: number }[] {
  const perKey = new Map<string, number>();
  for (const { item } of alleDagItems(items)) {
    perKey.set(item.key, (perKey.get(item.key) ?? 0) + item.porties);
  }

  const rijen: { product: Voedingsmiddel; porties: number }[] = [];
  for (const [key, porties] of perKey) {
    const product = getVoedingsmiddel(key);
    if (!product || porties <= 0) continue;
    rijen.push({ product, porties });
  }
  return rijen;
}

/** Aantal regels op een dag — de telling onder de dagstrip. */
export function itemsTelling(items: DagItems): number {
  return alleDagItems(items).length;
}

export function heeftItems(items: DagItems): boolean {
  return itemsTelling(items) > 0;
}

/**
 * Eén regel toevoegen. Hetzelfde product op hetzelfde moment telt op in plaats
 * van een tweede rij te maken: twee keer "1 portie spinazie" bij het avondeten
 * is twee porties, en twee identieke rijen zijn onleesbaar.
 */
export function voegItemToe(
  items: DagItems,
  moment: EetmomentId,
  key: string,
  porties = 1,
): DagItems {
  const bestaand = items[moment] ?? [];
  const index = bestaand.findIndex((regel) => regel.key === key);
  const volgende =
    index >= 0
      ? bestaand.map((regel, i) =>
          i === index
            ? {
                ...regel,
                porties: Math.min(regel.porties + porties, MAX_PORTIES_PER_ITEM),
              }
            : regel,
        )
      : [...bestaand, { key, porties: Math.min(porties, MAX_PORTIES_PER_ITEM) }].slice(
          0,
          MAX_ITEMS_PER_MOMENT,
        );

  return { ...items, [moment]: volgende };
}

/** Porties van één regel zetten; 0 of minder haalt de regel weg. */
export function zetItemPorties(
  items: DagItems,
  moment: EetmomentId,
  key: string,
  porties: number,
): DagItems {
  const bestaand = items[moment] ?? [];
  const volgende =
    porties > 0
      ? bestaand.map((regel) =>
          regel.key === key
            ? { ...regel, porties: Math.min(Math.trunc(porties), MAX_PORTIES_PER_ITEM) }
            : regel,
        )
      : bestaand.filter((regel) => regel.key !== key);

  const uit: DagItems = { ...items };
  if (volgende.length === 0) {
    delete uit[moment];
  } else {
    uit[moment] = volgende;
  }
  return uit;
}

/**
 * Ruwe opslag naar een geldige itemstructuur.
 *
 * Zelfde filosofie als `sanitizePortions`: een onbekende productsleutel is een
 * client die voorloopt of een tabel die krompt, geen reden om iemands dag weg
 * te gooien. Hij valt eraf, de rest blijft staan.
 */
export function parseDagItems(raw: unknown): DagItems {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const uit: DagItems = {};
  for (const [momentId, lijst] of Object.entries(raw as Record<string, unknown>)) {
    if (!isEetmomentId(momentId) || !Array.isArray(lijst)) continue;

    const regels: DagItem[] = [];
    for (const ruw of lijst.slice(0, MAX_ITEMS_PER_MOMENT)) {
      if (!ruw || typeof ruw !== "object" || Array.isArray(ruw)) continue;
      const record = ruw as Record<string, unknown>;
      // `k`/`n` is de opslagvorm: een dag met dertig regels scheelt zo een
      // derde aan bytes, en de vertaling staat op één plek.
      const key = typeof record.k === "string" ? record.k : null;
      const aantal = typeof record.n === "number" ? record.n : null;
      if (!key || aantal == null || !Number.isFinite(aantal) || aantal <= 0) continue;
      if (!getVoedingsmiddel(key)) continue;
      if (regels.some((regel) => regel.key === key)) continue;
      regels.push({ key, porties: Math.min(Math.trunc(aantal), MAX_PORTIES_PER_ITEM) });
    }

    if (regels.length > 0) {
      uit[momentId] = regels;
    }
  }
  return uit;
}

/** De opslagvorm: korte sleutels, geen lege momenten. */
export function serialiseerDagItems(items: DagItems): Record<string, { k: string; n: number }[]> {
  const uit: Record<string, { k: string; n: number }[]> = {};
  for (const moment of EETMOMENTEN) {
    const regels = items[moment.id];
    if (!regels || regels.length === 0) continue;
    uit[moment.id] = regels.map((regel) => ({ k: regel.key, n: regel.porties }));
  }
  return uit;
}
