"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { RelatedLink, RelationKind } from "@/lib/content-graph/related-content";

/**
 * Verder lezen — afgeleid uit de graaf in plaats van per artikel geschreven.
 *
 * Vervangt de handmatige lijst, maar zet hem niet opzij: `gerelateerdeSluggen`
 * komt altijd eerst en telt mee in de limiet. Wat de graaf toevoegt is het
 * stuk dat niemand bijhoudt — de verwijzing terug naar een nieuw artikel, en de
 * brug naar de voedingsstofpagina.
 *
 * Het label komt van de doelpagina, nooit van de bron. Anders duidt hetzelfde
 * artikel op twaalf plekken twaalf verschillende namen aan.
 */

const RELATIE_LABEL: Record<RelationKind, string> = {
  handmatig: "Verder lezen",
  stof: "Zelfde stof",
  onderwerp: "Zelfde onderwerp",
  probleem: "Zelfde signaal",
  supplement: "Zelfde supplement",
};

export default function RelatedContentRail({
  links,
  from,
  fromType,
}: {
  links: readonly RelatedLink[];
  from: string;
  fromType: string;
}) {
  if (links.length === 0) return null;

  function meldKlik(link: RelatedLink) {
    emitIntakeClientEvent("content.related_clicked", {
      from,
      from_type: fromType,
      to: link.href,
      relation: link.relation,
    });
    trackEvent("content_related_clicked", {
      from_type: fromType,
      relation: link.relation,
    });
  }

  return (
    <section aria-labelledby="gerelateerd-heading">
      <h2
        id="gerelateerd-heading"
        className="font-display text-[0.9375rem] font-semibold text-stone-900 md:text-base"
      >
        Verder lezen
      </h2>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => meldKlik(link)}
            className="group flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 p-5 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/30 hover:shadow-[0_6px_18px_rgba(90,143,106,0.14)] active:translate-y-0"
          >
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-stone-500">
              {RELATIE_LABEL[link.relation]}
            </span>
            <h3 className="text-sm font-semibold leading-snug text-stone-900 transition-colors group-hover:text-ps-green">
              {link.label}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
