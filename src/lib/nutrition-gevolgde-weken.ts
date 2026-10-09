import type { GevolgdeNormen } from "@/data/nutrition/voedingsnormen";
import { normVoorVeld, STANDAARD_GEVOLGDE_NORMEN } from "@/lib/nutrition-normen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import {
  VOEDINGSWAARDE_VELDEN,
  type Voedingswaarde,
  type VoedingswaardeVeld,
} from "@/lib/nutrition-voedingswaarde";
import { weekDatums } from "@/lib/nutrition-weekoverzicht";

/**
 * De gevolgde stoffen over een periode, voor Per stof in Je patroon. Trend
 * rekent sinds 6 okt per dag of maaltijd via `nutrition-stof-meting.ts`.
 *
 * Zelfde noemer: de dagen waarop je iets registreerde, niet zeven. Een dag
 * zonder registratie is onbekend, geen nul. Informatief: geen `gedekt`, geen
 * richting; het aandeel van de norm alleen waar een norm bestaat.
 */

export type GevolgdWeekPunt = {
  weekStart: string;
  /** Gemiddelde per geregistreerde dag, of null als geen product een waarde had. */
  gemiddeld: number | null;
  aandeel: number | null;
  dagen: number;
};

export type GevolgdeWeekReeks = VoedingswaardeVeld & { norm: number | null; punten: GevolgdWeekPunt[] };

function geregistreerd(waarde: Voedingswaarde | undefined): waarde is Voedingswaarde {
  return waarde !== undefined && waarde.metWaarde + waarde.zonderWaarde > 0;
}

function veldVoor(stof: SupermarktVeld): VoedingswaardeVeld | undefined {
  return VOEDINGSWAARDE_VELDEN.find((v) => v.veld === stof);
}

function weekPunt(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  veld: VoedingswaardeVeld,
  norm: number | null,
  start: string,
  datums: readonly string[] = weekDatums(start),
): GevolgdWeekPunt {
  let som = 0;
  let heeftWaarde = false;
  let dagen = 0;
  for (const datum of datums) {
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
    aandeel: gemiddeld !== null && norm !== null ? gemiddeld / norm : null,
    dagen,
  };
}

/** Eén punt per stof over een willekeurige reeks datums (de periode in Je patroon). */
export function bouwGevolgdePeriode(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  stoffen: readonly SupermarktVeld[],
  datums: readonly string[],
  normen: GevolgdeNormen = STANDAARD_GEVOLGDE_NORMEN,
): GevolgdeWeekReeks[] {
  return stoffen.flatMap((stof) => {
    const veld = veldVoor(stof);
    if (!veld || datums.length === 0) return [];
    const norm = normVoorVeld(normen, stof)?.waarde ?? null;
    return [{ ...veld, norm, punten: [weekPunt(perDag, veld, norm, datums[0]!, datums)] }];
  });
}
