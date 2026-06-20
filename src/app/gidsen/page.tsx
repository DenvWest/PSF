import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import {
  GUIDE_DATA,
  THEMA_GUIDE_SLUGS,
  getGuideDeliveryStatus,
} from "@/data/gids";
import { INTAKE_CTA } from "@/lib/intake-product-copy";
import type { GuideThema } from "@/types/guide-opt-in";

export const metadata: Metadata = {
  title: "Gidsen na 40: slaap, energie, stress en herstel | PerfectSupplement",
  description:
    "Overzicht van onze themagidsen voor mannen 40+. Kies slaap, energie, stress, herstel of testosteron — praktisch en zonder diagnoses.",
  ...canonicalMetadata("/gidsen"),
};

const primaryCtaClassName =
  "inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800";

const pillarLinkClassName =
  "text-sm text-stone-600 underline decoration-stone-300 underline-offset-[3px] transition-colors hover:text-ps-green";

function GuideCardActions({
  slug,
  guideName,
  pillarHref,
  pdfCtaLabel,
}: {
  slug: GuideThema;
  guideName: string;
  pillarHref: string;
  pdfCtaLabel?: string;
}) {
  const status = getGuideDeliveryStatus(slug);
  const statusLabel =
    status === "pdf"
      ? "PDF beschikbaar"
      : status === "email_sequence"
        ? "Stappenplan per e-mail"
        : "Komt binnenkort";
  const statusClassName =
    status === "coming_soon"
      ? "bg-stone-100 text-stone-600"
      : "bg-green-100 text-green-800";

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName}`}
      >
        {statusLabel}
      </span>
      {status === "pdf" ? (
        <Link href={`/gids/${slug}`} className={primaryCtaClassName}>
          {pdfCtaLabel ?? `Ontvang de gratis ${guideName} →`}
        </Link>
      ) : null}
      {status === "email_sequence" ? (
        <Link href={`/gids/${slug}`} className={primaryCtaClassName}>
          Ontvang het stappenplan per e-mail →
        </Link>
      ) : null}
      {status === "coming_soon" ? (
        <p className="text-sm text-stone-500">Komt binnenkort</p>
      ) : null}
      <Link href={pillarHref} className={pillarLinkClassName}>
        Lees de pillar →
      </Link>
    </div>
  );
}

export default function GidsenPage() {
  const voedingGuide = GUIDE_DATA.voeding;
  const bewegingGuide = GUIDE_DATA.beweging;

  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="guides-overview w-full">
          <article>
            <header>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Overzicht
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                Begrijp wat er na je 40e verandert
              </h1>
            </header>

            <section className="mt-10">
              <p className="text-lg leading-relaxed text-gray-700">
                Slechter slapen, minder energie, trager herstel — na je 40e verandert
                er van alles. Deze gidsen helpen je begrijpen wat er speelt en welke
                stappen echt verschil maken. Geen hypes, geen wondermiddelen. Kies je
                thema, ontvang de gratis PDF per e-mail of lees de complete gids online.
              </p>
            </section>

            <section className="mt-12 w-full" aria-label="Leefstijl-pillars">
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Leefstijl eerst
              </h2>
              <p className="mt-3 leading-relaxed text-gray-700">
                De grootste winst zit zelden in een supplement. Slaap, voeding, beweging
                en herstel doen meestal het meeste — daarom beginnen deze gidsen daar.
              </p>
              <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="font-semibold text-gray-900">Voeding na 40</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Eiwit, ritme en vetten — de basis die na je 40e zwaarder telt.
                    Praktische stappen vóór je aan supplementen denkt.
                  </p>
                  <GuideCardActions
                    slug="voeding"
                    guideName={voedingGuide.guideName}
                    pillarHref={voedingGuide.pillarHref}
                  />
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="font-semibold text-gray-900">Beweging na 40</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Kracht, herstel en ritme — zonder sportschool-hype. Wat werkt in
                    een drukke week.
                  </p>
                  <GuideCardActions
                    slug="beweging"
                    guideName={bewegingGuide.guideName}
                    pillarHref={bewegingGuide.pillarHref}
                  />
                </div>
              </div>
            </section>

            <section className="mt-12 w-full" aria-label="Themagidsen">
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Kies je thema
              </h2>

              <div className="mt-6 space-y-4">
                {THEMA_GUIDE_SLUGS.map((slug) => {
                  const guide = GUIDE_DATA[slug];
                  return (
                    <div
                      key={slug}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-5"
                    >
                      <p className="text-sm leading-relaxed text-gray-700">
                        <strong className="text-gray-900">{guide.optIn.title}</strong>
                        <br />
                        {guide.heroSubtitle}
                      </p>
                      <GuideCardActions
                        slug={slug}
                        guideName={guide.guideName}
                        pillarHref={guide.pillarHref}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-14 w-full">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Wil je weten waar je staat?
                </h3>
                <p className="mt-3 max-w-lg text-gray-600">
                  De Leefstijlcheck brengt in 3 minuten jouw slaap-, stress- en
                  energieprofiel in kaart. Je krijgt een persoonlijk leefstijloverzicht —
                  gratis, zonder registratie.
                </p>
                <Link
                  href="/intake"
                  className="mt-5 inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
                >
                  {INTAKE_CTA.discoverOverview}
                </Link>
              </div>
            </section>

            <MedicalDisclaimer />
          </article>
        </div>
      </Container>
    </main>
  );
}
