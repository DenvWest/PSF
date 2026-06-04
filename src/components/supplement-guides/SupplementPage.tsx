import Link from "next/link";
import type { SupplementData } from "@/types/supplement-guide";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import VormCard from "./VormCard";
import RelevantieCard from "./RelevantieCard";
import SymptoomLinkCard from "./SymptoomLinkCard";
import FAQItem from "./FAQItem";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { ComparisonProfileFits } from "@/components/supplements/ComparisonProfileFits";
import { getProfileFitsForGuideSlug } from "@/data/supplement-profile-fits";
import {
  renderInlineMarkdownLinks,
  stripInlineMarkdownLinks,
} from "@/components/blog/inlineMarkdownLinks";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/structuredData";

const SITE_URL = "https://perfectsupplement.nl";

interface SupplementPageProps {
  data: SupplementData;
}

export default function SupplementPage({ data }: SupplementPageProps) {
  const pageUrl = `${SITE_URL}/supplementen/${data.slug}`;
  const modified = data.dateModified ?? data.datePublished;
  const profileFits = getProfileFitsForGuideSlug(data.slug);

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
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Supplementen", href: "/supplementen" },
              { label: data.naam },
            ]}
          />

          <section aria-label="Intro" className="ps-prose-container mt-5">
            <h1 className="ps-symptoom-h1 text-4xl text-stone-900 md:text-5xl">
              {data.h1}
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              {data.introTekst}
            </p>
          </section>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        <div className="space-y-16">
          <section id="wat-doet" aria-labelledby="wat-doet-heading">
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

          <section id="waarom-na-40" aria-labelledby="waarom-heading">
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

          <section id="vormen" aria-labelledby="vormen-heading">
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
              <span className="mt-px shrink-0 text-base leading-none" aria-hidden>
                ℹ️
              </span>
              <p className="text-xs leading-relaxed text-stone-500">
                {data.vormenDosering.disclaimer}
              </p>
            </div>
          </section>

          <section id="waar-op-letten" aria-labelledby="letten-heading">
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

          <section id="bij-jouw-klachten" aria-labelledby="klachten-heading">
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

          <ComparisonProfileFits fits={profileFits} />

          <section id="faq" aria-labelledby="faq-heading">
            <div className="ps-prose-container">
              <h2
                id="faq-heading"
                className="font-display text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                Veelgestelde vragen
              </h2>
              <div className="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white px-5 py-1">
                {data.faq.map((item, i) => (
                  <FAQItem key={i} vraag={item.vraag} antwoord={item.antwoord} />
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
                Onafhankelijk vergeleken op inhoud, kwaliteit en prijs per dag — dezelfde criteria als in deze gids.
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
            <section id="verdieping" aria-labelledby="verdieping-heading">
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
                        <span className="ml-4 shrink-0 text-stone-400" aria-hidden>
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
            className="py-16 lg:py-20"
          >
            <div className="rounded-2xl bg-gradient-to-br from-ps-green to-ps-green-hover p-8 lg:p-12 text-center">
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
                De meeste klachten beginnen niet bij een tekort, maar bij
                leefstijl. Onze check laat zien wat er écht speelt — en of een
                supplement zinvol is.
              </p>
              <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2">
                <span className="text-sm text-white/70">
                  ✓ 15 vragen, 3 minuten
                </span>
                <span className="text-sm text-white/70">
                  ✓ Scores op 6 leefstijldomeinen
                </span>
                <span className="text-sm text-white/70">
                  ✓ Persoonlijk Herstelplan met quick wins
                </span>
                <span className="text-sm text-white/70">
                  ✓ Gerichte supplementroute op basis van jouw profiel
                </span>
              </div>
              <IntakeCtaMicro className="mx-auto mt-6 max-w-md text-sm text-white/60" />
              <div className="mt-6">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ps-green shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                >
                  Ontdek of {data.naam.charAt(0).toLowerCase() + data.naam.slice(1)}{" "}
                  bij jou past — gratis
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </section>

          <MedicalDisclaimer />
        </div>
      </Container>
    </div>
  );
}
