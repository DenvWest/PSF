"use client";

import Link from "next/link";
import type { BlogCategorie } from "@/types/blog";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { voedingDatabaseStats } from "@/lib/voeding-public";

const GIDS_PER_CATEGORIE: Record<
  BlogCategorie,
  { href: string; label: string; beschrijving: string }
> = {
  stress: {
    href: "/gids/stress",
    label: "Gezondheidsgids stress",
    beschrijving: "Stappenplan voor herstel en grenzen — na je check.",
  },
  slaap: {
    href: "/gids/slaap",
    label: "Gezondheidsgids slaap",
    beschrijving: "Ritme, omgeving en gewoontes — vóór je naar supplementen kijkt.",
  },
  energie: {
    href: "/gids/energie",
    label: "Gezondheidsgids energie",
    beschrijving: "Waar energie lekt en wat je eerst aanpast.",
  },
  supplementen: {
    href: "/gids/voeding",
    label: "Gezondheidsgids voeding",
    beschrijving: "Eerst je bord op orde — supplementen zijn de laatste stap.",
  },
};

interface BlogControleerVerbeterPadProps {
  categorie: BlogCategorie;
  artikelSlug: string;
  className?: string;
}

export default function BlogControleerVerbeterPad({
  categorie,
  artikelSlug,
  className = "",
}: BlogControleerVerbeterPadProps) {
  const gids = GIDS_PER_CATEGORIE[categorie];
  const { catalogCount, verifiedCount } = voedingDatabaseStats();

  return (
    <aside
      aria-label="Controleer en verbeter"
      className={`max-w-[72ch] rounded-xl border border-stone-200/90 bg-white px-6 py-6 md:px-7 md:py-7 ${className}`}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
        Eerst controleren, dan verbeteren
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#5A8F6A]/20 bg-[#F0FAF3]/60 px-4 py-4">
          <p className="text-sm font-semibold text-stone-900">1. Controleer</p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Waar sta je op voeding? Eén minuut, geen account.
          </p>
          <Link
            href="/intake/voeding"
            className="mt-3 inline-flex text-sm font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
            onClick={() => {
              trackEvent(GA4_EVENTS.BLOG_VOEDINGSCHECK_CLICK, {
                artikel: artikelSlug,
                categorie,
                locatie: "controleer_verbeter",
              });
              clarityTag("blog_voedingscheck", `${artikelSlug}:${categorie}`);
            }}
          >
            Doe de voedingscheck →
          </Link>
        </div>
        <div className="rounded-lg border border-stone-200/80 bg-stone-50/70 px-4 py-4">
          <p className="text-sm font-semibold text-stone-900">2. Verbeter</p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{gids.beschrijving}</p>
          <Link
            href={gids.href}
            className="mt-3 inline-flex text-sm font-medium text-stone-800 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-950 hover:decoration-stone-500"
            onClick={() => {
              trackEvent(GA4_EVENTS.BLOG_GEZONDHEIDSGIDS_CLICK, {
                artikel: artikelSlug,
                categorie,
                gids: gids.href,
                locatie: "controleer_verbeter",
              });
              clarityTag("blog_gezondheidsgids", `${artikelSlug}:${categorie}`);
            }}
          >
            {gids.label} →
          </Link>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        Of bekijk{" "}
        <Link
          href="/voeding"
          className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-[3px] hover:text-stone-900"
          onClick={() => {
            trackEvent(GA4_EVENTS.BLOG_VOEDING_HUB_CLICK, {
              artikel: artikelSlug,
              categorie,
            });
          }}
        >
          voedingsbronnen per stof
        </Link>{" "}
        uit onze database — {catalogCount} voedingsmiddelen, {verifiedCount} met NEVO-gehalte.
      </p>
    </aside>
  );
}
