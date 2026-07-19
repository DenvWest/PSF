import type { CSSProperties } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";

const ACCENT = "oklch(0.69 0.095 50)";

const TRUST = [
  {
    n: "01",
    label: "Van jou",
    body: "Je krijgt jouw levenslijn en beweegscore — geen algemeen verhaal meer.",
  },
  {
    n: "02",
    label: "Laagdrempelig",
    body: "Je begint klein. Geen sportschool nodig, geen zwaar schema. Adviezen, geen diagnoses.",
  },
  {
    n: "03",
    label: "Het groeit mee",
    body: "In je dashboard zie je je Future You Score, je streak en je weekdoelen groeien.",
  },
];

export default function MovementClosingCta() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
      {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.22] blur-[110px]"
        style={{ background: "var(--ac)" }}
      />
      <Container className="relative py-14 text-center sm:py-16 lg:py-20">
        <p
          className="text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--ac)" }}
        >
          Hoe ziet jóuw levenslijn eruit?
        </p>
        <h2 className="mx-auto mt-3 max-w-xl font-serif text-[clamp(27px,4.4vw,46px)] font-normal leading-[1.06] text-[#F4F1E9]">
          Je zag het algemene beeld. Nu de versie die over jóu gaat.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-[#9FB0A6]">
          Doe de gratis Leefstijlcheck. Op basis van jouw antwoorden maken we
          je persoonlijke levenslijn, een beweegscore, en een route die past
          bij waar je nu staat — stap voor stap, geen sprong in het diepe.
        </p>

        <div className="mx-auto mt-9 grid max-w-3xl gap-3.5 text-left sm:grid-cols-3">
          {TRUST.map((item) => (
            <div
              key={item.n}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <span
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--ac)" }}
              >
                {item.n} · {item.label}
              </span>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#CDD7D0]">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/intake"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-9 py-3.5 text-[15px] font-bold text-[#102018] no-underline transition duration-200 hover:-translate-y-0.5 hover:opacity-95"
            style={{
              background: "var(--ac)",
              boxShadow:
                "0 10px 32px -8px color-mix(in srgb, var(--ac) 60%, transparent)",
            }}
          >
            Maak mijn persoonlijke levenslijn →
          </Link>
          <p className="mt-3 text-[13px] text-[#7E8C82]">
            Gratis Leefstijlcheck · ~2 minuten · daarna je eigen dashboard
          </p>
        </div>

        <MedicalDisclaimer theme="dark" className="mx-auto mt-12" />
      </Container>
    </section>
  );
}
