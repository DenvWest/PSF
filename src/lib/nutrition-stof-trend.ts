import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { DagMeting, PatroonStof } from "@/lib/nutrition-stof-meting";
import { bronnenUitMeting, productenZonderGehalte } from "@/lib/nutrition-stof-meting";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * De trend van één stof over de gekozen periode, met per stof de feiten
 * waarom hij (nog) niet aan de norm voldoet.
 *
 * ## De schaal volgt de periode
 *
 * - **Eén dag:** per maaltijd. Een maaltijd haalt geen dagnorm, dus geen
 *   kleur; wel welk deel van de dagnorm hij leverde.
 * - **Tot 14 dagen:** per dag.
 * - **Langer:** per week, het gemiddelde per geregistreerde dag.
 *
 * ## Drie staten, nooit rood
 *
 * Gehaald (bewezen, zonder benaderingen) · niet gehaald op een volledige dag
 * · onvolledig. Een onvolledige dag onder de norm zegt niets: de ontbrekende
 * maaltijd kan het verschil zijn. Gevolgde stoffen krijgen geen oordeel-kleur
 * (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`); omega-3 per dag ook niet, want de
 * norm is in de praktijk een weeknorm en telt als periodetotaal.
 *
 * ## Had je de norm alsnog gehaald?
 *
 * Op een onvolledige dag schatten we wat de ontbrekende hoofdmaaltijd had
 * kunnen leveren: het gemiddelde van je **eigen** registraties van die
 * maaltijd in de periode, pas vanaf drie keer. Minder vaak geregistreerd: dan
 * alleen wat die maaltijd nog moet leveren. De schatting kleurt nooit: de dag
 * blijft onvolledig, groen blijft voor wat bewezen is.
 */

export type TrendSchaal = "maaltijd" | "dag" | "week";

export type StofTrendStaat = "gehaald" | "onder" | "onvolledig" | "neutraal" | "leeg";

export type TrendMomentRegel = {
  moment: EetmomentId;
  label: string;
  /** Null: niet geregistreerd. Per week het gemiddelde over de keren dat hij er was. */
  waarde: number | null;
  keer: number;
  /** Je eigen gemiddelde voor een ontbrekende hoofdmaaltijd, als dat er (≥3×) is. */
  geschat: number | null;
  /** Bewust niet gegeten die dag. */
  overgeslagen: boolean;
};

export type TrendDetail = {
  momenten: TrendMomentRegel[];
  /** Top 3 bronnen van dit punt: die dag, of opgeteld over die week. */
  bronnen: { naam: string; bedrag: number }[];
  /** Wat de ontbrekende maaltijd(en) hadden kunnen doen. */
  schatting: string | null;
};

export type StofTrendPunt = {
  sleutel: string;
  label: string;
  /** Tweede regel onder het label: "3/3" maaltijden, "2 d", … */
  sublabel: string;
  waarde: number | null;
  aandeel: number | null;
  staat: StofTrendStaat;
  /**
   * De lat aantoonbaar gehaald (zonder benaderingen), los van de kleur: ook
   * een gevolgde stof krijgt een ✓ bij gehaald (`BESLUIT_DOELEN_VERBONDEN` §1),
   * alleen geen oordeel-kleur. Nooit per maaltijd en nooit bij een periodetotaal.
   */
  normGehaald: boolean;
  benaderd: boolean;
  /** Uitleesregel bij een tik: wat dit punt precies is. */
  uitleg: string;
  /** Geschatte aanvulling uit je gebruikelijke ontbrekende maaltijd(en), in de eenheid van de stof. */
  aanvulling: number | null;
  detail: TrendDetail | null;
};

export type StofTrend = {
  stof: PatroonStof;
  label: string;
  unit: string;
  soort: "kern" | "gevolgd";
  norm: number | null;
  normNaam: NormNaam;
  /** Omega-3: geen ✓ per dag, alleen over de periode. */
  periodetotaal: boolean;
  /** False bij zink en vitamine D: geen grafiek, alleen de reden. */
  bewijsbaar: boolean;
  schaal: TrendSchaal;
  punten: StofTrendPunt[];
  /** Eén telregel naast de naam. */
  kop: string;
  /** Alleen bij een periodetotaal (omega-3): het totaal tegen de norm over alle dagen samen. */
  periode: { totaal: number; norm: number } | null;
  /**
   * Of de norm over de periode aantoonbaar gehaald is (zonder benaderingen).
   * Bij een gevolgde stof alleen om de "waarom"-regels weg te laten; hij
   * krijgt geen ✓ of kleur.
   */
  gehaald: boolean;
  /** Feiten waarom niet, of wat er wél te zeggen valt. Leeg als hij gehaald is. */
  redenen: string[];
};

export type StofTrendInvoer = {
  stof: PatroonStof;
  label: string;
  unit: string;
  soort: "kern" | "gevolgd";
  norm: number | null;
  /** Null als een dagboek de stof kan aantonen, anders de reden. */
  nietBewijsbaar: string | null;
  /** Omega-3: de som over de periode tegen norm × kalenderdagen. */
  periodetotaal: boolean;
  /** Eén meting per kalenderdag van de periode, oudste eerst. */
  dagen: readonly DagMeting[];
  /** Zonder vaste norm: waar het doel dan vandaan komt. */
  zonderNormUitleg?: string;
  /** Hoe de lat heet. Eiwit heeft geen norm maar je eigen eiwitdoel. */
  normNaam?: NormNaam;
};

export type NormNaam = { de: string; dag: string; kort: string };

export const NORM: NormNaam = { de: "de norm", dag: "de dagnorm", kort: "norm" };
export const EIWITDOEL: NormNaam = { de: "je eiwitdoel", dag: "je eiwitdoel", kort: "eiwitdoel" };

function naamVan(invoer: StofTrendInvoer): NormNaam {
  return invoer.normNaam ?? NORM;
}

const MAX_DAGEN_PER_DAG = 14;
/** Zo vaak moet je een maaltijd geregistreerd hebben voor een schatting uit je eigen gemiddelde. */
export const MIN_KEER_VOOR_SCHATTING = 3;

export function schaalVoor(aantalDagen: number): TrendSchaal {
  if (aantalDagen <= 1) return "maaltijd";
  return aantalDagen <= MAX_DAGEN_PER_DAG ? "dag" : "week";
}

function opmaak(datum: string, opties: Intl.DateTimeFormatOptions): string {
  return new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", { timeZone: "UTC", ...opties });
}

function maandagVan(datum: string): string {
  const dag = new Date(`${datum}T00:00:00Z`);
  dag.setUTCDate(dag.getUTCDate() - ((dag.getUTCDay() + 6) % 7));
  return dag.toISOString().slice(0, 10);
}

function bedrag(waarde: number, unit: string, benaderd = false): string {
  return `${benaderd ? "≈ " : ""}${hoeveelheid(waarde)} ${unit}`;
}

function meervoud(aantal: number, enkel: string, meer: string): string {
  return `${aantal} ${aantal === 1 ? enkel : meer}`;
}

function latGehaald(invoer: StofTrendInvoer, somStreng: number): boolean {
  return invoer.norm !== null && invoer.nietBewijsbaar === null && !invoer.periodetotaal && somStreng >= invoer.norm;
}

function oordeelt(invoer: StofTrendInvoer): boolean {
  return invoer.soort === "kern" && invoer.nietBewijsbaar === null && invoer.norm !== null && !invoer.periodetotaal;
}

function dagStaat(invoer: StofTrendInvoer, dag: DagMeting): StofTrendStaat {
  if (!dag.geregistreerd) return "leeg";
  if (!oordeelt(invoer)) return dag.volledig ? "neutraal" : "onvolledig";
  if (dag.somStreng >= invoer.norm!) return "gehaald";
  return dag.volledig ? "onder" : "onvolledig";
}

type MomentGemiddelde = { gemiddeld: number; keer: number };

function gemiddeldenPerMoment(dagen: readonly DagMeting[]): Map<EetmomentId, MomentGemiddelde> {
  const uitkomst = new Map<EetmomentId, MomentGemiddelde>();
  for (const { id } of EETMOMENTEN) {
    // Alleen de keren dat je hem at: een overgeslagen lunch is geen lunch van 0 mg.
    const metingen = dagen.flatMap((d) => d.momenten.filter((m) => m.moment === id && m.geregistreerd && !m.overgeslagen));
    if (metingen.length === 0) continue;
    uitkomst.set(id, { gemiddeld: metingen.reduce((s, m) => s + m.som, 0) / metingen.length, keer: metingen.length });
  }
  return uitkomst;
}

function labelVan(moment: EetmomentId): string {
  return EETMOMENTEN.find((m) => m.id === moment)?.label ?? moment;
}

function opsomming(delen: readonly string[]): string {
  return delen.length <= 1 ? (delen[0] ?? "") : `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}`;
}

type Schatting = { aanvulling: number | null; zin: string; perMoment: Map<EetmomentId, number> };

/**
 * Wat de ontbrekende hoofdmaaltijden van een onvolledige dag hadden kunnen
 * leveren. Alleen als er een norm is om tegen te houden en de dag er nog
 * onder zit; omega-3 telt als periodetotaal en krijgt geen dagschatting.
 */
function schattingVoor(
  invoer: StofTrendInvoer,
  dag: DagMeting,
  gemiddelden: ReadonlyMap<EetmomentId, MomentGemiddelde>,
): Schatting | null {
  const norm = invoer.norm;
  if (norm === null || invoer.periodetotaal || invoer.nietBewijsbaar !== null) return null;
  if (!dag.geregistreerd || dag.volledig || dag.som >= norm) return null;
  const ontbrekend = dag.verwacht.filter((moment) => !dag.momenten.some((m) => m.moment === moment && m.geregistreerd));
  if (ontbrekend.length === 0) return null;
  const namen = opsomming(ontbrekend.map((m) => labelVan(m).toLowerCase()));

  const bekend = ontbrekend.every((m) => (gemiddelden.get(m)?.keer ?? 0) >= MIN_KEER_VOOR_SCHATTING);
  if (!bekend) {
    const nodig = norm - dag.som;
    return {
      aanvulling: null,
      zin: `Je ${namen} ${ontbrekend.length === 1 ? "moet" : "moeten"} samen nog ${bedrag(nodig, invoer.unit)} leveren voor ${naamVan(invoer).de}.`,
      perMoment: new Map(),
    };
  }
  const perMoment = new Map(ontbrekend.map((m) => [m, gemiddelden.get(m)!.gemiddeld] as const));
  const aanvulling = [...perMoment.values()].reduce((s, w) => s + w, 0);
  const onderbouwing = ontbrekend
    .map((m) => {
      const { gemiddeld } = gemiddelden.get(m)!;
      return `${ontbrekend.length > 1 ? `${labelVan(m).toLowerCase()} ` : ""}meestal ${bedrag(gemiddeld, invoer.unit)}`;
    })
    .join("; ");
  return {
    aanvulling,
    zin: `Met je gebruikelijke ${namen} erbij kom je op ≈ ${percentageADH((dag.som + aanvulling) / norm)} (een gok: ${onderbouwing}).`,
    perMoment,
  };
}

function topBronnen(dagen: readonly DagMeting[], unit: string): TrendDetail["bronnen"] {
  return bronnenUitMeting(dagen, unit)
    .slice(0, 3)
    .map(({ naam, totaal }) => ({ naam, bedrag: totaal }));
}

function dagDetail(invoer: StofTrendInvoer, dag: DagMeting, schatting: Schatting | null): TrendDetail {
  return {
    momenten: EETMOMENTEN.flatMap(({ id, label }): TrendMomentRegel[] => {
      const meting = dag.momenten.find((m) => m.moment === id);
      const geregistreerd = meting?.geregistreerd === true;
      // Tussendoor is geen hoofdmaaltijd: alleen tonen als hij er was.
      if (id === "tussendoor" && !geregistreerd) return [];
      return [
        {
          moment: id,
          label,
          waarde: geregistreerd ? meting!.som : null,
          keer: geregistreerd ? 1 : 0,
          geschat: schatting?.perMoment.get(id) ?? null,
          overgeslagen: meting?.overgeslagen === true,
        },
      ];
    }),
    bronnen: topBronnen([dag], invoer.unit),
    schatting: schatting?.zin ?? null,
  };
}

function puntenPerMaaltijd(invoer: StofTrendInvoer): StofTrendPunt[] {
  const dag = invoer.dagen[0];
  const detail = dag?.geregistreerd ? dagDetail(invoer, dag, schattingVoor(invoer, dag, gemiddeldenPerMoment(invoer.dagen))) : null;
  return EETMOMENTEN.map(({ id, label }) => {
    const meting = dag?.momenten.find((m) => m.moment === id);
    const geregistreerd = meting?.geregistreerd === true;
    const waarde = geregistreerd ? meting!.som : null;
    const aandeel = waarde !== null && invoer.norm ? waarde / invoer.norm : null;
    const benaderd = geregistreerd && meting!.som > meting!.somStreng;
    return {
      sleutel: id,
      label,
      sublabel: meting?.overgeslagen ? "niet gegeten" : geregistreerd ? "" : "—",
      waarde,
      aandeel,
      staat: geregistreerd ? "neutraal" : "leeg",
      normGehaald: false,
      benaderd,
      uitleg:
        waarde === null
          ? `${label}: niet geregistreerd`
          : meting?.overgeslagen
            ? `${label}: niet gegeten`
            : `${label}: ${bedrag(waarde, invoer.unit, benaderd)}${aandeel !== null ? ` · ${percentageADH(aandeel)} van ${naamVan(invoer).dag}` : ""}`,
      aanvulling: null,
      detail,
    };
  });
}

function puntenPerDag(invoer: StofTrendInvoer): StofTrendPunt[] {
  const gemiddelden = gemiddeldenPerMoment(invoer.dagen);
  return invoer.dagen.map((dag) => {
    const schatting = schattingVoor(invoer, dag, gemiddelden);
    const hoofd = dag.verwacht.filter((moment) => dag.momenten.some((m) => m.moment === moment && m.geregistreerd)).length;
    const nodig = dag.verwacht.length;
    const waarde = dag.geregistreerd ? dag.som : null;
    const aandeel = waarde !== null && invoer.norm ? waarde / invoer.norm : null;
    const staat = dagStaat(invoer, dag);
    const datum = opmaak(dag.datum, { weekday: "short", day: "numeric", month: "short" });
    return {
      sleutel: dag.datum,
      label: opmaak(dag.datum, { weekday: "short" }).slice(0, 2),
      sublabel: dag.geregistreerd ? `${hoofd}/${nodig}` : "—",
      waarde,
      aandeel,
      staat,
      normGehaald: dag.geregistreerd && latGehaald(invoer, dag.somStreng),
      benaderd: dag.benaderd,
      uitleg:
        waarde === null
          ? `${datum}: niets geregistreerd`
          : [
              `${datum}: ${bedrag(waarde, invoer.unit, dag.benaderd)}`,
              aandeel !== null ? `${percentageADH(aandeel)} van ${naamVan(invoer).de}` : null,
              dag.volledig
                ? "alle maaltijden opgeschreven"
                : `${hoofd} van ${nodig} ${nodig === 1 ? "maaltijd" : "maaltijden"} opgeschreven, dus nog onvolledig`,
            ]
              .filter(Boolean)
              .join(" · "),
      aanvulling: schatting?.aanvulling ?? null,
      detail: dag.geregistreerd ? dagDetail(invoer, dag, schatting) : null,
    };
  });
}

function weekDetail(invoer: StofTrendInvoer, gemeten: readonly DagMeting[]): TrendDetail {
  const gemiddelden = gemiddeldenPerMoment(gemeten);
  return {
    momenten: EETMOMENTEN.flatMap(({ id, label }): TrendMomentRegel[] => {
      const gemiddelde = gemiddelden.get(id);
      if (id === "tussendoor" && !gemiddelde) return [];
      return [
        { moment: id, label, waarde: gemiddelde?.gemiddeld ?? null, keer: gemiddelde?.keer ?? 0, geschat: null, overgeslagen: false },
      ];
    }),
    bronnen: topBronnen(gemeten, invoer.unit),
    schatting: null,
  };
}

function puntenPerWeek(invoer: StofTrendInvoer): StofTrendPunt[] {
  const perWeek = new Map<string, DagMeting[]>();
  for (const dag of invoer.dagen) {
    const week = maandagVan(dag.datum);
    perWeek.set(week, [...(perWeek.get(week) ?? []), dag]);
  }
  return [...perWeek.entries()].map(([week, dagen]) => {
    const gemeten = dagen.filter((d) => d.geregistreerd);
    const volledig = gemeten.filter((d) => d.volledig).length;
    const waarde = gemeten.length > 0 ? gemeten.reduce((s, d) => s + d.som, 0) / gemeten.length : null;
    const streng = gemeten.length > 0 ? gemeten.reduce((s, d) => s + d.somStreng, 0) / gemeten.length : 0;
    const aandeel = waarde !== null && invoer.norm ? waarde / invoer.norm : null;
    const benaderd = gemeten.some((d) => d.benaderd);
    const staat: StofTrendStaat =
      gemeten.length === 0
        ? "leeg"
        : !oordeelt(invoer)
          ? volledig === gemeten.length
            ? "neutraal"
            : "onvolledig"
          : streng >= invoer.norm!
            ? "gehaald"
            : volledig === gemeten.length
              ? "onder"
              : "onvolledig";
    const van = dagen[0]!.datum;
    const tot = dagen[dagen.length - 1]!.datum;
    return {
      sleutel: week,
      label: opmaak(van, { day: "numeric", month: "short" }),
      sublabel: gemeten.length > 0 ? `${gemeten.length} ${gemeten.length === 1 ? "dag" : "dgn"}` : "—",
      waarde,
      aandeel,
      staat,
      normGehaald: gemeten.length > 0 && latGehaald(invoer, streng),
      benaderd,
      uitleg:
        waarde === null
          ? `${opmaak(van, { day: "numeric", month: "short" })} – ${opmaak(tot, { day: "numeric", month: "short" })}: niets geregistreerd`
          : [
              `${opmaak(van, { day: "numeric", month: "short" })} – ${opmaak(tot, { day: "numeric", month: "short" })}: gemiddeld ${bedrag(waarde, invoer.unit, benaderd)} per dag`,
              aandeel !== null ? `${percentageADH(aandeel)} van ${naamVan(invoer).de}` : null,
              `${volledig} van ${meervoud(gemeten.length, "dag", "dagen")} compleet opgeschreven`,
            ]
              .filter(Boolean)
              .join(" · "),
      aanvulling: null,
      detail: gemeten.length > 0 ? weekDetail(invoer, gemeten) : null,
    };
  });
}

/** Wat er per maaltijd te zeggen valt, ook als geen enkele dag volledig is. */
function perMaaltijdZin(invoer: StofTrendInvoer): string | null {
  const delen = EETMOMENTEN.flatMap(({ id, label }) => {
    const metingen = invoer.dagen.flatMap((d) => d.momenten.filter((m) => m.moment === id && m.geregistreerd && !m.overgeslagen));
    if (metingen.length === 0) return [];
    const gemiddeld = metingen.reduce((s, m) => s + m.som, 0) / metingen.length;
    const deel = invoer.norm ? ` (${percentageADH(gemiddeld / invoer.norm)} van ${naamVan(invoer).dag})` : "";
    return [`${label.toLowerCase()} ${bedrag(gemiddeld, invoer.unit)}${deel}, ${metingen.length} keer`];
  });
  return delen.length > 0 ? `Gemiddeld per maaltijd: ${delen.join(" · ")}.` : null;
}

function redenenVoor(invoer: StofTrendInvoer, gehaald: boolean): string[] {
  const gemeten = invoer.dagen.filter((d) => d.geregistreerd);
  if (gemeten.length === 0) return ["Niets geregistreerd in deze periode."];
  if (invoer.nietBewijsbaar) return [invoer.nietBewijsbaar];
  if (invoer.norm === null) {
    return [invoer.zonderNormUitleg ?? "Geen norm voor jou bekend.", perMaaltijdZin(invoer)].filter(
      (zin): zin is string => zin !== null,
    );
  }
  if (gehaald) return [];

  const redenen: string[] = [];
  const zonderGehalte = productenZonderGehalte(invoer.dagen);

  if (invoer.periodetotaal) {
    const totaal = invoer.dagen.reduce((s, d) => s + d.som, 0);
    const normPeriode = invoer.norm * invoer.dagen.length;
    redenen.push(
      `Samen minstens ${bedrag(totaal, invoer.unit)} in ${meervoud(invoer.dagen.length, "dag", "dagen")}. Over die dagen hoort er ${bedrag(normPeriode, invoer.unit)} bij te zitten: jij zit op ${percentageADH(totaal / normPeriode)}.`,
    );
  } else {
    const volledig = gemeten.filter((d) => d.volledig);
    const onvolledig = gemeten.length - volledig.length;
    if (volledig.length === 0) {
      redenen.push(
        "Geen enkele dag is compleet: er mist steeds een maaltijd. Wat je opschreef is dus een minimum; het echte getal kan hoger zijn.",
      );
    } else {
      const gemiddeld = volledig.reduce((s, d) => s + d.som, 0) / volledig.length;
      redenen.push(
        `Op de ${volledig.length === 1 ? "dag" : `${volledig.length} dagen`} dat alles erin stond, haalde je gemiddeld ${bedrag(gemiddeld, invoer.unit)}: ${percentageADH(gemiddeld / invoer.norm)} van ${naamVan(invoer).de} (${hoeveelheid(invoer.norm)} ${invoer.unit}).`,
      );
      if (onvolledig > 0) {
        redenen.push(
          `${meervoud(onvolledig, "dag mist", "dagen missen")} een maaltijd; daar kunnen we niets over zeggen.`,
        );
      }
    }
    if (volledig.length === 0) {
      const zin = perMaaltijdZin(invoer);
      if (zin) redenen.push(zin);
    }
  }

  if (zonderGehalte.length > 0) {
    const voorbeelden = zonderGehalte.slice(0, 2).join(", ");
    redenen.push(
      `${meervoud(zonderGehalte.length, "product", "producten")} ${zonderGehalte.length === 1 ? "telt" : "tellen"} niet mee: we weten niet hoeveel ${invoer.label.toLowerCase()} erin zit (${voorbeelden}${zonderGehalte.length > 2 ? ", …" : ""}).`,
    );
  }
  return redenen;
}

function kopVoor(invoer: StofTrendInvoer, schaal: TrendSchaal, punten: readonly StofTrendPunt[], gehaald: boolean): string {
  const gemeten = invoer.dagen.filter((d) => d.geregistreerd);
  if (gemeten.length === 0) return "niets geregistreerd";
  if (invoer.nietBewijsbaar) return "geen oordeel";
  if (invoer.periodetotaal && invoer.norm !== null) {
    const totaal = invoer.dagen.reduce((s, d) => s + d.som, 0);
    return `≥${hoeveelheid(totaal)} ${invoer.unit} totaal · ${gehaald ? "norm gehaald" : percentageADH(totaal / (invoer.norm * invoer.dagen.length))}`;
  }
  if (schaal === "maaltijd") {
    const dag = invoer.dagen[0]!;
    return invoer.norm
      ? `${bedrag(dag.som, invoer.unit, dag.benaderd)} · ${percentageADH(dag.som / invoer.norm)} van ${naamVan(invoer).de}`
      : bedrag(dag.som, invoer.unit, dag.benaderd);
  }
  if (!oordeelt(invoer)) {
    const gemiddeld = gemeten.reduce((s, d) => s + d.som, 0) / gemeten.length;
    const benaderd = gemeten.some((d) => d.benaderd);
    return invoer.norm
      ? `gem. ${bedrag(gemiddeld, invoer.unit, benaderd)} per dag · ${percentageADH(gemiddeld / invoer.norm)} van ${naamVan(invoer).de}`
      : `gem. ${bedrag(gemiddeld, invoer.unit, benaderd)} per dag`;
  }
  const eenheid = schaal === "dag" ? ["dag", "dagen"] : ["week", "weken"];
  const metWaarde = punten.filter((p) => p.staat !== "leeg");
  const keer = metWaarde.filter((p) => p.staat === "gehaald").length;
  return `${naamVan(invoer).kort} gehaald op ${keer} van ${meervoud(metWaarde.length, `gemeten ${eenheid[0]}`, `gemeten ${eenheid[1]}`)}`;
}

export function bouwStofTrend(invoer: StofTrendInvoer): StofTrend {
  const schaal = schaalVoor(invoer.dagen.length);
  const punten =
    schaal === "maaltijd" ? puntenPerMaaltijd(invoer) : schaal === "dag" ? puntenPerDag(invoer) : puntenPerWeek(invoer);

  const gemeten = invoer.dagen.filter((d) => d.geregistreerd);
  const gehaald =
    invoer.nietBewijsbaar === null &&
    invoer.norm !== null &&
    gemeten.length > 0 &&
    (invoer.periodetotaal
      ? invoer.dagen.reduce((s, d) => s + d.somStreng, 0) >= invoer.norm * invoer.dagen.length
      : gemeten.reduce((s, d) => s + d.somStreng, 0) / gemeten.length >= invoer.norm);

  return {
    stof: invoer.stof,
    label: invoer.label,
    unit: invoer.unit,
    soort: invoer.soort,
    norm: invoer.norm,
    normNaam: naamVan(invoer),
    periodetotaal: invoer.periodetotaal,
    bewijsbaar: invoer.nietBewijsbaar === null,
    schaal,
    punten,
    kop: kopVoor(invoer, schaal, punten, gehaald),
    periode:
      invoer.periodetotaal && invoer.norm !== null && gemeten.length > 0
        ? { totaal: invoer.dagen.reduce((s, d) => s + d.som, 0), norm: invoer.norm * invoer.dagen.length }
        : null,
    gehaald,
    redenen: redenenVoor(invoer, gehaald),
  };
}
