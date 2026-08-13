import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import type { SleepCheckinReadoutDelta } from "@/lib/sleep-checkin-readout";

export type SleepCheckinReadoutProps = {
  headline: string;
  focusLabel: string | null;
  answerLabel: string | null;
  statement: string;
  delta: SleepCheckinReadoutDelta | null;
  implicationLine: string;
  voortgangHref: string;
  startLine: string | null;
  variant: "checkin" | "voortgang";
};

export default function SleepCheckinReadout({
  headline,
  focusLabel,
  answerLabel,
  statement,
  delta,
  implicationLine,
  voortgangHref,
  startLine,
  variant,
}: SleepCheckinReadoutProps) {
  const headingId = "sleep-readout-heading";

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-[16px] border border-[#C8956C]/30 bg-white/[0.045] px-5 py-5"
    >
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#C8956C]">
        Wat je slaapcheck zegt
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
          <p className="text-[13px] leading-relaxed text-[#F1EFE8]">{delta.line}</p>
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
        {variant === "checkin" ? (
          <Link
            href={voortgangHref}
            onClick={() =>
              trackEvent("sleep_readout_cta_voortgang", {
                surface: "intake_slaap",
                slot: "readout",
              })
            }
            className="flex min-h-[46px] items-center justify-center rounded-[10px] bg-[#C8956C] px-6 text-sm font-bold text-[#231409] no-underline transition-opacity hover:opacity-90"
          >
            Bekijk je slaapvoortgang →
          </Link>
        ) : (
          <Link
            href={voortgangHref}
            onClick={() =>
              trackEvent("sleep_readout_cta_voortgang", {
                surface: "voortgang_slaap",
                slot: "readout",
              })
            }
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9CC5A9] no-underline hover:underline"
          >
            Naar je slaapplan ›
          </Link>
        )}
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#7E8C82]">
          Je prioriteitenladder laat zien waar je nu de meeste winst pakt — niet wat je “moet” halen.
        </p>
      </div>
    </article>
  );
}
