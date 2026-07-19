import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import { GuideOptInForm } from "@/components/gids/GuideOptInForm";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import SleepAnalysisFlow from "@/components/sleep/SleepAnalysisFlow";
import { slaapGuide } from "@/data/gids/slaap";
import { absoluteUrl } from "@/lib/public-site-url";

export const metadata: Metadata = {
  title: slaapGuide.seo.title,
  description: slaapGuide.seo.description,
  alternates: { canonical: absoluteUrl(slaapGuide.seo.canonical) },
  openGraph: {
    title: slaapGuide.seo.title,
    description: slaapGuide.seo.description,
  },
};

export default function SlaapGidsPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <article className="mx-auto max-w-2xl">
          <IntakeResultsReturnBanner />
          <header className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              {slaapGuide.heroLabel}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-stone-900 md:text-5xl">
              {slaapGuide.heroTitle}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              {slaapGuide.heroSubtitle}
            </p>
          </header>

          <SleepAnalysisFlow embedded />

          <section
            className="mt-16 rounded-2xl border border-stone-200 bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] p-6 md:p-8"
            aria-labelledby="pdf-optin-heading"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-ps-green">
              {slaapGuide.optIn.sectionLabel}
            </p>
            <h2
              id="pdf-optin-heading"
              className="mt-2 font-serif text-2xl text-stone-900 md:text-3xl"
            >
              Wil je ook de PDF?
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              {slaapGuide.optIn.subtitle} Stuur de volledige gids naar je inbox — handig om
              later terug te lezen.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-700">
              {slaapGuide.optIn.bulletPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="shrink-0 text-ps-green" aria-hidden>
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <GuideOptInForm
                themaSlug="slaap"
                ctaText={slaapGuide.optIn.ctaText}
                successMessage={slaapGuide.optIn.successMessage}
                pdfPath={slaapGuide.pdfPath}
              />
            </div>
          </section>

          <section className="mt-10 text-sm text-stone-600">
            <p>
              Wil je meer context en bronnen?{" "}
              <Link
                href={slaapGuide.pillarHref}
                className="font-semibold text-ps-green hover:underline"
              >
                Lees het complete slaapprotocol op de website →
              </Link>
            </p>
            <p className="mt-4">
              Wil je dieper meten?{" "}
              <Link href="/intake/slaap" className="font-semibold text-ps-green hover:underline">
                Doe de volledige slaap-check
              </Link>
              {" · "}
              <Link href="/intake" className="font-semibold text-ps-green hover:underline">
                Gratis Leefstijlcheck
              </Link>
            </p>
          </section>

          <MedicalDisclaimer />
        </article>
      </Container>
    </main>
  );
}
