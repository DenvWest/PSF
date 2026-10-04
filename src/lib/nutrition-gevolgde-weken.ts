import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import {
  VOEDINGSWAARDE_VELDEN,
  type Voedingswaarde,
  type VoedingswaardeVeld,
} from "@/lib/nutrition-voedingswaarde";
import { weekDatums } from "@/lib/nutrition-weekoverzicht";

/**
 * De gevolgde stoffen per week, voor Samenvatting, Deze week en Trend in Je
 * patroon. De tegenhanger van `nutrition-gevolgde-vensters.ts` (die middelt
 * over 1/3/7/30 dagen terug); dit middelt per kalenderweek, zoals het
 * weekoverzicht en de trend van de kernstoffen.
 *
 * Zelfde noemer: de dagen waarop je iets registreerde, niet zeven. Een dag
 * zonder registratie is onbekend, geen nul. Informatief: geen `gedekt`, geen
 * richting; het aandeel van de RI alleen waar een RI bestaat.
 */

export type GevolgdWeekPunt = {
  weekStart: string;
  /** Gemiddelde per geregistreerde dag, of null als geen product een waarde had. */
  gemiddeld: number | null;
  aandeel: number | null;
  dagen: number;
};

export type GevolgdeWeekReeks = VoedingswaardeVeld & { punten: GevolgdWeekPunt[] };

function geregistreerd(waarde: Voedingswaarde | undefined): waarde is Voedingswaarde {
  return waarde !== undefined && waarde.metWaarde + waarde.zonderWaarde > 0;
}

function veldVoor(stof: SupermarktVeld): VoedingswaardeVeld | undefined {
  return VOEDINGSWAARDE_VELDEN.find((v) => v.veld === stof);
}

function weekPunt(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  veld: VoedingswaardeVeld,
  start: string,
): GevolgdWeekPunt {
  let som = 0;
  let heeftWaarde = false;
  let dagen = 0;
  for (const datum of weekDatums(start)) {
    const waarde = perDag.get(datum);
    if (!geregistreerd(waarde)) continue;
    dagen += 1;
    const bedrag = waarde.rijen.find((rij) => rij.veld === veld.veld)?.waarde;
    if (bedrag === null || bedrag === undefined) continue;
    som += bedrag;
    heeftWaarde = true;
  }
  const gemiddeld = heeftWaarde && dagen > 0 ? som / dagen : null;
  return {
    weekStart: start,
    gemiddeld,
    aandeel: gemiddeld !== null && veld.ri !== null ? gemiddeld / veld.ri : null,
    dagen,
  };
}

export function bouwGevolgdeWeken(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  stoffen: readonly SupermarktVeld[],
  weekStarts: readonly string[],
): GevolgdeWeekReeks[] {
  return stoffen.flatMap((stof) => {
    const veld = veldVoor(stof);
    if (!veld) return [];
    return [{ ...veld, punten: weekStarts.map((start) => weekPunt(perDag, veld, start)) }];
  });
}

/** Per dag van de week de waarde; null waar niets geregistreerd is of geen product een waarde had. */
export function gevolgdPerDag(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  stof: SupermarktVeld,
  start: string,
): (number | null)[] {
  return weekDatums(start).map((datum) => {
    const waarde = perDag.get(datum);
    if (!geregistreerd(waarde)) return null;
    return waarde.rijen.find((rij) => rij.veld === stof)?.waarde ?? null;
  });
}
