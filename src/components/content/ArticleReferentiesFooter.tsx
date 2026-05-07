import type { ReactNode } from "react";
import type { ReferentieItem } from "@/types/referenties";
import {
  MEDISCHE_DISCLAIMER_LANG_NL,
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
  formatDatumNederlandsISO,
} from "@/lib/redactie-standaarden";

interface ArticleReferentiesFooterProps {
  referenties: ReferentieItem[]
  /** ISO 8601 (yyyy-mm-dd) */
  laatstBijgewerktOp?: string
  verantwoordelijke?: string
  /** Optionele blokken boven het standaard medische blok (bv. botspecifieke EU‑claim‑toelichting). */
  aanvullendeDisclaimers?: ReactNode[]
}

export default function ArticleReferentiesFooter({
  referenties,
  laatstBijgewerktOp = STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
  verantwoordelijke = REDACTIE_VERANTWOORDELIJKE_STANDARD,
  aanvullendeDisclaimers = [],
}: ArticleReferentiesFooterProps) {
  return (
    <footer
      className="scroll-mt-8 rounded-xl border border-stone-200/90 bg-white px-5 py-6 sm:px-7"
      aria-label="Bronnen documentatie en disclaimer"
    >
      <section aria-labelledby="vancouver-heading">
        <h2
          id="vancouver-heading"
          className="font-display text-lg font-semibold leading-snug tracking-tight text-stone-900"
        >
          Referenties (Vancouver-stijl)
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          Nummering volgens de Vancouver‑conventie waar mogelijk. Bij rapporten zonder tijdschriftpaginanummers zijn
          titel en organisatie vermeld. Het bijschrift bij elke bron geeft het <strong>schriftelijke type werk</strong>
          aan (hoe sterk causale gevolgtrekkingen in zulke syntheses típisch kunnen zijn); het is géén garantie voor
          klinisch effect bij individuen. Correlatie betekent geen causaaliteit — RCT’s en reviews spreken gemiddeld
          over populaties, niet over uw persoonlijke situatie.
        </p>
        <ol className="mt-4 list-none space-y-4 pl-0 text-[0.9375rem] leading-relaxed text-stone-600">
          {referenties.map((ref, index) => (
            <li key={index} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
              <span className="font-semibold tabular-nums text-stone-800">{index + 1}. </span>
              <span>{ref.vancouver}</span>
              <div className="mt-1.5 text-[0.8125rem] text-stone-500">
                <span className="font-medium text-stone-600">Type bron:</span> {ref.bewijsType}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-[0.8125rem] leading-relaxed text-stone-600">
        <p>
          <strong className="text-stone-800">Laatst bijgewerkt op:</strong>{' '}
          {formatDatumNederlandsISO(laatstBijgewerktOp)}
        </p>
        <p>
          <strong className="text-stone-800">Eindredactie / inhoudelijke verantwoordelijke:</strong> {verantwoordelijke}
        </p>

        {aanvullendeDisclaimers.map((blok, index) => (
          <p key={index} className="rounded-lg bg-stone-50 px-3 py-2 text-stone-600">
            {blok}
          </p>
        ))}

        <p className="rounded-lg bg-amber-50/80 px-3 py-2 text-stone-700 ring-1 ring-amber-200/70">
          <strong className="text-stone-900">Medische disclaimer:</strong> {MEDISCHE_DISCLAIMER_LANG_NL}
        </p>
      </div>
    </footer>
  )
}
