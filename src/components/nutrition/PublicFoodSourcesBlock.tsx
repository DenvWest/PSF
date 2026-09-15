"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NEVO_CITATION } from "@/data/nutrition/food-sources";
import type { PublicFoodBron, PublicNutrientPage } from "@/lib/voeding-public";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

const COLLAPSED_COUNT = 3;

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

function BronRij({ bron }: { bron: PublicFoodBron }) {
  return (
    <tr className="border-t border-stone-200/80">
      <td className="py-3 pr-3 align-top text-sm leading-snug text-stone-800">
        {bron.labelNl}
        {bron.opnameNote ? (
          <p className="mt-1 text-xs leading-relaxed text-amber-800/90">{bron.opnameNote}</p>
        ) : null}
        {bron.qualityNote ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-500">{bron.qualityNote}</p>
        ) : null}
        {bron.preparationNote ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-500">{bron.preparationNote}</p>
        ) : null}
      </td>
      <td className="py-3 pr-3 align-top text-sm leading-snug text-stone-600">{bron.portionNl}</td>
      <td className="py-3 pr-2 text-right align-top text-sm font-semibold tabular-nums text-stone-800">
        {bron.amount === null ? (
          <span className="font-normal text-stone-400">—</span>
        ) : (
          <>
            {bron.amount}
            {bron.unit ? <span className="ml-0.5 font-normal text-stone-500">{bron.unit}</span> : null}
          </>
        )}
      </td>
      <td className="py-3 pl-2 text-right align-top">
        <span
          className={`text-xs ${bron.verified ? "text-emerald-700" : "text-stone-400"}`}
          title={
            bron.verified
              ? `Gehalte uit ${NEVO_CITATION}${bron.bronNaam ? ` — "${bron.bronNaam}"` : ""}`
              : "Indicatief cijfer, nog niet tegen een brondataset gelegd"
          }
        >
          {bron.verified ? "NEVO" : "indicatief"}
        </span>
      </td>
    </tr>
  );
}

interface PublicFoodSourcesBlockProps {
  page: PublicNutrientPage;
}

export default function PublicFoodSourcesBlock({ page }: PublicFoodSourcesBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const viewedRef = useRef(false);
  const blockRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = blockRef.current;
    if (!node || viewedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        viewedRef.current = true;
        trackEvent(GA4_EVENTS.VOEDING_BRONNEN_VIEWED, {
          stof: page.slug,
          verified_count: page.verifiedCount,
        });
        clarityTag("voeding_bronnen", page.slug);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page.slug, page.verifiedCount]);

  const visibleBronnen = expanded ? page.bronnen : page.bronnen.slice(0, COLLAPSED_COUNT);
  const hasMore = page.bronnen.length > COLLAPSED_COUNT;

  function handleExpand() {
    setExpanded(true);
    trackEvent(GA4_EVENTS.VOEDING_BRONNEN_EXPANDED, {
      stof: page.slug,
      bron_count: page.bronnen.length,
    });
    clarityTag("voeding_bronnen_expanded", page.slug);
  }

  return (
    <section
      ref={blockRef}
      aria-label={`Voedingsbronnen voor ${page.label}`}
      className="rounded-2xl border border-stone-200/90 bg-white px-5 py-6 md:px-7 md:py-8"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Route uit je bord
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-stone-900">
          {page.label}: {page.thresholdNl}
        </h2>
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-stone-600">
          {page.lifestyleAction}
        </p>
        {page.thresholdKind === "proxy" ? (
          <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-amber-900/85">
            {page.confidenceWhy}
          </p>
        ) : null}
      </header>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <caption className="mb-3 text-left text-sm text-stone-500">
            Sterkste bronnen per portie — naast elkaar, niet opgeteld tot een dagtotaal.
          </caption>
          <thead>
            <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-stone-500">
              <th scope="col" className="pb-2 pr-3">Bron</th>
              <th scope="col" className="pb-2 pr-3">Portie</th>
              <th scope="col" className="pb-2 pr-2 text-right">Levert</th>
              <th scope="col" className="pb-2 pl-2 text-right">Herkomst</th>
            </tr>
          </thead>
          <tbody>
            {visibleBronnen.map((bron) => (
              <BronRij key={bron.key} bron={bron} />
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && !expanded ? (
        <button
          type="button"
          onClick={handleExpand}
          className="mt-4 text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-900 hover:decoration-stone-500"
        >
          Toon alle {page.bronnen.length} bronnen →
        </button>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-stone-500">
        Gehaltes gemerkt met NEVO: {NEVO_CITATION}. Onze portiewaarden zijn daaruit
        omgerekend — dat is onze bewerking, niet het brondcijfer. Geen dagtotaal, geen
        ADH-percentage.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/intake/voeding"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ps-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
          onClick={() => {
            trackEvent(GA4_EVENTS.VOEDING_CHECK_CLICKED, { stof: page.slug, locatie: "bronnenblok" });
            clarityTag("voeding_check_click", `${page.slug}:bronnenblok`);
          }}
        >
          Doe de voedingscheck (1 min) →
        </Link>
        <Link href={page.comparisonPath} className={`inline-flex min-h-11 items-center px-1 py-3 text-sm ${LINK}`}>
          {page.comparisonLabel} →
        </Link>
      </div>
    </section>
  );
}
