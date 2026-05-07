import type { ReactNode } from "react";

import type { BlogEvidenceNiveau } from "@/types/blog";

const COPY: Record<BlogEvidenceNiveau, { label: string; hint: string }> = {
  sterk: {
    label: "Sterk bewijs",
    hint: "O.a. systematische syntheses van gerichte trials / erkende dossiers waar toepasselijk.",
  },
  redelijk: {
    label: "Redelijk bewijs",
    hint: "Gerichte trials of gedegen observationeel werk; gevolgtrekking nog persoonsafhankelijk.",
  },
  beperkt: {
    label: "Beperkt bewijs",
    hint: "Beperkt aantal studies, heterogene uitkomsten of vooral associatief — voorzichtig interpreteren.",
  },
  vroeg: {
    label: "Vroeg onderzoek",
    hint: "Mechanistisch / kleinschalig / narratief in ontwikkeling — signalen geen beleid voor één individu.",
  },
};

interface ArticleEvidenceNiveauProps {
  niveau: BlogEvidenceNiveau;
  korteToelichting?: ReactNode;
}

export default function ArticleEvidenceNiveau({ niveau, korteToelichting }: ArticleEvidenceNiveauProps) {
  const { label, hint } = COPY[niveau]
  const beschrijving = korteToelichting ?? hint

  return (
    <div
      className="leading-snug text-[0.75rem] text-stone-500 md:text-[0.8125rem]"
      role="note"
      title={typeof beschrijving === "string" ? beschrijving : hint}
    >
      <span className="sr-only">{hint}</span>
      <span className="inline text-stone-600">{label}</span>
      <span className="mx-2 text-stone-300 opacity-95" aria-hidden>
        /
      </span>
      <span className="font-normal text-[0.7rem] text-stone-500 md:text-[0.75rem]">{beschrijving}</span>
    </div>
  )
}
