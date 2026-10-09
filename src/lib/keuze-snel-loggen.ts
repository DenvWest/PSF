import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { dagboekProductVan } from "@/lib/keuze-dagboek-product";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { sanitizeItems, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";
import { wisDagboekCache } from "@/lib/use-dagboek-dagen";

/**
 * Een keuze met één tik in je dagboek zetten, vanuit Mijn keuzes: op het
 * gekozen moment, met de standaardportie — dezelfde waarde die het portiescherm
 * voorstelt (de eerste portie van het voedingsmiddel, of één dagdosis van het
 * supplement). Je blijft op je scherm; een andere portie of ongedaan maken
 * kan daarna.
 *
 * ## Waarom lezen vóór schrijven
 *
 * `POST /api/account/nutrition-daybook` zet de hele itemlijst van een dag
 * neer: een veld dat meekomt overschrijft. Een item toevoegen is dus: de dag
 * vers ophalen, het item eraan hangen, de lijst terugschrijven. Uit de cache
 * lezen zou een item uit een ander tabblad kunnen overschrijven. Schrijfacties
 * lopen achter elkaar, zodat twee snelle tikken elkaar niet inhalen.
 */

/** Het item voor een voedingsmiddel op een moment, met de eerste portie als gewicht. */
export function snelItemVoorEten(entry: CatalogEntry, moment: EetmomentId): DagboekItem | null {
  const grams = entry.porties[0]?.grams;
  if (!grams || grams <= 0) return null;
  return { moment, bron: "voeding", key: entry.key, grams };
}

/** Het item voor een supplement uit Keuze: één dagdosis, met het etiket zoals het nu is. Null zonder vaste dosis. */
export function snelItemVoorProduct(product: KeuzeProduct, moment: EetmomentId): DagboekItem | null {
  const etiket = dagboekProductVan(product);
  if (!etiket) return null;
  return { moment, bron: "supplement", key: product.slug, grams: 1, product: etiket };
}

function zelfde(a: DagboekItem, b: DagboekItem): boolean {
  return a.moment === b.moment && a.bron === b.bron && a.key === b.key && a.grams === b.grams;
}

let keten: Promise<unknown> = Promise.resolve();

function ná<T>(taak: () => Promise<T>): Promise<T> {
  const volgende = keten.then(taak, taak);
  keten = volgende.catch(() => undefined);
  return volgende;
}

async function leesItems(datum: string): Promise<DagboekItem[] | null> {
  const response = await fetch("/api/account/nutrition-daybook", { credentials: "include", cache: "no-store" });
  if (!response.ok) return null;
  const body = (await response.json()) as { days?: DagboekDag[] };
  const dag = body.days?.find((kandidaat) => kandidaat.date === datum);
  return sanitizeItems(dag?.items ?? []);
}

async function schrijfItems(datum: string, items: DagboekItem[]): Promise<boolean> {
  const response = await fetch("/api/account/nutrition-daybook", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: datum, items }),
  });
  if (response.ok) wisDagboekCache();
  return response.ok;
}

/** Wat je vandaag al in je dagboek hebt staan, of null als het niet lukt. */
export function leesVandaag(datum: string = todayInAgendaTimezone()): Promise<DagboekItem[] | null> {
  return leesItems(datum).catch(() => null);
}

/** Zet het item bij vandaag erbij. Geeft de nieuwe lijst van vandaag terug, of null. */
export function voegSnelToe(item: DagboekItem, datum: string = todayInAgendaTimezone()): Promise<DagboekItem[] | null> {
  return ná(async () => {
    try {
      const huidig = await leesItems(datum);
      if (!huidig) return null;
      const volgende = [...huidig, item];
      return (await schrijfItems(datum, volgende)) ? volgende : null;
    } catch {
      return null;
    }
  });
}

/** Haalt precies dit ene item weer weg (het laatste dat er zo uitziet). Geeft de nieuwe lijst terug, of null. */
export function verwijderSnel(item: DagboekItem, datum: string = todayInAgendaTimezone()): Promise<DagboekItem[] | null> {
  return ná(async () => {
    try {
      const huidig = await leesItems(datum);
      if (!huidig) return null;
      let index = -1;
      huidig.forEach((kandidaat, i) => {
        if (zelfde(kandidaat, item)) index = i;
      });
      if (index < 0) return huidig;
      const volgende = huidig.filter((_, i) => i !== index);
      return (await schrijfItems(datum, volgende)) ? volgende : null;
    } catch {
      return null;
    }
  });
}
