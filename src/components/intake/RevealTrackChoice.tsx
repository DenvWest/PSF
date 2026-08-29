"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { REVEAL_TRACK_COPY, type RevealTrackKey } from "@/lib/results-reveal-copy";

type RevealTrackChoiceProps = {
  supplementHref: string;
  supplementLabel: string | null;
  sessionId: string | null;
};

const DASHBOARD_HREF = "/account/login?from=intake";

export default function RevealTrackChoice({
  supplementHref,
  supplementLabel,
  sessionId,
}: RevealTrackChoiceProps) {
  function handleChoice(track: RevealTrackKey, href: string) {
    trackEvent(
      track === "dashboard" ? GA4_EVENTS.INTAKE_CTA_CLICKED : "intake_supplement_track_clicked",
      { spoor: track },
    );
    clarityTag("intake_track", track);
    emitIntakeClientEvent("intake.track_chosen", {
      track,
      href,
      session_id: sessionId,
    });
  }

  return (
    <section
      id="reveal-step-save"
      aria-label={REVEAL_TRACK_COPY.title}
      className="grid scroll-mt-6 gap-4"
    >
      <header className="grid gap-1.5">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
          {REVEAL_TRACK_COPY.eyebrow}
        </p>
        <h2 className="m-0 text-[22px] leading-tight text-[#F1EFE8] sm:text-[26px]" style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}>
          {REVEAL_TRACK_COPY.title}
        </h2>
        <p className="m-0 text-[13.5px] leading-relaxed text-[#9FAFA4]">
          {REVEAL_TRACK_COPY.lead}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {REVEAL_TRACK_COPY.tracks.map((track) => {
          const isSupplement = track.key === "supplement";
          const href = isSupplement ? supplementHref : DASHBOARD_HREF;
          const body =
            isSupplement && supplementLabel
              ? `${supplementLabel} past bij je laagste domein. ${track.body}`
              : track.body;

          return (
            <article
              key={track.key}
              className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-white/12 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FAFA4]">
                {track.badge}
              </span>
              <h3 className="m-0 text-[20px] leading-tight text-[#F1EFE8]" style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}>
                {track.title}
              </h3>
              <p className="m-0 text-[13.5px] leading-relaxed text-[#9FAFA4]">{body}</p>

              <ul className="m-0 grid list-none gap-1.5 p-0">
                {track.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-[13px] text-[#C6D1C9]">
                    <span className="mt-1 shrink-0 text-[#5A8F6A]" aria-hidden>
                      <Icons.Check s={13} />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                onClick={() => handleChoice(track.key, href)}
                className={`mt-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-bold transition ${
                  isSupplement
                    ? "border border-white/20 bg-transparent text-[#F1EFE8] hover:bg-white/[0.07]"
                    : "border-0 bg-[#5A8F6A] text-[#0f1c10] hover:opacity-90"
                }`}
              >
                {track.cta}
                <Icons.ArrowRight s={15} />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
