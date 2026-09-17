import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import NutritionGapRecognition from "@/components/content/NutritionGapRecognition";
import NutritionGapLifeline from "@/components/content/NutritionGapLifeline";
import NutritionGapChart from "@/components/content/NutritionGapChart";
import NutritionGapMechanism from "@/components/content/NutritionGapMechanism";
import NutritionGapVersus from "@/components/content/NutritionGapVersus";
import NutritionGapMoments from "@/components/content/NutritionGapMoments";
import NutritionGapFuture from "@/components/content/NutritionGapFuture";
import NutritionGapDashboardPreview from "@/components/content/NutritionGapDashboardPreview";
import NutritionGapClosingCta from "@/components/content/NutritionGapClosingCta";
import NutritionGapVoedingCheckLink from "@/components/content/NutritionGapVoedingCheckLink";
import { NUTRITION_GAP_ACCENT } from "@/data/voedingstekort";
import { buildArticleSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Voedingstekort: micronutriënten, veganisten en chronisch tekort",
  description:
    "Wat een chronisch tekort aan B12, jodium, omega-3 en vitamine D met je lijf doet — vooral bij plantaardig eten. Met micronutriëntengrafiek en levenslijn, zonder diagnoses.",
  ...canonicalMetadata("/voedingstekort"),
  openGraph: {
    title: "Voedingstekort — de gaten die je bord niet vanzelf vult",
    description:
      "Micronutriëntengrafiek, levenslijn en wat chronisch tekort doet. Vooral relevant als je plantaardig eet.",
    url: "/voedingstekort",
    type: "article",
  },
};

const articleSchema = buildArticleSchema({
  headline: "Voedingstekort: micronutriënten, veganisten en chronisch tekort",
  description:
    "Wat een chronisch tekort aan B12, jodium, omega-3 en vitamine D met je lijf doet — vooral bij plantaardig eten.",
  path: "/voedingstekort",
  datePublished: "2026-09-17",
});

export default function VoedingstekortPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main>
        <section
          className="relative overflow-hidden border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
          style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(760px 460px at 62% 28%, #000, transparent 76%)",
              WebkitMaskImage:
                "radial-gradient(760px 460px at 62% 28%, #000, transparent 76%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[440px] w-[440px] rounded-full opacity-[0.28] blur-[100px]"
            style={{ background: "var(--ac)" }}
          />
          <Container className="relative py-16 md:py-24">
            <div className="max-w-3xl">
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--ac)" }}
              >
                Leefstijl eerst
              </p>
              <h1 className="mt-4 font-serif text-[clamp(36px,6vw,64px)] font-normal leading-[1.04] text-[#F4F1E9]">
                Voedingstekort: de stoffen die je bord niet vanzelf vult
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#9FB0A6] md:text-[19px]">
                Ken je dit: je eet “gezond genoeg”, groenten te over, en tóch
                zakt je energie weg? Vooral plantaardig eten kan vol ogen en
                toch leeg zijn op B12, jodium, omega-3 en vitamine D. Een
                chronisch tekort voel je laat — daarom begint deze gids bij de
                grafiek, niet bij een potje.
              </p>
              <div className="mt-8">
                <IntakeCtaLink
                  locatie="voedingstekort_hero"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-8 py-3 text-sm font-bold text-[#102018] no-underline transition hover:opacity-90"
                  style={{ background: "var(--ac)" }}
                >
                  Doe de gratis Leefstijlcheck →
                </IntakeCtaLink>
                <p className="mt-3 text-sm text-[#9FB0A6]">
                  Of{" "}
                  <NutritionGapVoedingCheckLink
                    locatie="voedingstekort_hero"
                    className="font-medium text-[#F1EFE8] underline decoration-white/30 underline-offset-[3px] transition hover:decoration-white/70"
                  >
                    start met alleen de voedingscheck (1 min)
                  </NutritionGapVoedingCheckLink>
                </p>
                <IntakeCtaMicro className="mt-4 max-w-lg text-sm text-[#7E8C82]" />
              </div>
            </div>
          </Container>
        </section>

        <NutritionGapRecognition />
        <NutritionGapLifeline />
        <NutritionGapChart />
        <NutritionGapMechanism />
        <NutritionGapVersus />
        <NutritionGapMoments />
        <NutritionGapFuture />
        <NutritionGapDashboardPreview />
        <NutritionGapClosingCta />
      </main>
    </>
  );
}
