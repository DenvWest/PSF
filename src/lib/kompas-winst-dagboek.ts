import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import type { KernstofNormen } from "@/lib/nutrition-normen";
import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import { datumsTussen, periodeVoorKeuze, type Periode } from "@/lib/nutrition-periode";
import { ruimteBij, stofPerMoment } from "@/lib/nutrition-stof-bronnen";
import { RICHTINGEN, type Voedingsrichting } from "@/lib/nutrition-voedingsrichting";
import { bouwPeriodeOverzicht, type WeekRij } from "@/lib/nutrition-weekoverzicht";

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

export type DoelStand =
  | { kind: "te_weinig"; dagen: number }
  | {
      kind: "stof";
      dagen: number;
      nutrient: NutrientId;
      label: string;
      /** Afgerond percentage van je norm of eiwitdoel, een ondergrens. */
      aandeelPct: number;
      /** Waartegen, als zinsdeel: "je norm (375 mg)" of "je eiwitdoel (95 g)". */
      doelLabel: string;
      benaderd: boolean;
      /** Alleen waar zonder benaderingen bewezen: dan mag er "op je norm" staan. */
      gedekt: boolean;
      /** Je richting in het kort ("Vaak moe") als die de stof koos; null als de laagste is gekozen. */
      richtingKort: string | null;
      /** Een maaltijd die er weinig van levert, of null. */
      ruimteMoment: string | null;
      /** Voedingsvoorstel voor vandaag uit de agendavoorstellen, of null zonder voorstel. */
      voorstel: string | null;
    };

function stofRij(rij: WeekRij, eiwitDoelG: number | null) {
  if (rij.dagenMetBron === 0) return null;
  if (rij.nutrient === "protein") {
    if (eiwitDoelG === null || eiwitDoelG <= 0) return null;
    return {
      aandeel: rij.gemiddeld / eiwitDoelG,
      doelLabel: `je eiwitdoel (${normLabel(eiwitDoelG, "g")})`,
      gedekt: false,
    };
  }
  if (!rij.bewijsbaar || rij.referentie === null || rij.aandeel === null) return null;
  return {
    aandeel: rij.aandeel,
    doelLabel: `je norm (${normLabel(rij.referentie, rij.unit)})`,
    gedekt: rij.gedekt === true,
  };
}

export function buildDoelStand(
  dagen: readonly DagboekDag[],
  vandaag: string,
  normen: KernstofNormen,
  richting: Voedingsrichting | null,
  eiwitDoelG: number | null,
): DoelStand | null {
  const datums = datumsTussen(dagboekregelPeriode(vandaag));
  const overzicht = bouwPeriodeOverzicht(dagen, datums, normen, { omega3AlsPeriodetotaal: true });

  if (overzicht.dagenGeregistreerd < DAGBOEKREGEL_MIN_DAGEN) {
    return { kind: "te_weinig", dagen: overzicht.dagenGeregistreerd };
  }

  const meetbaar = overzicht.rijen.flatMap((rij) => {
    const meting = stofRij(rij, eiwitDoelG);
    return meting ? [{ rij, ...meting }] : [];
  });

  const eerst: readonly string[] = richting ? RICHTINGEN[richting].eerst : [];
  const vanRichting = eerst
    .map((id) => meetbaar.find((kandidaat) => kandidaat.rij.nutrient === id))
    .find((kandidaat) => kandidaat !== undefined);
  const gekozen =
    vanRichting ??
    meetbaar.filter((kandidaat) => kandidaat.aandeel < 1).sort((a, b) => a.aandeel - b.aandeel)[0];

  if (!gekozen) return null;

  const { rij } = gekozen;
  const perMoment = stofPerMoment(dagen, datums, rij.nutrient);
  const totaal = perMoment.reduce((som, moment) => som + moment.totaal, 0);
  const ruimte = ruimteBij(perMoment, totaal);

  return {
    kind: "stof",
    dagen: overzicht.dagenGeregistreerd,
    nutrient: rij.nutrient,
    label: rij.label,
    aandeelPct: Math.round(gekozen.aandeel * 100),
    doelLabel: gekozen.doelLabel,
    benaderd: rij.benaderd ?? false,
    gedekt: gekozen.gedekt,
    richtingKort: vanRichting && richting ? RICHTINGEN[richting].kort : null,
    ruimteMoment: ruimte ? ruimte.label.toLowerCase() : null,
    voorstel: TEKORT_VOORSTELLEN[rij.nutrient]?.title ?? null,
  };
}
