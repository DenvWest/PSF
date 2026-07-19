import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import MovementLifeline from "@/components/content/MovementLifeline";
import MovementRecognition from "@/components/content/MovementRecognition";
import MovementMechanism from "@/components/content/MovementMechanism";
import MovementVersus from "@/components/content/MovementVersus";
import MovementMoments from "@/components/content/MovementMoments";
import MovementFuture from "@/components/content/MovementFuture";
import MovementDashboardPreview from "@/components/content/MovementDashboardPreview";
import MovementClosingCta from "@/components/content/MovementClosingCta";
import { buildArticleSchema } from "@/lib/seo/structuredData";

const ACCENT = "oklch(0.69 0.095 50)";

export const metadata: Metadata = {
  title: "Beweging Na 40: Kracht, Ritme en Herstel | PerfectSupplement",
  description:
    "Krachttraining, cardio en herstel na 40 — zonder sportschool-hype. Praktische stappen vóór supplementen, met links naar blogs en kennisbank.",
  ...canonicalMetadata("/beweging-na-40"),
  openGraph: {
    title: "Beweging Na 40 — eerst belasting en rust, dan pas supplementen",
    description:
      "Herkenning, trainingsritme en wanneer creatine of eiwit zinvol zijn — voor mannen 40+.",
    url: "/beweging-na-40",
    type: "article",
  },
};

const articleSchema = buildArticleSchema({
  headline: "Beweging Na 40: Kracht, Ritme en Herstel",
  description:
    "Krachttraining, cardio en herstel na 40 — praktische stappen vóór supplementen.",
  path: "/beweging-na-40",
  datePublished: "2026-06-04",
});

export default function BewegingNa40Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main>
        <section
          className="relative overflow-hidden border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
          style={{ "--ac": ACCENT } as CSSProperties}
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
                Beweging Na 40: Kracht, Ritme en Herstel
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#9FB0A6] md:text-[19px]">
                Ken je dit: je traint nog “genoeg”, maar herstel duurt langer,
                spieren voelen trager terug en je bent vaker stijf? Na 40
                verandert hoe snel je belastbaar bent — niet omdat bewegen
                niet meer werkt, maar omdat ritme en rust zwaarder meetellen.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-8 py-3 text-sm font-bold text-[#102018] no-underline transition hover:opacity-90"
                  style={{ background: "var(--ac)" }}
                >
                  Doe de gratis Leefstijlcheck →
                </Link>
                <p className="mt-3 text-sm text-[#9FB0A6]">
                  Of{" "}
                  <Link
                    href="/intake/beweging"
                    className="font-medium text-[#F1EFE8] underline decoration-white/30 underline-offset-[3px] transition hover:decoration-white/70"
                  >
                    start met alleen de beweegcheck (1 min)
                  </Link>
                </p>
                <IntakeCtaMicro className="mt-4 max-w-lg text-sm text-[#7E8C82]" />
              </div>
            </div>
          </Container>
        </section>

        <MovementRecognition />
        <MovementLifeline />
        <MovementMechanism />
        <MovementVersus />
        <MovementMoments />
        <MovementFuture />
        <MovementDashboardPreview />
        <MovementClosingCta />
      </main>
    </>
  );
}
