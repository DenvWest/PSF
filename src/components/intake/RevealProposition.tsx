"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import { REVEAL_PROPOSITION_COPY } from "@/lib/results-reveal-copy";

export default function RevealProposition() {
  return (
    <section
      aria-label={REVEAL_PROPOSITION_COPY.title}
      className="grid gap-4 rounded-3xl border border-white/12 bg-white/[0.035] p-5 sm:p-6"
    >
      <header className="grid gap-1.5">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
          {REVEAL_PROPOSITION_COPY.eyebrow}
        </p>
        <h2
          className="m-0 text-[20px] leading-tight text-[#F1EFE8] sm:text-[24px]"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
        >
          {REVEAL_PROPOSITION_COPY.title}
        </h2>
        <p
          className="m-0 max-w-[66ch] text-[13.5px] leading-relaxed text-[#9FAFA4]"
          style={{ textWrap: "pretty" }}
        >
          {REVEAL_PROPOSITION_COPY.body}
        </p>
      </header>

      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
        {REVEAL_PROPOSITION_COPY.points.map((point) => (
          <li key={point.title} className="grid gap-1 border-t border-white/10 pt-3">
            <span className="text-[13.5px] font-semibold text-[#F1EFE8]">{point.title}</span>
            <span className="text-[12.5px] leading-relaxed text-[#7E8C82]">{point.body}</span>
          </li>
        ))}
      </ul>

      <Link
        href={REVEAL_PROPOSITION_COPY.disclosureHref}
        onClick={() => trackEvent("intake_disclosure_clicked")}
        className="justify-self-start text-[12px] text-[#7E8C82] underline underline-offset-2 hover:text-[#C6D1C9]"
      >
        {REVEAL_PROPOSITION_COPY.disclosureLabel} →
      </Link>
    </section>
  );
}
