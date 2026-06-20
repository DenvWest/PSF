import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import { GuideOptInForm } from "@/components/gids/GuideOptInForm";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { GUIDE_SLUGS, getGuideData } from "@/data/gids";
import { absoluteUrl } from "@/lib/public-site-url";
import type { GuideThema } from "@/types/guide-opt-in";

const GUIDE_MICRO_CHECK: Partial<
  Record<GuideThema, { href: string; label: string }>
> = {
  voeding: {
    href: "/intake/voeding",
    label: "Doe de snelle voedingscheck (1 min)",
  },
  beweging: {
    href: "/intake/beweging",
    label: "Doe de beweegcheck (1 min)",
  },
};

interface Props {
  params: Promise<{ thema: string }>;
}

export function generateStaticParams() {
  return GUIDE_SLUGS.map((thema) => ({ thema }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { thema: slug } = await params;
  const data = getGuideData(slug);
  if (!data) return {};

  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: absoluteUrl(data.seo.canonical) },
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
    },
  };
}

export default async function GidsOptInPage({ params }: Props) {
  const { thema: slug } = await params;
  const data = getGuideData(slug);
  if (!data) notFound();

  const themaSlug = data.slug as GuideThema;
  const microCheck = GUIDE_MICRO_CHECK[themaSlug];

  return (
    <main className="py-12 md:py-16">
      <Container>
        <article className="max-w-2xl mx-auto">
          <IntakeResultsReturnBanner />
          <header>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              {data.heroLabel}
            </p>
            <h1 className="mt-4 font-serif text-4xl md:text-5xl text-stone-900">
              {data.heroTitle}
            </h1>
            <p className="mt-4 text-lg text-stone-600 leading-relaxed">
              {data.heroSubtitle}
            </p>
          </header>

          <section className="mt-12" aria-labelledby="herkenning-heading">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              {data.recognition.sectionLabel}
            </p>
            <h2
              id="herkenning-heading"
              className="mt-2 font-serif text-2xl text-stone-900"
            >
              {data.recognition.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {data.recognition.quotes.map((quote) => (
                <li
                  key={quote}
                  className="rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-stone-700 text-sm leading-relaxed"
                >
                  &ldquo;{quote}&rdquo;
                </li>
              ))}
            </ul>
          </section>

          <section
            className="mt-14 rounded-2xl border border-stone-200 bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] p-6 md:p-8"
            aria-labelledby="optin-heading"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-ps-green">
              {data.optIn.sectionLabel}
            </p>
            <h2
              id="optin-heading"
              className="mt-2 font-serif text-2xl md:text-3xl text-stone-900"
            >
              {data.optIn.title}
            </h2>
            <p className="mt-3 text-stone-600 leading-relaxed">
              {data.optIn.subtitle}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-700">
              {data.optIn.bulletPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-ps-green shrink-0" aria-hidden>
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <GuideOptInForm
                themaSlug={themaSlug}
                ctaText={data.optIn.ctaText}
                successMessage={data.optIn.successMessage}
                webPlanHref={data.pdfPath ? null : data.pillarHref}
              />
            </div>
          </section>

          <section className="mt-10 text-sm text-stone-600">
            <p>
              Wil je meer context en bronnen?{" "}
              <Link
                href={data.pillarHref}
                className="font-semibold text-ps-green hover:underline"
              >
                Lees de complete gids op de website →
              </Link>
            </p>
            {microCheck ? (
              <p className="mt-4">
                Of{" "}
                <Link href={microCheck.href} className="font-semibold text-ps-green hover:underline">
                  {microCheck.label}
                </Link>
                .
              </p>
            ) : null}
            <p className="mt-4">
              Wil je het hele plaatje?{" "}
              <Link href="/intake" className="font-semibold text-ps-green hover:underline">
                Doe de gratis Leefstijlcheck
              </Link>{" "}
              voor een persoonlijk leefstijloverzicht op basis van jouw antwoorden.
            </p>
          </section>

          <MedicalDisclaimer />
        </article>
      </Container>
    </main>
  );
}
