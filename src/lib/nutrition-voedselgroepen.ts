/**
 * Voedselgroep-filters voor de feitenrij-tabel.
 *
 * De ladder groepeert feitenrijen op **prioriteit** (welke laag pak je eerst
 * aan). Deze laag geeft een tweede ingang: op **voedselgroep** — hoe mensen
 * zelf over eten praten. "Wat zegt mijn check over vlees en vis" is een andere
 * vraag dan "wat pak ik als eerste aan", en beide horen beantwoord te worden
 * zonder de ander te verbergen.
 *
 * Waarom de mapping hier staat en niet op de rij zelf: een feitenrij dekt vaak
 * meerdere groepen. `eiwitbronnen` bundelt vlees, zuivel én noten; `plantbasis`
 * bundelt groente en fruit. Een enkel `group`-veld op de rij zou die
 * werkelijkheid platslaan, en dan zou een filter op "Zuivel" de eiwitbronnen-
 * rij laten verdwijnen terwijl het antwoord er wél in zit.
 */

import type { NutritionFactRowKey } from "@/lib/nutrition-ladder";

export type VoedselgroepId =
  | "groente"
  | "fruit"
  | "vlees-vis"
  | "zuivel"
  | "granen"
  | "noten"
  | "suiker";

export interface Voedselgroep {
  id: VoedselgroepId;
  label: string;
  /** Feitenrijen waarin deze groep meetelt. */
  rowKeys: readonly NutritionFactRowKey[];
}

/**
 * Volgorde volgt het bord: eerst de plantkant, dan de eiwitkant, dan wat je
 * mindert. Niet gesorteerd op hoe vaak een groep voorkomt — dat zou per
 * gebruiker verschillen en de knoppenrij bij elke check laten verspringen.
 */
export const VOEDSELGROEPEN: readonly Voedselgroep[] = [
  { id: "groente", label: "Groente", rowKeys: ["plantbasis"] },
  { id: "fruit", label: "Fruit", rowKeys: ["plantbasis"] },
  { id: "vlees-vis", label: "Vlees & vis", rowKeys: ["visbron", "eiwitbronnen", "eiwitritme"] },
  { id: "zuivel", label: "Zuivel", rowKeys: ["eiwitbronnen", "eiwitritme"] },
  { id: "granen", label: "Granen", rowKeys: ["vezelbasis"] },
  { id: "noten", label: "Noten & peulvruchten", rowKeys: ["eiwitbronnen"] },
  { id: "suiker", label: "Suiker & bewerkt", rowKeys: ["minderen", "bewerkingsgraad"] },
] as const;

export function isVoedselgroepId(value: string): value is VoedselgroepId {
  return VOEDSELGROEPEN.some((groep) => groep.id === value);
}

/**
 * Welke rijen horen bij een selectie van groepen?
 * Lege selectie = geen filter = alle rijen.
 */
export function rowKeysVoorGroepen(
  selectie: readonly VoedselgroepId[],
): Set<NutritionFactRowKey> | null {
  if (selectie.length === 0) {
    return null;
  }
  const keys = new Set<NutritionFactRowKey>();
  for (const groep of VOEDSELGROEPEN) {
    if (selectie.includes(groep.id)) {
      for (const key of groep.rowKeys) {
        keys.add(key);
      }
    }
  }
  return keys;
}

/**
 * Groepen waarvoor deze check daadwerkelijk een rij opleverde. Een knop tonen
 * voor een groep die niets filtert is een dode knop — en die kost op 375px
 * precies zoveel ruimte als een werkende.
 */
export function beschikbareGroepen(
  aanwezigeRowKeys: readonly NutritionFactRowKey[],
): Voedselgroep[] {
  const aanwezig = new Set(aanwezigeRowKeys);
  return VOEDSELGROEPEN.filter((groep) =>
    groep.rowKeys.some((key) => aanwezig.has(key)),
  );
}
