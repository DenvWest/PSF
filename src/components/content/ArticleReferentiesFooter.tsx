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
  /** ISO 8601 (yyyy-mm-dd) */
  laatstBijgewerktOp?: string;
  verantwoordelijke?: string;
  /** Standaard gelijk aan `laatstBijgewerktOp`; apart te zetten als redactionele controle elders valt. */
  wetenschappelijkGecontroleerdOp?: string;
  /** Optionele blokken binnen het disclaimgedeelte vóór het standaard medische blok. */
  aanvullendeDisclaimers?: ReactNode[];
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
      className="scroll-mt-[var(--reading-scroll-margin)] rounded-xl border border-stone-200/90 bg-white px-5 py-8 shadow-[inset_0_1px_0_0_rgb(231_229_228_/_0.45)] sm:px-8"
      aria-label="Referenties bronnenlijst juridische kaders en redactiemeta"
    >
      <section aria-labelledby="vancouver-heading">
        <h2
          id="vancouver-heading"
          className="font-display text-xl font-semibold leading-snug tracking-tight text-stone-900"
        >
          Referenties{" "}
          <span className="font-normal text-stone-500">(Vancouver-stijl)</span>
        </h2>
        <p className="mt-3 max-w-[70ch] text-[0.8125rem] leading-relaxed text-stone-500">
          Nummering volgens Vancouver waar mogelijk. Het veld bij elke bron geeft het{" "}
          <strong className="font-medium text-stone-600">type werk</strong> weer (welke gevolgtrekkingen daaruit
          redelijkerwijs mogelijk zijn; geen klinisch effect per individu). Observatie in onderzoek is geen
          persoonlijke causaliteit — bij twijfel met uw zorgprofessional.
        </p>
        <ol className="mt-8 list-none space-y-6 border-t border-stone-100/90 pt-7 pl-0 text-[0.9375rem] leading-[1.7] text-stone-600 sm:text-[1rem] sm:leading-[1.75]">
          {referenties.map((ref, index) => (
            <li key={index} className="max-w-none">
              <span className="font-semibold tabular-nums text-stone-800">{index + 1}. </span>
              <span className="break-words">{ref.vancouver}</span>
              <div className="mt-2 border-l border-stone-200 pl-3 text-[0.8125rem] leading-relaxed text-stone-500">
                <span className="font-medium text-stone-600">Documenttype / bewijskader:</span> {ref.bewijsType}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="disclaimer-sectie" className="mt-10 space-y-3 border-t border-stone-200 pt-10">
        <h2 id="disclaimer-sectie" className="sr-only">
          Disclaimer
        </h2>
        {aanvullendeDisclaimers.map((blok, index) => (
          <div
            key={index}
            className="rounded-lg border border-stone-100/95 bg-stone-50/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-stone-600"
          >
            {blok}
          </div>
        ))}
        <p className="rounded-lg bg-amber-50/65 px-4 py-3 text-[0.8125rem] leading-relaxed text-stone-700 ring-1 ring-amber-200/60">
          <strong className="font-semibold text-stone-900">Medische disclaimer:</strong>{" "}
          <span>{MEDISCHE_DISCLAIMER_LANG_NL}</span>
        </p>
      </section>

      <div className="mt-10 grid gap-y-4 border-t border-stone-200 pt-10 text-[0.8125rem] leading-relaxed text-stone-600 sm:gap-y-[1.125rem]">
        <p>
          <strong className="font-semibold text-stone-800">Wetenschappelijk door de redactie gecontroleerd op:</strong>{" "}
          {formatDatumNederlandsISO(reviewIso)}
        </p>
        <p>
          <strong className="font-semibold text-stone-800">Laatst inhoudelijk herzien op:</strong>{" "}
          {formatDatumNederlandsISO(laatstBijgewerktOp)}
        </p>
        <p>
          <strong className="font-semibold text-stone-800">Eindredactie / inhoudelijke verantwoordelijke:</strong>{" "}
          {verantwoordelijke}
        </p>
      </div>
    </footer>
  );
}
