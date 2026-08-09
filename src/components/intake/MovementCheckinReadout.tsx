import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

export type MovementCheckinReadoutDelta = {
  label: string;
  line: string;
  alsoLine: string | null;
  winLine: string | null;
  followLine: string | null;
};

export type MovementCheckinReadoutProps = {
  headline: string;
  focusLabel: string | null;
  answerLabel: string | null;
  statement: string;
  delta: MovementCheckinReadoutDelta | null;
  implicationLine: string;
  programPreview: string | null;
  routingHref: string;
  routingHint: string;
  /**
   * "Sinds je start" — voetnootgewicht in het delta-blok, nooit een eigen kaart:
   * de vergelijking met de vórige meting is de primaire (L8).
   */
  startLine: string | null;
  /** Zelfde blok, ander gewicht: terra-knop op de check-in, stille link op Voortgang (§H3). */
  variant: "checkin" | "voortgang";
};

/**
 * Het gedeelde readout-blok — feit, delta, implicatie, routing — identiek
 * gerenderd op het beweegcheck-resultaat en op Voortgang › Beweging (L7 SSOT).
 * Alleen de omringende chrome verschilt per aanroeper.
 */
export default function MovementCheckinReadout({
  headline,
  focusLabel,
  answerLabel,
  statement,
  delta,
  implicationLine,
  programPreview,
  routingHref,
  routingHint,
  startLine,
  variant,
}: MovementCheckinReadoutProps) {
  const headingId = "movement-readout-heading";

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-[16px] border border-[#C8956C]/30 bg-white/[0.045] px-5 py-5"
    >
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#C8956C]">
        Wat je beweegcheck zegt
      </p>
      <h2 id={headingId} className="font-serif text-xl font-normal leading-[1.3] text-[#F1EFE8]">
        {headline}
      </h2>

      {focusLabel && answerLabel ? (
        <p className="mt-3 inline-flex items-baseline gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11.5px] text-[#CDD7D0]">
          <span className="font-semibold text-[#F1EFE8]">{focusLabel}</span>
          <span aria-hidden="true" className="text-[#7E8C82]">
            ·
          </span>
          <span>{answerLabel}</span>
        </p>
      ) : null}

      <p className="mt-3 text-[13.5px] leading-relaxed text-[#CDD7D0]">{statement}</p>

      {delta ? (
        <div className="mt-4 rounded-[14px] border border-white/[0.06] bg-black/20 px-4 py-3.5">
          <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            {delta.label}
          </p>
          {delta.winLine ? (
            <p className="mb-2 text-[13px] font-semibold leading-relaxed text-[#9CC5A9]">
              {delta.winLine}
            </p>
          ) : null}
          <p className="text-[13px] leading-relaxed text-[#F1EFE8]">{delta.line}</p>
          {delta.followLine ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#CDD7D0]">{delta.followLine}</p>
          ) : null}
          {delta.alsoLine ? (
            <p className="mt-2 text-[12px] leading-relaxed text-[#9FB0A6]">{delta.alsoLine}</p>
          ) : null}
          {startLine ? (
            <p className="mt-2.5 border-t border-dashed border-white/[0.08] pt-2 text-[11.5px] leading-relaxed text-[#7E8C82]">
              {startLine}
            </p>
          ) : null}
        </div>
      ) : startLine ? (
        <p className="mt-4 text-[11.5px] leading-relaxed text-[#7E8C82]">{startLine}</p>
      ) : null}

      <p className="mt-4 text-[13.5px] leading-relaxed text-[#F1EFE8]">{implicationLine}</p>

      <div className="mt-4 border-t border-white/[0.06] pt-3.5">
        {programPreview ? (
          <p className="mb-3 flex items-baseline gap-1.5 text-[12px] text-[#9FB0A6]">
            <span>Je programma</span>
            <strong className="font-semibold text-[#CDD7D0]">{programPreview}</strong>
          </p>
        ) : null}

        {variant === "checkin" ? (
          <Link
            href={routingHref}
            onClick={() =>
              trackEvent("movement_checkin_routing_click", {
                target: "beweging_programma",
                surface: "intake_beweging",
                slot: "readout",
              })
            }
            className="flex min-h-[46px] items-center justify-center rounded-[10px] bg-[#C8956C] px-6 text-sm font-bold text-[#231409] no-underline transition-opacity hover:opacity-90"
          >
            Naar je beweegplan →
          </Link>
        ) : (
          <Link
            href={routingHref}
            onClick={() =>
              trackEvent("movement_checkin_routing_click", {
                target: "beweging_programma",
                surface: "voortgang_beweging",
                slot: "readout",
              })
            }
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9CC5A9] no-underline hover:underline"
          >
            Naar je beweegplan ›
          </Link>
        )}
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#7E8C82]">{routingHint}</p>
      </div>
    </article>
  );
}
