"use client";

import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";
import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import NutritionGapVoedingCheckLink from "@/components/content/NutritionGapVoedingCheckLink";
import { NUTRITION_GAP_ACCENT } from "@/data/voedingstekort";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";

const TRUST = [
  {
    n: "01",
    label: "Van jou",
    body: "Je krijgt jouw voedingsbeeld — welke stoffen krap zijn, en of een plantaardig patroon extra aandacht vraagt.",
  },
  {
    n: "02",
    label: "Laagdrempelig",
    body: "Eerst het bord. B12, jodium, vis of algen. Supplementen pas als laatste stap.",
  },
  {
    n: "03",
    label: "Het groeit mee",
    body: "In je dashboard zie je je voedingsbasis, de krappe stoffen en of de gaten dichtgaan.",
  },
];

const ctaStyle = {
  background: "var(--ac)",
  boxShadow:
    "0 10px 32px -8px color-mix(in srgb, var(--ac) 60%, transparent)",
} as CSSProperties;

export default function NutritionGapClosingCta() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
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
          Hoe ziet jóuw grafiek eruit?
        </p>
        <h2 className="mx-auto mt-3 max-w-xl font-serif text-[clamp(27px,4.4vw,46px)] font-normal leading-[1.06] text-[#F4F1E9]">
          Je zag het algemene beeld. Nu de versie die over jóu gaat.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-[#9FB0A6]">
          Doe de gratis Leefstijlcheck. Op basis van jouw antwoorden maken we
          zichtbaar waar voeding schuurt — inclusief of een plantaardig patroon
          extra stoffen vraagt. Stap voor stap, geen sprong in het diepe.
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
          <IntakeCtaLink
            locatie="voedingstekort_closing"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-9 py-3.5 text-[15px] font-bold text-[#102018] no-underline transition duration-200 hover:-translate-y-0.5 hover:opacity-95"
            style={ctaStyle}
          >
            Maak mijn persoonlijke voedingsbeeld →
          </IntakeCtaLink>
          <p className="mt-3 text-[13px] text-[#7E8C82]">
            Gratis Leefstijlcheck · ~2 minuten · daarna je eigen dashboard
          </p>
          <p className="mt-3">
            <NutritionGapVoedingCheckLink
              locatie="voedingstekort_closing"
              className="text-[13px] font-medium text-[#F1EFE8] underline decoration-white/30 underline-offset-[3px] transition hover:decoration-white/70"
            >
              of start met alleen de voedingscheck (1 min)
            </NutritionGapVoedingCheckLink>
          </p>
        </div>

        <MedicalDisclaimer theme="dark" className="mx-auto mt-12" />
      </Container>
    </section>
  );
}
