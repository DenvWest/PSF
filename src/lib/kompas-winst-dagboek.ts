import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import type { KernstofNormen } from "@/lib/nutrition-normen";
import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import { sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { sanitizeHoofdmaaltijden, verwachteMaaltijden } from "@/lib/nutrition-eetpatroon";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { datumsTussen, periodeVoorKeuze, type Periode } from "@/lib/nutrition-periode";
import { ruimteBij, stofPerMoment } from "@/lib/nutrition-stof-bronnen";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import { RICHTINGEN, type Voedingsrichting } from "@/lib/nutrition-voedingsrichting";
import { bouwPeriodeOverzicht, type WeekRij, type Weekoverzicht } from "@/lib/nutrition-weekoverzicht";

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
 * ## Waarom een drempel van vijf volle dagen
 *
 * Met twee dagen data leest een patroon als ruis. En een dag met alleen een
 * ontbijt is geen lage dag maar een onvolledige: wat je niet registreerde is
 * onbekend, geen nul. Een dag telt daarom pas mee als al je gewone maaltijden
 * erop staan, of als niet gegeten zijn gemarkeerd (`verwachteMaaltijden`, zoals
 * Patroon het doet). Onder de drempel doet de regel geen uitspraak over je dag;
 * hij zegt wat er wél staat: wat één maaltijd bijdraagt, en wat er nog mist.
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

/** Een feit over één maaltijd, ook als de dag nog niet compleet is. */
export type MaaltijdFeit = {
  /** "ontbijt", kleine letter. */
  moment: string;
  /** Waartegen, één woord: "magnesiumnorm" of "eiwitdoel". */
  doelWoord: string;
  /** Gemiddeld aandeel van je dagnorm dat deze maaltijd leverde, een ondergrens. */
  aandeelPct: number;
  /** Op hoeveel dagen deze maaltijd erop stond. */
  dagen: number;
};

export type TeWeinig = {
  kind: "te_weinig";
  /** Volle dagen in het venster. */
  dagen: number;
  /** Dagen met iets ingevuld, ook half. */
  gelogd: number;
  maaltijdFeit: MaaltijdFeit | null;
  /** De gewone maaltijd die het vaakst ontbreekt ("lunch"), of null. */
  ontbreekt: string | null;
};

export type DagboekOpties = {
  /** Je gewone maaltijden uit Je doelen; null = alle drie. */
  gewone?: readonly EetmomentId[] | null;
  richting?: Voedingsrichting | null;
  eiwitDoelG?: number | null;
};

export type DagboekWinstRegel =
  | TeWeinig
  | { kind: "stoffen"; dagen: number; stoffen: readonly DagboekWinstStof[] }
  | { kind: "op_norm"; dagen: number };

export function dagboekregelPeriode(vandaag: string): Periode {
  return periodeVoorKeuze(String(DAGBOEKREGEL_VENSTER_DAGEN) as "7", vandaag);
}

function normLabel(waarde: number, unit: string): string {
  return `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(waarde)} ${unit}`;
}

function isVolledig(dag: DagboekDag, verwacht: readonly EetmomentId[]): boolean {
  const gelogd = new Set<EetmomentId>([
    ...sanitizeItems(dag.items ?? []).map((item) => item.moment),
    ...sanitizeHoofdmaaltijden(dag.overgeslagen),
  ]);
  return verwacht.every((moment) => gelogd.has(moment));
}

type Meting = {
  datums: string[];
  inVenster: DagboekDag[];
  /** De dagen waarop al je gewone maaltijden staan. */
  volle: DagboekDag[];
  verwacht: readonly EetmomentId[];
  /** Het overzicht over alleen de volle dagen. */
  overzicht: Weekoverzicht;
  gelogd: number;
};

function meetVolleDagen(
  dagen: readonly DagboekDag[],
  vandaag: string,
  normen: KernstofNormen,
  opties: DagboekOpties,
): Meting {
  const datums = datumsTussen(dagboekregelPeriode(vandaag));
  const venster = new Set(datums);
  const verwacht = verwachteMaaltijden(opties.gewone);
  const inVenster = dagen.filter((dag) => venster.has(dag.date) && sanitizeItems(dag.items ?? []).length > 0);
  const volle = inVenster.filter((dag) => isVolledig(dag, verwacht));
  const overzicht = bouwPeriodeOverzicht(volle, datums, normen, { omega3AlsPeriodetotaal: true });
  return { datums, inVenster, volle, verwacht, overzicht, gelogd: inVenster.length };
}

const FEIT_MIN_DAGEN = 3;

/**
 * Wat één maaltijd bijdraagt, voor wie nog geen vijf volle dagen heeft: de
 * maaltijd die het vaakst is ingevuld, tegen de dagnorm van je richting-stof
 * (anders magnesium). Een feit over wat er stond, geen oordeel over je dag.
 * Omega-3 valt af: dat is een weeknorm, geen dagnorm.
 */
function bouwMaaltijdFeit(
  meting: Meting,
  normen: KernstofNormen,
  opties: DagboekOpties,
): MaaltijdFeit | null {
  const kandidaten: NutrientId[] = [
    ...(opties.richting ? RICHTINGEN[opties.richting].eerst : []),
    "magnesium",
  ];
  const nutrient = kandidaten.find((id) => {
    if (id === "omega3" || id in NIET_BEWIJSBAAR) return false;
    return id === "protein" ? (opties.eiwitDoelG ?? 0) > 0 : normen[id] !== undefined;
  });
  if (!nutrient) return null;

  const dagnorm = nutrient === "protein" ? (opties.eiwitDoelG ?? 0) : (normen[nutrient as keyof KernstofNormen]?.waarde ?? 0);
  if (dagnorm <= 0) return null;

  const perMoment = stofPerMoment(meting.inVenster, meting.datums, nutrient).filter((moment) =>
    meting.verwacht.includes(moment.moment),
  );
  const vaakst = perMoment.reduce<(typeof perMoment)[number] | null>(
    (best, moment) => (best === null || moment.keer > best.keer ? moment : best),
    null,
  );
  if (!vaakst || vaakst.keer < FEIT_MIN_DAGEN) return null;

  const stofLabel = meting.overzicht.rijen.find((rij) => rij.nutrient === nutrient)?.label;
  if (!stofLabel) return null;

  return {
    moment: vaakst.label.toLowerCase(),
    doelWoord: `${stofLabel.toLowerCase()}${nutrient === "protein" ? "doel" : "norm"}`,
    aandeelPct: Math.round((vaakst.totaal / vaakst.keer / dagnorm) * 100),
    dagen: vaakst.keer,
  };
}

function bouwTeWeinig(meting: Meting, normen: KernstofNormen, opties: DagboekOpties): TeWeinig {
  const telling = meting.verwacht.map((moment) => ({
    moment,
    keer: meting.inVenster.filter((dag) =>
      sanitizeItems(dag.items ?? []).some((item) => item.moment === moment),
    ).length,
  }));
  const minst = telling.reduce((best, rij) => (rij.keer < best.keer ? rij : best), telling[0]);
  const meest = Math.max(...telling.map((rij) => rij.keer));
  const label = minst && minst.keer < meest ? minst.moment : null;

  return {
    kind: "te_weinig",
    dagen: meting.overzicht.dagenGeregistreerd,
    gelogd: meting.gelogd,
    maaltijdFeit: bouwMaaltijdFeit(meting, normen, opties),
    ontbreekt: label,
  };
}

export function buildDagboekWinstRegel(
  dagen: readonly DagboekDag[],
  vandaag: string,
  normen: KernstofNormen,
  opties: DagboekOpties = {},
): DagboekWinstRegel | null {
  const meting = meetVolleDagen(dagen, vandaag, normen, opties);
  const { overzicht } = meting;

  if (overzicht.dagenGeregistreerd < DAGBOEKREGEL_MIN_DAGEN) {
    return bouwTeWeinig(meting, normen, opties);
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
  | TeWeinig
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
  opties: DagboekOpties = {},
): DoelStand | null {
  const { richting = null, eiwitDoelG = null } = opties;
  const meting = meetVolleDagen(dagen, vandaag, normen, opties);
  const { overzicht, datums } = meting;

  if (overzicht.dagenGeregistreerd < DAGBOEKREGEL_MIN_DAGEN) {
    return bouwTeWeinig(meting, normen, opties);
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
  const perMoment = stofPerMoment(meting.volle, datums, rij.nutrient);
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
