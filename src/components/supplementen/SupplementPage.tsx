import Link from "next/link";
import type { SupplementData } from "@/types/supplementen";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/symptomen/Breadcrumbs";
import VormCard from "./VormCard";
import RelevantieCard from "./RelevantieCard";
import SymptoomLinkCard from "./SymptoomLinkCard";
import FAQItem from "./FAQItem";

interface SupplementPageProps {
  data: SupplementData;
}

export default function SupplementPage({ data }: SupplementPageProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((item) => ({
      "@type": "Question",
      name: item.vraag,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.antwoord,
      },
    })),
  };

  return (
    <div className="bg-stone-50/40 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: "Supplementen", href: "/supplementen" },
              { label: data.naam },
            ]}
          />

          <div className="ps-prose-container mt-5">
            <h1 className="ps-symptoom-h1 text-4xl text-stone-900 md:text-5xl">
              {data.h1}
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              {data.introTekst}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        <div className="space-y-16">

          {/* ── Sectie 1: Wat is het ──────────────────────────────────── */}
          <section aria-labelledby="watishet-heading">
            <div className="ps-prose-container">
              <h2
                id="watishet-heading"
                className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
              >
                {data.watIsHet.titel}
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                {data.watIsHet.tekst}
              </p>
            </div>
          </section>

          {/* ── Sectie 2: Waarom relevant ─────────────────────────────── */}
          <section aria-labelledby="waarom-heading">
            <h2
              id="waarom-heading"
              className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Sectie 3: Vormen & dosering ───────────────────────────── */}
          <section aria-labelledby="vormen-heading">
            <h2
              id="vormen-heading"
              className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Sectie 4: Waar op letten ──────────────────────────────── */}
          <section aria-labelledby="letten-heading">
            <div className="ps-prose-container">
              <h2
                id="letten-heading"
                className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Sectie 5: Gerelateerde symptomen ─────────────────────── */}
          <section aria-labelledby="symptomen-heading">
            <h2
              id="symptomen-heading"
              className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Sectie 6: FAQ ──────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading">
            <div className="ps-prose-container">
              <h2
                id="faq-heading"
                className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Blogartikelen ──────────────────────────────────────────── */}
          {data.blogLinks.length > 0 && (
            <section aria-labelledby="blog-heading">
              <div className="ps-prose-container">
                <h2
                  id="blog-heading"
                  className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
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

          {/* ── Footer CTA ────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
            <p className="ps-eyebrow">Meer weten</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-stone-900 md:text-xl">
              Terug naar het overzicht
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Ontdek welke supplementen passen bij jouw klachten — stress,
              slaap of energie.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/supplementen" className="ps-btn-primary">
                Alle supplementen
              </Link>
              <Link href="/symptomen" className="ps-btn-secondary">
                Bekijk symptomen
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
