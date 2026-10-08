import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import type { KernstofNormen } from "@/lib/nutrition-normen";
import { datumsTussen, periodeVoorKeuze, type Periode } from "@/lib/nutrition-periode";
import { bouwPeriodeOverzicht } from "@/lib/nutrition-weekoverzicht";

/**
 * De dagboekregel onder "Grootste winst" in de contextkolom.
 *
 * ## Wat het is en wat niet
 *
 * "Grootste winst" blijft de uitkomst van de check (hoe vaak je iets eet). Deze
 * regel is een tweede bron met een eigen label: wat je dagboek de afgelopen
 * zeven dagen aantoonde, tegen je eigen norm uit Je doelen. Hij vervangt de
 * winst-laag niet en wijst nooit een andere laag aan — zo spreekt de kolom het
 * middenscherm niet tegen
 * (`BESLUIT_KOMPAS_WINST_DAGBOEK_2026-10.md`).
 *
 * ## Waarom een drempel van vijf dagen
 *
 * Met twee dagen data leest een patroon als ruis. Onder de drempel doet de
 * regel geen uitspraak over stoffen; hij zegt hoeveel dagen er staan.
 *
 * ## Wat de getallen zijn
 *
 * Een dagboek meet een ondergrens: wat je niet registreerde kan er alleen bij
 * komen. Daarom staat er "minstens", komt een stof zonder enige bron er niet in
 * (onbekend is geen nul) en volgt "op je norm" alleen uit `gedekt`, dat
 * benaderingen niet meetelt. Geen weekscore, geen tekort-taal.
 */

export const DAGBOEKREGEL_VENSTER_DAGEN = 7;
export const DAGBOEKREGEL_MIN_DAGEN = 5;
const MAX_STOFFEN = 2;

export type DagboekWinstStof = {
  nutrient: NutrientId;
  label: string;
  /** Afgerond percentage van je norm, een ondergrens. */
  aandeelPct: number;
  /** Je eigen norm, zoals je hem in Je doelen leest: "375 mg". */
  normLabel: string;
  benaderd: boolean;
};

export type DagboekWinstRegel =
  | { kind: "te_weinig"; dagen: number }
  | { kind: "stoffen"; dagen: number; stoffen: readonly DagboekWinstStof[] }
  | { kind: "op_norm"; dagen: number };

export function dagboekregelPeriode(vandaag: string): Periode {
  return periodeVoorKeuze(String(DAGBOEKREGEL_VENSTER_DAGEN) as "7", vandaag);
}

function normLabel(waarde: number, unit: string): string {
  return `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(waarde)} ${unit}`;
}

export function buildDagboekWinstRegel(
  dagen: readonly DagboekDag[],
  vandaag: string,
  normen: KernstofNormen,
): DagboekWinstRegel | null {
  const datums = datumsTussen(dagboekregelPeriode(vandaag));
  const overzicht = bouwPeriodeOverzicht(dagen, datums, normen, { omega3AlsPeriodetotaal: true });

  if (overzicht.dagenGeregistreerd < DAGBOEKREGEL_MIN_DAGEN) {
    return { kind: "te_weinig", dagen: overzicht.dagenGeregistreerd };
  }

  const meetbaar = overzicht.rijen.filter(
    (rij) => rij.bewijsbaar && rij.referentie !== null && rij.aandeel !== null && rij.dagenMetBron > 0,
  );

  const onder = meetbaar
    .filter((rij) => (rij.aandeel ?? 1) < 1)
    .sort((a, b) => (a.aandeel ?? 0) - (b.aandeel ?? 0))
    .slice(0, MAX_STOFFEN)
    .map(
      (rij): DagboekWinstStof => ({
        nutrient: rij.nutrient,
        label: rij.label,
        aandeelPct: Math.round((rij.aandeel ?? 0) * 100),
        normLabel: normLabel(rij.referentie ?? 0, rij.unit),
        benaderd: rij.benaderd ?? false,
      }),
    );

  if (onder.length > 0) {
    return { kind: "stoffen", dagen: overzicht.dagenGeregistreerd, stoffen: onder };
  }

  if (meetbaar.length > 0 && meetbaar.every((rij) => rij.gedekt === true)) {
    return { kind: "op_norm", dagen: overzicht.dagenGeregistreerd };
  }

  return null;
}
