"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import type { AffiliateSlug } from "@/data/affiliate-links";
import { leesKeuzeHerkomst } from "@/lib/keuze-product-keuze";
import type { SupplementCategory } from "@/types/supplement";

/**
 * De weg naar de winkel, bovenaan de productpagina, voor wie hier via Keuze
 * kwam (`?van=keuze&stof=…`). Wie een product koos wil vooral weten wat het
 * kost en waar het ligt; dat stond halverwege de pagina, na de stats en de
 * samenvatting. Zonder die herkomst rendert deze kaart niets en blijft de pagina
 * zoals hij was voor bezoekers uit Google.
 *
 * Eigen herkomst `productpagina-keuze` op de klik, zodat in `affiliate_clicks`
 * af te lezen is wat Keuze oplevert. De commissie-uitleg staat er direct bij,
 * zoals bij de knop verderop. In het dashboard zelf staat geen affiliate-link
 * (cockpit-besluit): de koop gebeurt hier.
 */
export default function KeuzeKoopKaart({
  naam,
  prijsPerDag,
  score,
  affiliateSlug,
  category,
}: {
  naam: string;
  prijsPerDag: string;
  score: string;
  affiliateSlug: AffiliateSlug;
  category: SupplementCategory;
}) {
  const stof = leesKeuzeHerkomst(useSearchParams());
  if (!stof) return null;

  return (
    <section
      aria-label="Prijs en winkels"
      className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Jouw keuze</p>
          <p className="m-0 mt-0.5 text-base font-semibold text-stone-900">{naam}</p>
          <p className="m-0 mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-700">
            <span className="rounded-full bg-stone-100 px-3 py-1 font-semibold">{prijsPerDag} per dag</span>
            <span className="rounded-full bg-ps-green/10 px-3 py-1 font-semibold text-ps-green">PS-Score {score}</span>
          </p>
        </div>
        <AffiliateLink
          affiliateSlug={affiliateSlug}
          category={category}
          sourcePage="productpagina-keuze"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-ps-green px-6 md:w-auto py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
        >
          Prijs en winkels →
        </AffiliateLink>
      </div>
      <p className="m-0 mt-3 text-xs text-stone-500">
        Onafhankelijk beoordeeld — geen sponsoring. We ontvangen mogelijk een vergoeding als je via deze link koopt; dat
        verandert de score niet.{" "}
        <Link href="/affiliate-disclosure" className="font-medium text-ps-green hover:text-ps-green-hover">
          Hoe dat werkt
        </Link>
        .
      </p>
    </section>
  );
}
