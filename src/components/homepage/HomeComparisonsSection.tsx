"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import { CATALOG, HUB_COMPARISON_TAGLINES } from "@/data/supplement-hub/catalog";
import { trackEvent } from "@/lib/ga4";

const comparisons = CATALOG.filter(
  (entry) => entry.comparisonHref !== null && !entry.comingSoon,
);

export default function HomeComparisonsSection() {
  return (
    <section
      className="border-t border-stone-200/60 bg-white px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="vergelijkingen-heading"
    >
      <Container>
        <h2
          id="vergelijkingen-heading"
          className="font-serif text-2xl text-stone-900 sm:text-3xl"
        >
          Welk supplement is het kopen waard?
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
          Per categorie vergelijken we de vormen, de werkzame dosering en de prijs per
          dag — en we zeggen het als een product de Europese claimdrempel niet haalt.
          Geen ranglijst op commissie.
        </p>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={entry.comparisonHref as string}
                onClick={() =>
                  trackEvent("supplements_route_click", {
                    source: "homepage",
                    supplement: entry.slug,
                  })
                }
                className="flex h-full min-h-[44px] flex-col rounded-lg border border-stone-200 bg-[#FDFCFA] p-5 transition hover:border-ps-green focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50"
              >
                <span className="font-serif text-lg text-stone-900">
                  Beste {entry.name.toLowerCase()}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                  {HUB_COMPARISON_TAGLINES[entry.slug]}
                </span>
                <span className="mt-4 text-sm font-semibold text-ps-green">
                  Vergelijk →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/supplementen"
          onClick={() =>
            trackEvent("supplements_route_click", {
              source: "homepage",
              supplement: "hub",
            })
          }
          className="mt-9 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-900/50 focus-visible:ring-offset-2"
        >
          Alle supplementen bekijken
        </Link>
      </Container>
    </section>
  );
}
