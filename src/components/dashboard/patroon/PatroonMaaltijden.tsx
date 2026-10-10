"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import AandeelBalk from "@/components/dashboard/patroon/AandeelBalk";
import PatroonMaaltijdProduct from "@/components/dashboard/patroon/PatroonMaaltijdProduct";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { keuzeTerugHref } from "@/lib/keuze-product-keuze";
import { supplementVergelijkingVoor } from "@/lib/nutrition-stof-meting";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { inEetpatroon } from "@/lib/nutrition-eetpatroon";
import {
  HELE_DAG,
  type DagPatroon,
  type MaaltijdPatroon,
  type MaaltijdProduct,
  type MaaltijdRij,
} from "@/lib/nutrition-maaltijd-patroon";
import {
  aandeelVan,
  doelRegel,
  normRegel,
  referentieVoorKernstof,
  referentieVoorVeld,
  sterksteBijdragen,
  type Referentie,
} from "@/lib/nutrition-maaltijd-referentie";
import { datumsTussen, periodeLabel, type Periode } from "@/lib/nutrition-periode";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import { trackEvent } from "@/lib/ga4";
import { useGevolgdeNormen, useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * Per maaltijd: wat ligt er gemiddeld op je ontbijt, je lunch, je avondeten.
 *
 * De maaltijden zijn de kop van het scherm (een segmentrij), omdat mensen hun
 * dag per moment terughalen en niet per stof (zie `nutrition-eetmomenten.ts`).
 * Daaronder: energie en macro's als tegels, dan alle micronutriënten en
 * kernstoffen in één tabel met het gemiddelde, de dichtheid per 100 kcal en
 * het aandeel van je persoonlijke dagnorm. Onderaan de maaltijden naast
 * elkaar, zodat je ziet welke zijn calorieën het rijkst besteedt.
 *
 * Geen oordeel per maaltijd: de norm is een dagnorm, geen doel per maaltijd. Macro's krijgen geen percentage (macro-besluit §0.1).
 *
 * De Norm-kolom draagt ook je eigen doel ("doel 17%") als je er een zette. Een
 * tik op een stof toont de norm met bron en welke producten hem leverden; een
 * tik op een product in "Wat je at" toont wat dat product alleen leverde
 * (`nutrition-maaltijd-referentie.ts`).
 *
 * Je eetpatroon (Je doelen) kiest welke maaltijden er staan: je gewone
 * maaltijden altijd, een andere alleen als er in de periode iets op stond.
 */

const GEEN_NORM: Partial<Record<string, string>> = {
  proteinG: "doel op Je doelen (gewicht en activiteit)",
  fiberG: "norm volgt uit je gewicht op Je doelen",
};

type TabelStof = {
  sleutel: string;
  label: string;
  waarvan: boolean;
  unit: string;
  waarde: number | null;
  benaderd: boolean;
  per100kcal: number | null;
  ref: Referentie;
  aandeel: number | null;
  uitSupplement: number | null;
  geenNorm: string;
  bijdragen: { naam: string; waarde: number }[];
  kern: boolean;
  nutrient: NutrientId | null;
};

const MACRO_TEGELS = ["energyKcal", "proteinG", "carbohydrateG", "fatG"] as const;

function rij(maaltijd: MaaltijdPatroon | DagPatroon, veld: string): MaaltijdRij | undefined {
  return maaltijd.rijen.find((r) => r.veld === veld);
}

function getal(waarde: number | null | undefined, benaderd = false): string {
  if (waarde === null || waarde === undefined) return "—";
  return `${benaderd ? "≈ " : ""}${rondVoedingswaarde(waarde)}`;
}

function metEenheid(waarde: number | null | undefined): string {
  return waarde === null || waarde === undefined ? "—" : `${getal(waarde)} g`;
}

export default function PatroonMaaltijden({
  patroon: alle,
  dag = null,
  periode,
  gewoneMaaltijden = null,
}: {
  patroon: readonly MaaltijdPatroon[];
  /** De hele dag als eigen keuze; null of zonder registraties = geen chip. */
  dag?: DagPatroon | null;
  periode: Periode;
  /** Je eetpatroon; null = alle drie. */
  gewoneMaaltijden?: readonly EetmomentId[] | null;
}) {
  const patroon = alle.filter((m) => m.keer > 0 || inEetpatroon(m.moment, gewoneMaaltijden));
  const normen = useKernstofNormen();
  const gevolgd = useGevolgdeNormen();
  const profiel = useKernstofProfiel();
  const [openProduct, setOpenProduct] = useState<string | null>(null);
  const [openStof, setOpenStof] = useState<string | null>(null);
  const [gekozen, setMoment] = useState<EetmomentId | typeof HELE_DAG | null>(null);
  const dagKeuze = dag !== null && dag.keer > 0 ? dag : null;
  const maaltijd: MaaltijdPatroon | DagPatroon | undefined =
    (gekozen === HELE_DAG ? dagKeuze : null) ??
    patroon.find((m) => m.moment === gekozen) ??
    patroon.find((m) => m.keer > 0) ??
    patroon[0];
  if (!maaltijd) return null;
  const moment = maaltijd.moment;

  const kies = (volgende: EetmomentId | typeof HELE_DAG) => {
    setMoment(volgende);
    setOpenProduct(null);
    setOpenStof(null);
    trackEvent("nutrition_patroon_maaltijd_gekozen", { moment: volgende });
    clarityTag("nutrition_patroon_maaltijd", volgende);
  };

  const kcal = rij(maaltijd, "energyKcal")?.waarde ?? null;
  const tabelRijen = maaltijd.rijen.filter((r) => r.veld !== "energyKcal");
  const metKeer = patroon.filter((m) => m.keer > 0);
  const rijkdomRijen = patroon.filter((m) => m.keer > 0 || m.moment !== "tussendoor");
  const rijkdomRegel = (m: MaaltijdPatroon) => {
    if (m.keer === 0) return "nog niets geregistreerd";
    const kcalVan = rij(m, "energyKcal")?.waarde ?? null;
    return kcalVan === null || kcalVan <= 0 ? "geen voedingswaarde bekend" : null;
  };
  const eenDag = periode.van === periode.tot;
  const dagen = datumsTussen(periode).length;
  const periodeTekst = eenDag ? `op ${periodeLabel(periode)}` : `(${periodeLabel(periode)})`;
  const isDag = maaltijd.moment === HELE_DAG;
  const naam = isDag ? "dag" : maaltijd.label.toLowerCase();

  const productKop = isDag
    ? eenDag
      ? "Wat je die dag at"
      : "Wat je meestal eet op een dag"
    : eenDag
      ? `Wat er op je ${naam} lag`
      : `Wat er meestal op je ${naam} ligt`;

  const stofRijen = tabelRijen.map((r) => {
    const ref = referentieVoorVeld(r.veld, gevolgd, profiel);
    return { r, ref, aandeel: aandeelVan(ref, r.waarde) };
  });
  const kernRijen = maaltijd.kernstoffen.map((k) => {
    const ref = referentieVoorKernstof(k.nutrient, normen, profiel);
    return { k, ref, aandeel: aandeelVan(ref, k.gemiddeld) };
  });
  const sterkst = sterksteBijdragen([
    ...stofRijen.flatMap(({ r, aandeel }) => (aandeel === null || r.waarvan ? [] : [{ label: r.label, aandeel }])),
    ...kernRijen.flatMap(({ k, ref, aandeel }) =>
      aandeel === null || ref.weektotaal ? [] : [{ label: k.label, aandeel }],
    ),
  ]);

  const bijdragenVan = (waardeVan: (product: MaaltijdProduct) => number | null) =>
    maaltijd.producten
      .flatMap((product) => {
        const waarde = waardeVan(product);
        return waarde === null || waarde <= 0 || maaltijd.keer === 0
          ? []
          : [{ naam: product.naam, waarde: (waarde * product.keer) / maaltijd.keer }];
      })
      .sort((a, b) => b.waarde - a.waarde);

  const tabel: TabelStof[] = [
    ...stofRijen.map(({ r, ref, aandeel }) => ({
      sleutel: r.veld,
      label: r.label,
      waarvan: r.waarvan === true,
      unit: r.unit,
      waarde: r.waarde,
      benaderd: r.benaderd === true,
      per100kcal: r.per100kcal,
      ref,
      aandeel,
      uitSupplement: null,
      geenNorm: GEEN_NORM[r.veld] ?? "geen dagnorm",
      bijdragen: bijdragenVan((product) => product.rijen.find((pr) => pr.veld === r.veld)?.waarde ?? null),
      kern: false,
      nutrient: null,
    })),
    ...kernRijen.map(({ k, ref, aandeel }) => ({
      sleutel: k.nutrient,
      label: k.label,
      waarvan: false,
      unit: k.unit,
      waarde: k.gemiddeld,
      benaderd: k.benaderd,
      per100kcal: k.gemiddeld === null || kcal === null || kcal <= 0 ? null : (k.gemiddeld / kcal) * 100,
      ref,
      aandeel,
      uitSupplement: k.uitSupplement,
      geenNorm: "geen dagnorm",
      bijdragen: bijdragenVan(
        (product) => product.kernstoffen.find((pk) => pk.nutrient === k.nutrient)?.gemiddeld ?? null,
      ),
      kern: true,
      nutrient: k.nutrient,
    })),
  ];

  const toggleStof = (stof: TabelStof) => {
    const open = openStof === stof.sleutel ? null : stof.sleutel;
    setOpenStof(open);
    if (open) {
      trackEvent("nutrition_patroon_stof_geopend", {
        nutrient: stof.sleutel,
        soort: stof.kern ? "kern" : "gevolgd",
        sectie: "maaltijd",
      });
    }
  };

  const stofRij = (stof: TabelStof) => {
    const open = openStof === stof.sleutel;
    const aanvullen =
      isDag && stof.nutrient !== null && stof.aandeel !== null && stof.aandeel < 1 && !stof.ref.weektotaal
        ? {
            nutrient: stof.nutrient,
            aandeel: stof.aandeel,
            keuzeHref: keuzeTerugHref(stof.nutrient),
            vergelijkingHref: supplementVergelijkingVoor(stof.nutrient),
          }
        : null;
    const doelAandeel =
      stof.ref.doel === null || stof.waarde === null ? null : stof.waarde / stof.ref.doel;
    return (
      <Fragment key={stof.sleutel}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => toggleStof(stof)}
          className="block w-full cursor-pointer border-x-0 border-b border-t-0 border-[var(--vd-line)] bg-transparent px-3 py-3 text-left font-[inherit] text-inherit last:border-b-0 hover:bg-[var(--vd-surface-2)] aria-expanded:bg-[var(--vd-surface-2)]"
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className={`min-w-0 text-[0.875rem] font-medium text-[var(--vd-ink)] ${stof.waarvan ? "pl-3 !font-normal !text-[var(--vd-ink-2)]" : ""}`}>
              {stof.label}
              {stof.uitSupplement ? (
                <i className="block text-[0.6875rem] font-normal not-italic text-[var(--vd-ink-3)]">
                  waarvan {rondVoedingswaarde(stof.uitSupplement)} {stof.unit} uit supplement
                </i>
              ) : null}
            </span>
            <span className="shrink-0 font-mono text-[0.8125rem] tabular-nums text-[var(--vd-ink)]">
              {stof.waarde === null ? (stof.kern ? "n.o." : "—") : `${getal(stof.waarde, stof.benaderd)} ${stof.unit}`}
            </span>
          </span>
          <span className="mt-2 flex items-center gap-3">
            {stof.aandeel === null ? (
              <span className="text-[0.6875rem] text-[var(--vd-ink-3)]">{stof.geenNorm}</span>
            ) : (
              <>
                <span className="min-w-0 flex-1">
                  <AandeelBalk
                    aandeel={stof.aandeel}
                    doelAandeel={doelAandeel}
                    label={`${stof.label}: ${percentageADH(stof.aandeel)} van je dagnorm`}
                  />
                </span>
                <span className="w-[3.25rem] shrink-0 text-right font-mono text-[0.75rem] tabular-nums text-[var(--vd-ink-2)]">
                  {stof.benaderd ? "≈ " : ""}
                  {percentageADH(stof.aandeel)}
                </span>
              </>
            )}
          </span>
          {doelAandeel !== null ? (
            <span className="mt-1 block text-right text-[0.625rem] text-[var(--vd-ink-3)]">
              jouw doel {percentageADH(doelAandeel)}
            </span>
          ) : null}
        </button>
        {open ? (
          <div className="border-b border-[var(--vd-line)] bg-[var(--vd-surface-2)] px-3 py-2.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
            <p className="m-0">{stof.waarvan ? "Telt mee in de regel erboven." : (normRegel(stof.ref) ?? stof.geenNorm)}</p>
            {stof.per100kcal !== null ? (
              <p className="m-0">
                Per 100 kcal: {getal(stof.per100kcal)} {stof.unit}
              </p>
            ) : null}
            {doelRegel(stof.ref, stof.waarde, stof.unit) ? (
              <p className="m-0">{doelRegel(stof.ref, stof.waarde, stof.unit)}</p>
            ) : null}
            {aanvullen ? (
              <div className="mt-3 rounded-[10px] border border-[var(--vd-line-2)] bg-[var(--vd-bg)] p-3">
                <p className="m-0 text-[0.75rem] leading-relaxed text-[var(--vd-ink-2)]">
                  Je haalt gemiddeld {percentageADH(aanvullen.aandeel)} van je dagnorm {stof.label.toLowerCase()}.
                  Hoe vul je dat aan?
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <Link
                    href={aanvullen.keuzeHref}
                    onClick={(event) => {
                      event.preventDefault();
                      trackEvent("nutrition_week_nutrient_clicked", {
                        nutrient: aanvullen.nutrient,
                        gedekt: false,
                        destination: aanvullen.keuzeHref,
                      });
                      gaNaarDashboard(aanvullen.keuzeHref);
                    }}
                    className="inline-flex min-h-[44px] items-center text-[0.8125rem] font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
                  >
                    Kies hoe je het aanvult →
                  </Link>
                  {aanvullen.vergelijkingHref ? (
                    <Link
                      href={aanvullen.vergelijkingHref}
                      onClick={() =>
                        trackEvent("nutrition_week_nutrient_clicked", {
                          nutrient: aanvullen.nutrient,
                          gedekt: false,
                          destination: aanvullen.vergelijkingHref ?? "",
                        })
                      }
                      className="inline-flex min-h-[44px] items-center text-[0.8125rem] text-[var(--vd-ink-2)] underline"
                    >
                      Supplementen vergelijken
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
            {stof.bijdragen.length > 0 ? (
              <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
                {stof.bijdragen.map((b) => {
                  const deel = aandeelVan(stof.ref, b.waarde);
                  return (
                    <li key={b.naam} className="grid grid-cols-[1fr_58px_52px] gap-2">
                      <span className="text-[var(--vd-ink-2)]">{b.naam}</span>
                      <span className="vd-getal">
                        {rondVoedingswaarde(b.waarde)} {stof.unit}
                      </span>
                      <span className="vd-getal">{deel === null ? "—" : percentageADH(deel)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="m-0 mt-1">Geen product met een gehalte voor deze stof.</p>
            )}
          </div>
        ) : null}
      </Fragment>
    );
  };

  const toggleProduct = (product: { naam: string; supplement: boolean }) => {
    const open = openProduct === product.naam ? null : product.naam;
    setOpenProduct(open);
    if (open) {
      trackEvent("nutrition_patroon_product_geopend", {
        moment,
        soort: product.supplement ? "supplement" : "voeding",
      });
    }
  };

  return (
    <section aria-label="Gemiddeld per maaltijd" className="@container">
      <div className="@[44rem]:grid @[44rem]:grid-cols-[11rem_minmax(0,1fr)] @[44rem]:items-start @[44rem]:gap-6">
      <div
        className="vd-chiprij @[44rem]:sticky @[44rem]:top-4 @[44rem]:flex-col @[44rem]:flex-nowrap"
        role="group"
        aria-label="Kies een maaltijd"
      >
        {patroon.map((m) => {
          const aan = m.moment === moment;
          return (
            <button
              key={m.moment}
              type="button"
              aria-pressed={aan}
              onClick={() => kies(m.moment)}
              className={`vd-chip inline-flex min-h-[40px] items-center gap-1.5 @[44rem]:w-full @[44rem]:justify-start ${aan ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: m.keer > 0 ? "var(--vd-sage-2)" : "var(--vd-ink-4)" }}
              />
              {m.label}
            </button>
          );
        })}
        {dagKeuze ? (
          <button
            type="button"
            aria-pressed={isDag}
            onClick={() => kies(HELE_DAG)}
            className={`vd-chip inline-flex min-h-[40px] items-center gap-1.5 @[44rem]:w-full @[44rem]:justify-start ${isDag ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--vd-sage-2)" }} />
            Hele dag
          </button>
        ) : null}
      </div>

      <div className="min-w-0">
      {maaltijd.keer === 0 ? (
        <p className="vd-note" style={{ marginTop: 0 }}>
          {eenDag ? "Op" : "In"} {periodeLabel(periode)} staat er bij {isDag ? "de hele dag" : naam} nog niets
          geregistreerd. Vul het in je dagboek in — dan zie je hier wat er gemiddeld op je bord ligt.
        </p>
      ) : (
        <>
          <section
            aria-label={`${maaltijd.label}, gemiddeld`}
            className="@container mb-3 rounded-[16px] border border-[var(--vd-line)] bg-gradient-to-br from-[var(--vd-surface-2)] to-[var(--vd-surface)] p-4 @[34rem]:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="vd-eyebrow m-0 !tracking-[0.1em]">
                  {eenDag
                    ? `${maaltijd.label} ${periodeTekst}`
                    : `Gemiddeld per ${naam} · ${maaltijd.keer} van ${dagen} dagen geregistreerd`}
                </p>
                <h3 className="mb-0 mt-1.5 text-[1.625rem] leading-none text-[var(--vd-ink)]">{maaltijd.label}</h3>
                {eenDag ? null : (
                  <p className="m-0 mt-1.5 text-[0.75rem] text-[var(--vd-ink-3)]">{periodeLabel(periode)}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-[var(--vd-line)] pt-4">
              <div>
                <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">Energie</span>
                <b className="font-mono text-[2rem] font-medium leading-none tabular-nums text-[var(--vd-ink)]">
                  {getal(rij(maaltijd, "energyKcal")?.waarde, rij(maaltijd, "energyKcal")?.benaderd)}
                </b>
                <span className="ml-1 text-[0.75rem] text-[var(--vd-ink-3)]">kcal</span>
              </div>
            </div>

            <dl className="m-0 mt-3 grid grid-cols-3 divide-x divide-[var(--vd-line)] rounded-xl border border-[var(--vd-line)] bg-[var(--vd-bg)]">
              {MACRO_TEGELS.filter((veld) => veld !== "energyKcal").map((veld) => {
                const r = rij(maaltijd, veld);
                return (
                  <div key={veld} className="min-w-0 px-3 py-2.5">
                    <dt className="text-[0.6875rem] text-[var(--vd-ink-3)]">{r?.label}</dt>
                    <dd className="m-0 mt-0.5 font-mono text-[1rem] tabular-nums text-[var(--vd-ink)]">
                      {getal(r?.waarde, r?.benaderd)}
                      <small className="ml-0.5 text-[0.6875rem] text-[var(--vd-ink-3)]">{r?.unit}</small>
                    </dd>
                  </div>
                );
              })}
            </dl>

            {sterkst.length > 0 ? (
              <div className="mt-4 border-t border-[var(--vd-line)] pt-4">
                <p className="m-0 text-[0.8125rem] font-semibold text-[var(--vd-ink)]">
                  Waar je {naam} het meest aan bijdraagt
                </p>
                <p className="m-0 mt-0.5 text-[0.6875rem] text-[var(--vd-ink-3)]">Deel van je dagnorm</p>
                <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                  {sterkst.map((b) => (
                    <li key={b.label}>
                      <span className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                        <span className="text-[var(--vd-ink-2)]">{b.label}</span>
                        <span className="font-mono tabular-nums text-[var(--vd-ink)]">{percentageADH(b.aandeel)}</span>
                      </span>
                      <span className="mt-1.5 block">
                        <AandeelBalk
                          aandeel={b.aandeel}
                          hoog
                          label={`${b.label}: ${percentageADH(b.aandeel)} van je dagnorm`}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {maaltijd.benaderdeProducten.length > 0 ? (
            <p className="vd-note" style={{ margin: "-0.25rem 0 0.75rem" }}>
              Van {maaltijd.benaderdeProducten.join(", ")} hebben we geen eigen voedingswaarde. We rekenen met een
              vergelijkbaar product en zetten er daarom een ≈ bij.
            </p>
          ) : null}

          {maaltijd.producten.length > 0 ? (
            <section aria-label="Wat je at" className="vd-tabel !border-t-[3px] !border-t-[var(--vd-sage)]">
              <div className="vd-tabel-kop">
                <span className="!text-left">{productKop}</span>
              </div>
              {maaltijd.producten.slice(0, isDag ? 15 : 8).map((product) => {
                const open = openProduct === product.naam;
                return (
                  <Fragment key={product.naam}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleProduct(product)}
                      className="vd-tabel-rij w-full cursor-pointer grid-cols-[1fr_auto_14px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit hover:bg-[var(--vd-surface-2)]"
                    >
                      <span className="vd-naam">
                        {product.naam}
                        {product.supplement ? <i>supplement</i> : null}
                      </span>
                      <span className="vd-getal">
                        {product.eenheid === "g" ? `${product.hoeveelheid} g` : `${product.hoeveelheid}×`}
                        {!eenDag && product.keer > 1 ? ` · ${product.keer} keer` : ""}
                      </span>
                      <span aria-hidden className="text-[var(--vd-ink-3)]">
                        {open ? "▾" : "›"}
                      </span>
                    </button>
                    {open ? <PatroonMaaltijdProduct product={product} /> : null}
                  </Fragment>
                );
              })}
            </section>
          ) : null}

          <div className="vd-tabel !border-t-[3px] !border-t-[var(--vd-accent-2)]">
            <div className="vd-tabel-kop grid-cols-[1fr_auto]">
              <span>Stof · gemiddeld</span>
              <span>Deel van je dagnorm</span>
            </div>

            {tabel.filter((stof) => !stof.kern).map(stofRij)}

            <div className="vd-tabel-kop">
              <span className="!text-left">Kernstoffen · tegen je dagnorm</span>
            </div>
            {tabel.filter((stof) => stof.kern).map(stofRij)}
          </div>

          <p className="vd-note">
            Zo lees je het: de hele balk is wat je op een dag nodig hebt. Het gekleurde deel is wat{" "}
            {isDag ? (eenDag ? "deze dag" : "een gemiddelde dag") : eenDag ? `je ${naam}` : `een gemiddeld ${naam}`}{" "}
            daarvan levert. Tik op een stof om te zien welke producten het leverden.
          </p>

          {maaltijd.zonderWaarde > 0 || maaltijd.supplementen > 0 ? (
            <p className="vd-note">
              {maaltijd.zonderWaarde > 0
                ? `Van ${maaltijd.zonderWaarde} ${maaltijd.zonderWaarde === 1 ? "product" : "producten"} kennen we de voedingswaarde niet, dus de echte waarden liggen iets hoger. `
                : ""}
              {maaltijd.supplementen > 0
                ? `Supplementen tellen alleen mee voor hun eigen stof (${maaltijd.supplementen} keer genomen).`
                : ""}
            </p>
          ) : null}
        </>
      )}

      {metKeer.length > 0 && rijkdomRijen.length > 1 ? (
        <>
          <p className="vd-eyebrow" style={{ margin: "1.25rem 0 0.375rem" }}>
            Vergelijk je maaltijden · per 100 kcal
          </p>
          <div className="vd-tabel">
            <div className="vd-tabel-kop grid-cols-[1fr_56px_52px_52px]">
              <span>Maaltijd</span>
              <span>kcal</span>
              <span>Eiwit</span>
              <span>Vezels</span>
            </div>
            {rijkdomRijen.map((m) => {
              const regel = rijkdomRegel(m);
              return (
              <button
                key={m.moment}
                type="button"
                onClick={() => kies(m.moment)}
                aria-pressed={m.moment === moment}
                className="vd-tabel-rij w-full cursor-pointer grid-cols-[1fr_56px_52px_52px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit aria-pressed:bg-[var(--vd-surface-2)]"
              >
                <span className="vd-naam">{m.label}</span>
                {regel ? (
                  <span className="col-span-3 text-right text-[0.6875rem] italic text-[var(--vd-ink-3)]">{regel}</span>
                ) : (
                  <>
                    <span className="vd-getal">{getal(rij(m, "energyKcal")?.waarde)}</span>
                    <span className="vd-getal">{metEenheid(rij(m, "proteinG")?.per100kcal)}</span>
                    <span className="vd-getal">{metEenheid(rij(m, "fiberG")?.per100kcal)}</span>
                  </>
                )}
              </button>
              );
            })}
          </div>
          <p className="vd-note">
            Zo zie je welke maaltijd per calorie het meeste eiwit en de meeste vezels geeft, los van hoe groot
            hij is. Prijzen per maaltijd tonen we nog niet: daar is nog geen betrouwbare bron voor.
          </p>
        </>
      ) : null}
      </div>
      </div>
    </section>
  );
}
