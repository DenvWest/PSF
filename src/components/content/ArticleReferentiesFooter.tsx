import type { ReactNode } from "react";
import type { ReferentieItem } from "@/types/referenties";
import {
  MEDISCHE_DISCLAIMER_LANG_NL,
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
  formatDatumNederlandsISO,
} from "@/lib/redactie-standaarden";

interface ArticleReferentiesFooterProps {
  referenties: ReferentieItem[];
  laatstBijgewerktOp?: string;
  verantwoordelijke?: string;
  wetenschappelijkGecontroleerdOp?: string;
  aanvullendeDisclaimers?: ReactNode[];
}

function SectionRule() {
  return <div className="my-10 h-px bg-stone-200/80" role="presentation" aria-hidden="true" />;
}

export default function ArticleReferentiesFooter({
  referenties,
  laatstBijgewerktOp = STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
  verantwoordelijke = REDACTIE_VERANTWOORDELIJKE_STANDARD,
  wetenschappelijkGecontroleerdOp,
  aanvullendeDisclaimers = [],
}: ArticleReferentiesFooterProps) {
  const reviewIso = wetenschappelijkGecontroleerdOp ?? laatstBijgewerktOp;

  return (
    <footer
      className="scroll-mt-[var(--reading-scroll-margin)] rounded-lg border border-stone-200/90 bg-white px-5 py-9 sm:px-8 sm:py-10 md:px-9 md:py-11"
      aria-label="Bronnen, disclaimer en redactiemeta"
    >
      <section aria-labelledby="vancouver-heading" className="scroll-mt-2">
        <h2
          id="vancouver-heading"
          className="font-display text-lg font-semibold leading-snug tracking-tight text-stone-900 md:text-xl"
        >
          Referenties
        </h2>
        <ol className="mt-9 list-none space-y-6 md:space-y-7">
          {referenties.map((ref, index) => (
            <li
              key={index}
              className="scroll-mt-2 border-b border-stone-100/95 pb-6 last:border-b-0 last:pb-0 md:pb-7"
            >
              <div className="text-[0.9375rem] leading-[1.68] text-stone-600 sm:text-[0.96875rem] sm:leading-[1.72]">
                <span className="font-semibold tabular-nums text-stone-800">{index + 1}. </span>
                <span className="break-words [overflow-wrap:anywhere]">{ref.vancouver}</span>
              </div>
              <p className="mt-2 pl-0 text-[0.78rem] leading-[1.55] text-stone-500 md:pl-1 md:text-[0.8125rem] md:leading-[1.58]">
                <span className="font-medium text-stone-600">Documenttype / bewijskader:</span> {ref.bewijsType}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <SectionRule />

      <section aria-labelledby="disclaimer-sectie" className="space-y-3">
        <h2 id="disclaimer-sectie" className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.085em] text-stone-500">
          Disclaimer
        </h2>
        {aanvullendeDisclaimers.map((blok, index) => (
          <div
            key={index}
            className="rounded-md border border-stone-200/80 bg-stone-50/70 px-4 py-3 text-[0.8125rem] leading-[1.62] text-stone-600 md:px-[1.0625rem]"
          >
            {blok}
          </div>
        ))}
        <div className="rounded-md border border-amber-100/90 bg-[color-mix(in_srgb,var(--ps-amber-light)_18%,white)] px-4 py-[0.9375rem] text-[0.8125rem] leading-[1.62] text-stone-700 md:px-[1.0625rem]">
          <p>
            <strong className="font-semibold text-stone-900">Medische disclaimer:</strong>{" "}
            <span>{MEDISCHE_DISCLAIMER_LANG_NL}</span>
          </p>
        </div>
      </section>

      <SectionRule />

      <div
        className="grid gap-y-4 text-[0.8125rem] leading-[1.62] text-stone-600 md:gap-y-5"
        role="group"
        aria-label="Redactiecontrole en herzieningen"
      >
        <p>
          <strong className="font-semibold text-stone-800">Wetenschappelijk door de redactie gecontroleerd op:</strong>{" "}
          <time dateTime={reviewIso} className="text-stone-600 tabular-nums">
            {formatDatumNederlandsISO(reviewIso)}
          </time>
        </p>
        <p>
          <strong className="font-semibold text-stone-800">Laatst inhoudelijk herzien op:</strong>{" "}
          <time dateTime={laatstBijgewerktOp} className="text-stone-600 tabular-nums">
            {formatDatumNederlandsISO(laatstBijgewerktOp)}
          </time>
        </p>
        <p>
          <strong className="font-semibold text-stone-800">Eindredactie / inhoudelijke verantwoordelijke:</strong>{" "}
          <span>{verantwoordelijke}</span>
        </p>
      </div>
    </footer>
  );
}
