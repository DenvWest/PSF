"use client";

import Link from "next/link";
import {
  AUDIENCE_OPTIONS,
  type ContentAudience,
} from "@/lib/content-audience";
import { LIB_EYEBROW } from "@/components/library/library-tokens";

export type AudienceContext = {
  /** Eén regel die uitlegt wat de lens nu doet. */
  toelichting: string;
  /** Optionele verwijzing naar het oppervlak dat wél specifiek is. */
  link?: { label: string; href: string };
};

type LibraryAudienceLensProps = {
  value: ContentAudience;
  onChange: (value: ContentAudience) => void;
  /** Aantal items dat expliciet vanuit die fysiologie is geschreven. */
  counts: Record<"mannen" | "vrouwen", number>;
  totaal: number;
  context: Record<ContentAudience, AudienceContext>;
};

/**
 * De man/vrouw-keuze. Staat bovenaan de keuzekolom omdat het de enige keuze is
 * die de hele lijst herordent; de andere filters snijden er daarna doorheen.
 */
export default function LibraryAudienceLens({
  value,
  onChange,
  counts,
  totaal,
  context,
}: LibraryAudienceLensProps) {
  const actief = context[value];

  return (
    <section
      aria-label="Voor wie lees je"
      className="rounded-2xl border border-ps-green/25 bg-gradient-to-br from-[#EAF6EE] to-[#F8FBF9] p-4 lg:p-5"
    >
      <p className={`${LIB_EYEBROW} text-[#5A8F6A]`}>Voor wie lees je?</p>

      <div
        role="radiogroup"
        aria-label="Kies je fysiologie"
        className="mt-2.5 grid grid-cols-3 gap-1 rounded-xl bg-white/70 p-1 ring-1 ring-inset ring-ps-green/15"
      >
        {AUDIENCE_OPTIONS.map((optie) => {
          const isActief = optie.key === value;
          return (
            <button
              key={optie.key}
              type="button"
              role="radio"
              aria-checked={isActief}
              onClick={() => onChange(optie.key)}
              className={`min-h-9 rounded-lg px-1 text-[0.78rem] font-medium leading-tight transition-colors ${
                isActief
                  ? "bg-ps-green font-semibold text-white shadow-sm"
                  : "text-stone-600 hover:bg-white hover:text-stone-900"
              }`}
            >
              {optie.short}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[0.8125rem] leading-relaxed text-stone-600">
        {actief.toelichting}
      </p>

      {value !== "alle" ? (
        <p className="mt-2 text-[0.75rem] tabular-nums text-stone-500">
          {counts[value]} van {totaal} specifiek geschreven vanuit deze
          fysiologie — de rest geldt voor beide.
        </p>
      ) : null}

      {actief.link ? (
        <Link
          href={actief.link.href}
          className="mt-3 inline-block text-[0.8125rem] font-medium text-ps-green transition-colors hover:text-ps-green-hover"
        >
          {actief.link.label} →
        </Link>
      ) : null}
    </section>
  );
}
