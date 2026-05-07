import type { ReactNode } from "react";

import type { BlogEvidenceNiveau } from "@/types/blog";

const COPY: Record<BlogEvidenceNiveau, { label: string; hint: string }> = {
  sterk: { label: "Sterk bewijs", hint: "O.a. syntheses van RCT’s of consensusrichtlijnen" },
  redelijk: { label: "Redelijk bewijs", hint: "Gerichte trials of goed uitgevoerde cohorten" },
  beperkt: { label: "Beperkt bewijs", hint: "Incidentele trials, heterogene resultaten of vooral associatief" },
  vroeg: { label: "Vroeg onderzoek", hint: "Mechanistisch of kleinschalig — voorzichtige interpretatie" },
};

interface ArticleEvidenceNiveauProps {
  niveau: BlogEvidenceNiveau;
  /** Optionele korte toelichting i.p.v. standaard hint */
  korteToelichting?: ReactNode;
}

export default function ArticleEvidenceNiveau({ niveau, korteToelichting }: ArticleEvidenceNiveauProps) {
  const { label, hint } = COPY[niveau]
  return (
    <span
      className="inline-flex max-w-full flex-wrap items-start gap-x-2 gap-y-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-stone-500"
      role="note"
      title={`${hint}`}
    >
      <span className="rounded border border-stone-200/95 bg-white/95 px-2 py-0.5 text-stone-600">
        {label}
      </span>
      <span className="sr-only">{hint}</span>
      <span className="hidden font-normal normal-case tracking-normal text-stone-400 sm:inline" aria-hidden>
        ·{' '}
      </span>
      <span className="hidden max-w-[min(48ch,100%)] font-normal normal-case tracking-normal leading-snug text-stone-400 sm:inline">
        {korteToelichting ?? hint}
      </span>
    </span>
  )
}
