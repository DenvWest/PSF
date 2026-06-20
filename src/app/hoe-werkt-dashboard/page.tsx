import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import DashboardPreviewMockup from "@/components/dashboard/DashboardPreviewMockup";
import DashboardRouteSection from "@/components/dashboard/DashboardRouteSection";
import {
  DASHBOARD_ROUTE_CTA,
  DASHBOARD_ROUTE_FAQ,
  DASHBOARD_ROUTE_FEATURES,
  DASHBOARD_ROUTE_HERO,
  DASHBOARD_ROUTE_METADATA,
  DASHBOARD_ROUTE_WHY,
} from "@/data/dashboard-route";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { buildFaqSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: DASHBOARD_ROUTE_METADATA.title,
  description: DASHBOARD_ROUTE_METADATA.description,
  ...canonicalMetadata("/hoe-werkt-dashboard"),
};

const faqSchema = buildFaqSchema([...DASHBOARD_ROUTE_FAQ]);

export default function HoeWerktDashboardPage() {
  return (
    <main className="bg-[var(--ps-bg)] pb-20 pt-16 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {DASHBOARD_ROUTE_HERO.eyebrow}
            </p>
            <h1 className="mb-4 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
              {DASHBOARD_ROUTE_HERO.title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
              {DASHBOARD_ROUTE_HERO.subtitle}
            </p>
          </header>

          <DashboardRouteSection />
          <DashboardPreviewMockup />

          <section aria-labelledby="dashboard-features" className="mb-10">
            <h2
              id="dashboard-features"
              className="mb-4 font-serif text-2xl text-stone-900 md:text-3xl"
            >
              Wat het dashboard voor je doet
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {DASHBOARD_ROUTE_FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <h3 className="mb-2 text-base font-semibold text-stone-900">
                    {index + 1}) {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
            <h2 className="mb-3 font-serif text-3xl text-stone-900">
              {DASHBOARD_ROUTE_WHY.title}
            </h2>
            {DASHBOARD_ROUTE_WHY.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mb-4 text-base leading-relaxed text-stone-600 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <section
            aria-labelledby="dashboard-faq"
            className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 md:p-8"
          >
            <h2
              id="dashboard-faq"
              className="mb-5 font-serif text-2xl text-stone-900 md:text-3xl"
            >
              Veelgestelde vragen
            </h2>
            <dl className="space-y-5">
              {DASHBOARD_ROUTE_FAQ.map((item) => (
                <div key={item.question}>
                  <dt className="text-base font-semibold text-stone-900">
                    {item.question}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-6 md:p-8">
            <h2 className="mb-4 font-serif text-3xl text-stone-900">
              {DASHBOARD_ROUTE_CTA.title}
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={DASHBOARD_ROUTE_CTA.primaryHref}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
              >
                {DASHBOARD_ROUTE_CTA.primaryLabel}
              </Link>
              <Link
                href={DASHBOARD_ROUTE_CTA.secondaryHref}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
              >
                {DASHBOARD_ROUTE_CTA.secondaryLabel}
              </Link>
            </div>
            <p className="mt-3 text-sm text-stone-500">
              {DASHBOARD_ROUTE_CTA.microcopy}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              Lees ook{" "}
              <Link
                href="/methodologie"
                className="font-medium text-stone-800 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
              >
                onze methodologie
              </Link>{" "}
              en bekijk de{" "}
              <Link
                href="/privacy"
                className="font-medium text-stone-800 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
              >
                privacyuitleg
              </Link>
              .
            </p>
          </section>
        </article>
      </Container>
    </main>
  );
}
