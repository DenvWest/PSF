"use client";

import Link from "next/link";
import { INTAKE_PRIVACY_DISCLOSURE } from "@/data/intake-privacy-disclosure";
import { METHODOLOGY_CTA } from "@/data/methodology";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

export default function MethodologyIntakeCta() {
  return (
    <section className="my-16" aria-label="Leefstijlcheck">
      <div className="rounded-[26px] border border-white/[0.07] bg-[#0E1A14] px-8 py-10 text-center text-[#F7F5F0] shadow-[0_30px_60px_-30px_rgba(14,26,20,0.6)] lg:px-12 lg:py-14">
        <h2 className="font-serif text-2xl leading-tight md:text-3xl">
          {METHODOLOGY_CTA.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#F7F5F0]/75">
          {METHODOLOGY_CTA.lead}
        </p>
        <div className="mt-6">
          <Link
            href={METHODOLOGY_CTA.href}
            onClick={() =>
              trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
                location: "methodologie",
                target: "/intake",
              })
            }
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#F7F5F0] px-8 py-3.5 text-sm font-semibold text-[#0E1A14] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(14,26,20,0.5)]"
          >
            {METHODOLOGY_CTA.buttonLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <details className="mx-auto mt-4 max-w-md text-left text-xs text-[#F7F5F0]/45">
          <summary className="cursor-pointer list-none text-center text-[#F7F5F0]/55 [&::-webkit-details-marker]:hidden">
            {METHODOLOGY_CTA.privacySummary}
          </summary>
          <ul className="mt-3 space-y-2 text-center">
            {INTAKE_PRIVACY_DISCLOSURE.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
            <li>
              Meer in onze{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-[#F7F5F0]/70"
              >
                {INTAKE_PRIVACY_DISCLOSURE.privacyLinkLabel}
              </Link>
              .
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
