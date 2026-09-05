import Link from "next/link";
import type { SupplementData } from "@/types/supplement-guide";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import VormCard from "./VormCard";
import RelevantieCard from "./RelevantieCard";
import SymptoomLinkCard from "./SymptoomLinkCard";
import FAQItem from "./FAQItem";
import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { VoortgangReturnBanner } from "@/components/dashboard/VoortgangReturnBanner";
import { ComparisonProfileFits } from "@/components/supplements/ComparisonProfileFits";
import { getProfileFitsForGuideSlug } from "@/data/supplement-profile-fits";
import GuideSidebar, {
  type GuideTocItem,
} from "@/components/supplement-guides/GuideSidebar";
import { CATALOG } from "@/data/supplement-hub/catalog";
import {
  renderInlineMarkdownLinks,
  stripInlineMarkdownLinks,
} from "@/components/blog/inlineMarkdownLinks";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/lib/seo/structuredData";

const SITE_URL = "https://perfectsupplement.nl";

interface SupplementPageProps {
  data: SupplementData;
}

export default function SupplementPage({ data }: SupplementPageProps) {
  const pageUrl = `${SITE_URL}/supplementen/${data.slug}`;
  const modified = data.dateModified ?? data.datePublished;
  const profileFits = getProfileFitsForGuideSlug(data.slug);
  const nadrukThemas =
    CATALOG.find((entry) => entry.slug === data.slug)?.themas ?? [];

  const tocItems: GuideTocItem[] = [
    { id: "wat-doet", label: data.watIsHet.titel },
    { id: "waarom-na-40", label: data.waaromRelevant.titel },
    { id: "vormen", label: data.vormenDosering.titel },
    { id: "waar-op-letten", label: data.waarOpLetten.titel },
    { id: "bij-jouw-klachten", label: data.gerelateerdeSymptomen.titel },
    ...(profileFits.length > 0
      ? [{ id: "past-bij-profiel-sectie", label: "Past bij dit profiel" }]
      : []),
    { id: "faq", label: "Veelgestelde vragen" },
    ...(data.blogLinks.length > 0
      ? [{ id: "verdieping", label: "Verdieping" }]
      : []),
  ];

  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    { name: "Supplementen", url: "/supplementen" },
    { name: data.naam, url: `/supplementen/${data.slug}` },
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.h1,
    datePublished: data.datePublished,
    dateModified: modified,
    author: {
      "@type": "Organization",
      name: "Redactie PerfectSupplement",
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: SITE_URL,
    },
    description: data.metaDescription,
    mainEntityOfPage: pageUrl,
  };

  const faqJsonLd = buildFaqSchema(
    data.faq.map((item) => ({
      question: stripInlineMarkdownLinks(item.vraag),
      answer: stripInlineMarkdownLinks(item.antwoord),
    })),
  );

  return (
    <div className="bg-stone-50/40 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <VoortgangReturnBanner surface="gids" />
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Supplementen", href: "/supplementen" },
              { label: data.naam },
            ]}
          />

          <section aria-label="Intro" className="mt-5 max-w-3xl">
            <h1 className="ps-symptoom-h1 text-3xl text-stone-900 md:text-5xl">
              {data.h1}
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              {data.introTekst}
            </p>
          </section>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-12">
          <GuideSidebar
            items={tocItems}
            naam={data.naam}
            slug={data.slug}
            nadrukThemas={nadrukThemas}
            vergelijking={
              data.productVergelijkingCta
                ? {
                    href: data.productVergelijkingCta.href,
                    linkLabel: data.productVergelijkingCta.linkLabel,
                  }
                : undefined
            }
          />

          <div className="mt-10 min-w-0 space-y-14 lg:mt-0">
            <section
              id="wat-doet"
              aria-labelledby="wat-doet-heading"
              className="scroll-mt-24"
            >
              <div className="ps-prose-container">
                <h2
                  id="wat-doet-heading"
                  className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
                >
                  {data.watIsHet.titel}
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {renderInlineMarkdownLinks(data.watIsHet.tekst)}
                </p>
              </div>
            </section>

            <section
              id="waarom-na-40"
              aria-labelledby="waarom-heading"
              className="scroll-mt-24"
            >
              <h2
                id="waarom-heading"
                className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                {data.waaromRelevant.titel}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.waaromRelevant.punten.map((punt, i) => (
                  <RelevantieCard
                    key={i}
                    titel={punt.titel}
                    uitleg={punt.uitleg}
                  />
                ))}
              </div>
            </section>

            <section
              id="vormen"
              aria-labelledby="vormen-heading"
              className="scroll-mt-24"
            >
              <h2
                id="vormen-heading"
                className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                {data.vormenDosering.titel}
              </h2>

              <div className="mt-6 space-y-3">
                {data.vormenDosering.vormen.map((vorm, i) => (
                  <VormCard
                    key={i}
                    naam={vorm.naam}
                    geschiktVoor={vorm.geschiktVoor}
                    dosering={vorm.dosering}
                    opmerking={vorm.opmerking}
                  />
                ))}
              </div>

              <div className="mt-5 flex max-w-[720px] items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5">
                <span
                  className="mt-px shrink-0 text-base leading-none"
                  aria-hidden
                >
                  ℹ️
                </span>
                <p className="text-xs leading-relaxed text-stone-500">
                  {data.vormenDosering.disclaimer}
                </p>
              </div>
            </section>

            <section
              id="waar-op-letten"
              aria-labelledby="letten-heading"
              className="scroll-mt-24"
            >
              <div className="ps-prose-container">
                <h2
                  id="letten-heading"
                  className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
                >
                  {data.waarOpLetten.titel}
                </h2>
                <ul className="mt-6 space-y-4" role="list">
                  {data.waarOpLetten.criteria.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ps-green)]"
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {item.criterium}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-600">
                          {item.uitleg}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section
              id="bij-jouw-klachten"
              aria-labelledby="klachten-heading"
              className="scroll-mt-24"
            >
              <h2
                id="klachten-heading"
                className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                {data.gerelateerdeSymptomen.titel}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.gerelateerdeSymptomen.links.map((link, i) => (
                  <SymptoomLinkCard
                    key={i}
                    symptoom={link.symptoom}
                    tekst={link.tekst}
                    href={link.href}
                  />
                ))}
              </div>
            </section>

            <ComparisonProfileFits fits={profileFits} bare />

            <section
              id="faq"
              aria-labelledby="faq-heading"
              className="scroll-mt-24"
            >
              <div className="ps-prose-container">
                <h2
                  id="faq-heading"
                  className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
                >
                  Veelgestelde vragen
                </h2>
                <div className="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white px-5 py-1">
                  {data.faq.map((item, i) => (
                    <FAQItem
                      key={i}
                      vraag={item.vraag}
                      antwoord={item.antwoord}
                    />
                  ))}
                </div>
              </div>
            </section>

            {data.productVergelijkingCta ? (
              <section
                id="vergelijking-cta"
                aria-labelledby="vergelijking-cta-heading"
                className="rounded-2xl border border-emerald-200/70 bg-[#EEF3EB] px-6 py-8 shadow-sm ring-1 ring-stone-200/40"
              >
                <h2
                  id="vergelijking-cta-heading"
                  className="font-display text-lg font-semibold tracking-tight text-stone-900 sm:text-xl"
                >
                  {data.productVergelijkingCta.titel}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Onafhankelijk vergeleken op inhoud, kwaliteit en prijs per dag
                  — dezelfde criteria als in deze gids.
                </p>
                <Link
                  href={data.productVergelijkingCta.href}
                  className="mt-5 inline-flex items-center rounded-xl border border-ps-green/40 bg-white px-5 py-3 text-sm font-semibold text-ps-green transition hover:border-ps-green hover:bg-[#EEF3EB]"
                >
                  {data.productVergelijkingCta.linkLabel}
                </Link>
              </section>
            ) : null}

            {data.blogLinks.length > 0 && (
              <section
                id="verdieping"
                aria-labelledby="verdieping-heading"
                className="scroll-mt-24"
              >
                <div className="ps-prose-container">
                  <h2
                    id="verdieping-heading"
                    className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
                  >
                    Verdieping
                  </h2>
                  <ul className="mt-5 space-y-2" role="list">
                    {data.blogLinks.map((link, i) => (
                      <li key={i}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-4 py-3.5 text-sm font-medium text-stone-900 transition hover:border-stone-200 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                        >
                          {link.titel}
                          <span
                            className="ml-4 shrink-0 text-stone-400"
                            aria-hidden
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            <section
              id="leefstijl-cta"
              aria-labelledby="leefstijl-cta-heading"
              className="scroll-mt-24 pt-4"
            >
              <div className="rounded-2xl bg-gradient-to-br from-ps-green to-ps-green-hover p-8 text-center lg:p-10">
                <p className="text-xs font-medium uppercase tracking-widest text-white/50">
                  PERSOONLIJK ADVIES
                </p>
                <h2
                  id="leefstijl-cta-heading"
                  className="mt-3 font-serif text-2xl lg:text-3xl text-white"
                >
                  Twijfel je of{" "}
                  {data.naam.charAt(0).toLowerCase() + data.naam.slice(1)} echt
                  iets voor jou is?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
                  {INTAKE_CTA.guideClosingSubline}
                </p>
                <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2">
                  <span className="text-sm text-white/70">
                    ✓ 18 vragen, 3 minuten
                  </span>
                  <span className="text-sm text-white/70">
                    ✓ Scores op 5 leefstijldomeinen
                  </span>
                  <span className="text-sm text-white/70">
                    ✓ {INTAKE_DELIVERABLE.premiumFeatureBullet}
                  </span>
                  <span className="text-sm text-white/70">
                    ✓ {INTAKE_CTA.supplementFeature}
                  </span>
                </div>
                <IntakeCtaMicro className="mx-auto mt-6 max-w-md text-sm text-white/60" />
                <div className="mt-6">
                  <IntakeCtaLink
                    locatie={`gids_afsluiter_${data.slug}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-ps-green shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                  >
                    {INTAKE_CTA.gratisButton}
                    <span aria-hidden>→</span>
                  </IntakeCtaLink>
                </div>
              </div>
            </section>
          </div>
        </div>

        <MedicalDisclaimer className="mt-16" />
      </Container>
    </div>
  );
}
