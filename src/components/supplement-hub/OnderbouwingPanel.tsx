"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATALOG, type ThemaTag } from "@/data/supplement-hub/catalog";
import {
  PS_SCORE_MODEL_VERSION,
  SCORE_COMPONENT_LABELS,
  SCORE_WEIGHTS,
} from "@/data/supplement-hub/score-model";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { ScoreComponentId } from "@/types/supplement-score";

const GEZONDHEIDSGIDSEN: ReadonlyArray<{
  thema: ThemaTag;
  label: string;
  href: string;
}> = [
  { thema: "slaap", label: "Slaap", href: "/gids/slaap" },
  { thema: "stress", label: "Stress", href: "/gids/stress" },
  { thema: "energie", label: "Energie", href: "/gids/energie" },
  { thema: "herstel", label: "Herstel", href: "/gids/herstel" },
];

const KOPJE =
  "font-display text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-stone-400";

type OnderbouwingPanelProps = {
  /** Meetpunt-context: van welk scherm de klik komt. */
  bron: string;
  /** Gids die de bezoeker al leest; die verdwijnt uit de lijst. */
  actieveGidsSlug?: string;
  /** Thema's van dit supplement; die komen vooraan te staan. */
  nadrukThemas?: readonly ThemaTag[];
  className?: string;
};

/**
 * De onderbouwing als één knop in de zijbalk. Alles wat erin hoort — de
 * rekenwijze, de gratis gezondheidsgidsen en de supplementgidsen — staat achter
 * die knop in een paneel. Zo blijft de keuzekolom een kolom met keuzes en leidt
 * het bewijsmateriaal niet af van de vergelijking zelf.
 *
 * Het paneel staat altijd in de HTML (alleen visueel gesloten), zodat de
 * interne links vindbaar blijven voor zoekmachines.
 */
export default function OnderbouwingPanel({
  bron,
  actieveGidsSlug,
  nadrukThemas = [],
  className = "",
}: OnderbouwingPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const componenten = Object.keys(SCORE_WEIGHTS) as ScoreComponentId[];
  const gidsen = CATALOG.filter(
    (entry) => !entry.comingSoon && entry.slug !== actieveGidsSlug,
  );
  const themas = [...GEZONDHEIDSGIDSEN].sort(
    (a, b) =>
      Number(nadrukThemas.includes(b.thema)) -
      Number(nadrukThemas.includes(a.thema)),
  );

  function meld(bestemming: string, waarde: string) {
    trackEvent(GA4_EVENTS.ONDERBOUWING_LINK_CLICKED, {
      bron,
      bestemming,
      waarde,
    });
    clarityTag("supplementen_onderbouwing", `${bestemming}:${waarde}`);
  }

  function open() {
    dialogRef.current?.showModal();
    meld("paneel", "open");
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`flex w-full items-center justify-between gap-3 border-t border-stone-200 pt-4 text-left transition-colors hover:text-ps-green lg:rounded-xl lg:border lg:border-stone-200 lg:bg-white lg:px-4 lg:py-3 lg:pt-3 lg:hover:border-ps-green/40 ${className}`}
      >
        <span className="font-display text-[0.82rem] font-semibold text-stone-600 lg:text-sm lg:text-stone-900">
          Onderbouwing &amp; gidsen
        </span>
        <span
          aria-hidden
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-stone-300 text-[0.7rem] font-semibold text-stone-400"
        >
          i
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="onderbouwing-titel"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-[min(38rem,92vw)] rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <p
              id="onderbouwing-titel"
              className="font-display text-lg font-bold text-stone-900"
            >
              Onderbouwing
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              Waarom een product hier staat — en wat er vóór het potje komt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <span className="sr-only">Sluiten</span>
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 scrollbar-slim">
          <section aria-label="Hoe we scoren">
            <p className={KOPJE}>Hoe we scoren</p>
            <ul className="mt-2.5 space-y-1.5" role="list">
              {componenten.map((id) => (
                <li
                  key={id}
                  className="flex items-baseline justify-between gap-4 text-sm text-stone-600"
                >
                  <span>{SCORE_COMPONENT_LABELS[id]}</span>
                  <span className="flex-shrink-0 font-semibold tabular-nums text-stone-800">
                    {Math.round(SCORE_WEIGHTS[id] * 100)}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-xs leading-relaxed text-stone-400">
              Model {PS_SCORE_MODEL_VERSION} · prijs zit bewust niet in de
              score; die krijgt een eigen rang per claim-conforme dag.
            </p>
            <Link
              href="/ps-score"
              onClick={() => {
                meld("ps_score", "hele_methode");
                trackEvent(GA4_EVENTS.SUPPLEMENTEN_METHODIEK_GEOPEND, {
                  bron,
                  model_versie: PS_SCORE_MODEL_VERSION,
                });
              }}
              className="mt-3.5 inline-flex w-full items-center justify-center rounded-lg border border-ps-green px-4 py-2.5 text-sm font-semibold text-ps-green transition-all hover:bg-ps-green hover:text-white"
            >
              Lees de hele methode →
            </Link>
          </section>

          <section aria-label="Gratis gezondheidsgidsen" className="mt-7">
            <p className={KOPJE}>Gratis gezondheidsgidsen</p>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
              De leefstijlkant van hetzelfde probleem. Vaak levert die meer op
              dan een potje.
            </p>
            <ul className="mt-2.5 grid grid-cols-2 gap-2" role="list">
              {themas.map((thema) => {
                const nadruk = nadrukThemas.includes(thema.thema);
                return (
                  <li key={thema.href}>
                    <Link
                      href={thema.href}
                      onClick={() => meld("gezondheidsgids", thema.thema)}
                      className={`flex items-center justify-between gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        nadruk
                          ? "border-[#5A8F6A]/40 bg-[#F0FAF3] text-[#3D6B4F] hover:border-ps-green"
                          : "border-stone-200 text-stone-700 hover:border-ps-green/40 hover:text-ps-green"
                      }`}
                    >
                      {thema.label}
                      <span aria-hidden className="text-stone-300">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="Supplementgidsen" className="mt-7">
            <p className={KOPJE}>Supplementgidsen</p>
            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5" role="list">
              {gidsen.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={entry.guideHref}
                    onClick={() => meld("supplementgids", entry.slug)}
                    className="text-sm font-medium text-ps-green transition-colors hover:text-ps-green-hover"
                  >
                    {entry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-7 border-t border-stone-100 pt-4 text-xs leading-relaxed text-stone-400">
            Geen gesponsorde rangen, geen betaalde plaatsing. We rekenen met wat
            jij zelf kunt nakijken: het etiket, het EU-claimregister en
            labrapporten die fabrikanten publiceren. Eigen labanalyses doen we
            (nog) niet — dat staat er zo bij.
          </p>
        </div>
      </dialog>
    </>
  );
}
