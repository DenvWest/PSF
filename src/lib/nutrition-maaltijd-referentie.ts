import type { NutrientId } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import type { GevolgdeNormen, Voedingsnorm } from "@/data/nutrition/voedingsnormen";
import { isStreefStof, type KernstofProfiel } from "@/lib/account-kernstof-profiel";
import { normLabel, normVoor, normVoorVeld, type KernstofNormen } from "@/lib/nutrition-normen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Waartegen een getal in Per maaltijd rekent, in woorden: de norm met bron,
 * je eigen doel als je er een zette, en bij een product de ADH van het etiket.
 *
 * Eén percentage per rij blijft "van je norm" (`BESLUIT_KERNSTOF_NORMEN_2026-10.md`).
 * Het eigen doel staat als tweede regel met een eigen percentage, zonder kleur
 * of vinkje (plak 2 van `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`). De ADH
 * staat alleen bij een product: dat is de etiketvermelding.
 */

export type Referentie = {
  norm: Voedingsnorm | null;
  /** Eigen streefwaarde per dag uit Je doelen, in dezelfde eenheid. */
  doel: number | null;
  /** Omega-3 rekent de norm als weektotaal: één visdag dekt een week. */
  weektotaal: boolean;
};

export function referentieVoorVeld(
  veld: SupermarktVeld,
  gevolgd: GevolgdeNormen,
  profiel: Pick<KernstofProfiel, "streefwaarden">,
): Referentie {
  return {
    norm: normVoorVeld(gevolgd, veld),
    doel: isStreefStof(veld) ? (profiel.streefwaarden[veld] ?? null) : null,
    weektotaal: false,
  };
}

export function referentieVoorKernstof(
  nutrient: NutrientId,
  normen: KernstofNormen,
  profiel: Pick<KernstofProfiel, "streefwaarden">,
): Referentie {
  return {
    norm: normVoor(normen, nutrient),
    doel: isStreefStof(nutrient) ? (profiel.streefwaarden[nutrient] ?? null) : null,
    weektotaal: nutrient === "omega3",
  };
}

/** "norm 3.500 mg/dag · Gezondheidsraad 2021", of null zonder norm. */
export function normRegel(referentie: Referentie): string | null {
  const { norm } = referentie;
  if (!norm) return null;
  return `norm ${normLabel(norm)}/dag${referentie.weektotaal ? " (telt per week)" : ""} · ${norm.bron}`;
}

/** "jouw doel 4000 mg/dag · 30%", of null zonder eigen doel. */
export function doelRegel(referentie: Referentie, waarde: number | null, unit: string): string | null {
  if (referentie.doel === null) return null;
  const deel = waarde === null ? "" : ` · ${percentageADH(waarde / referentie.doel)}`;
  return `jouw doel ${hoeveelheid(referentie.doel)} ${unit}/dag${deel}`;
}

/** Het aandeel van de norm, of null zonder norm of waarde. */
export function aandeelVan(referentie: Referentie, waarde: number | null): number | null {
  return waarde === null || !referentie.norm ? null : waarde / referentie.norm.waarde;
}

/** "12% ADH" op het etiket van een kernstof, of null als de stof geen vaste ADH heeft. */
export function adhRegelKernstof(nutrient: NutrientId, waarde: number | null): string | null {
  if (waarde === null || nutrient === "protein") return null;
  const aandeel = aandeelVanRi(nutrient, waarde);
  return aandeel === null ? null : `etiket: ${percentageADH(aandeel)} ADH`;
}

/** Idem voor een stof uit de voedingswaardetabel. */
export function adhRegelVeld(aandeelRi: number | null): string | null {
  return aandeelRi === null ? null : `etiket: ${percentageADH(aandeelRi)} ADH`;
}

export type Bijdrage = { label: string; aandeel: number };

/**
 * De stoffen waar een maaltijd het grootste deel van je dagnorm levert,
 * hoogste eerst. Alleen wat er is: geen "het minst", want een lage bijdrage
 * van één maaltijd zegt niets over je dag.
 */
export function sterksteBijdragen(bijdragen: readonly Bijdrage[], aantal = 3): Bijdrage[] {
  return bijdragen
    .filter((b) => b.aandeel > 0)
    .sort((a, b) => b.aandeel - a.aandeel)
    .slice(0, aantal);
}
