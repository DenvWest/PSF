import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { THEMA_DATA, THEMA_SLUGS } from "@/data/thema";
import { EmailGateForm } from "@/components/thema/EmailGateForm";

interface Props {
  params: Promise<{ thema: string }>;
}

export function generateStaticParams() {
  return THEMA_SLUGS.map((slug) => ({ thema: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { thema: slug } = await params;
  const data = THEMA_DATA[slug];
  if (!data) return {};

  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: data.seo.canonical },
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
    },
  };
}

export default async function ThemaPage({ params }: Props) {
  const { thema: slug } = await params;
  const data = THEMA_DATA[slug];
  if (!data) notFound();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] py-20 lg:py-28">
        <Container>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            {data.heroLabel}
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900">
            {data.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            {data.heroSubtitle}
          </p>
        </Container>
      </section>

      {/* ─── HERKENNING ─── */}
      <section className="py-16 lg:py-20">
        <Container>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            {data.recognition.sectionLabel}
          </p>
          <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900">
            {data.recognition.title}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recognition.quotes.map((quote, i) => (
              <div
                key={i}
                className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm italic leading-relaxed text-stone-600">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── WAT ER SPEELT ─── */}
      <section className="bg-[#F7F5F0] py-16 lg:py-20">
        <Container>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            {data.causes.sectionLabel}
          </p>
          <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900">
            {data.causes.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            {data.causes.intro}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {data.causes.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg">
                    {item.icon}
                  </span>
                  <h3 className="font-semibold text-stone-900">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── QUICK WINS ─── */}
      <section className="py-16 lg:py-20">
        <Container>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            {data.quickWins.sectionLabel}
          </p>
          <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900">
            {data.quickWins.title}
          </h2>
          <div className="mt-10 space-y-4">
            {data.quickWins.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5A8F6A]/10 text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── SUPPLEMENTEN ─── */}
      <section className="bg-[#F7F5F0] py-16 lg:py-20">
        <Container>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            {data.supplements.sectionLabel}
          </p>
          <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900">
            {data.supplements.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            {data.supplements.intro}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.supplements.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-lg">
                    {item.icon}
                  </span>
                  <h3 className="font-semibold text-stone-900">{item.name}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-500">
                  {item.reason}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={item.guideLink}
                    className="text-sm font-medium text-[#5A8F6A] hover:underline"
                  >
                    Lees de gids →
                  </Link>
                  <Link
                    href={item.comparisonLink}
                    className="text-sm font-medium text-stone-500 hover:text-stone-700 hover:underline"
                  >
                    Vergelijk producten →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── E-MAIL GATE + EXPERT QUOTE ─── */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 lg:p-10 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5A8F6A]">
              {data.emailGate.sectionLabel}
            </p>
            <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-stone-900">
              {data.emailGate.title}
            </h2>
            <p className="mt-3 text-base text-stone-600">
              {data.emailGate.subtitle}
            </p>
            <div className="mt-6 space-y-2">
              {data.emailGate.bulletPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5A8F6A]/10 text-xs text-[#5A8F6A]">
                    ✓
                  </span>
                  <p className="text-sm text-stone-600">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <EmailGateForm
                ctaText={data.emailGate.ctaText}
                privacyText={data.emailGate.privacyText}
                successMessage={data.emailGate.successMessage}
                themaSlug={data.slug}
              />
            </div>

            <div className="mt-8 border-t border-stone-100 pt-6">
              <blockquote className="text-sm italic leading-relaxed text-stone-500">
                &ldquo;{data.expertQuote.quote}&rdquo;
              </blockquote>
              <p className="mt-2 text-xs text-stone-400">
                — {data.expertQuote.author}, {data.expertQuote.credential}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── PREMIUM INTAKE CTA ─── */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="rounded-2xl bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] p-8 lg:p-12 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">
              {data.premiumCta.sectionLabel}
            </p>
            <h2 className="mt-3 font-serif text-2xl lg:text-3xl text-white">
              {data.premiumCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
              {data.premiumCta.subtitle}
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2">
              {data.premiumCta.features.map((feature, i) => (
                <span key={i} className="text-sm text-white/70">
                  ✓ {feature}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href={data.premiumCta.ctaLink}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#5A8F6A] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                {data.premiumCta.ctaText}
                <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/40">
              {data.premiumCta.note}
            </p>
          </div>
        </Container>
      </section>

      {/* ─── GERELATEERDE ARTIKELEN ─── */}
      {data.relatedArticles.length > 0 && (
        <section className="bg-[#F7F5F0] py-16 lg:py-20">
          <Container>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              VERDER LEZEN
            </p>
            <h2 className="mt-3 font-serif text-2xl text-stone-900">
              Gerelateerde artikelen
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {data.relatedArticles.map((article, i) => (
                <Link
                  key={i}
                  href={`/blog/${article.category}`}
                  className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-stone-800">
                    {article.title}
                  </span>
                  <span className="text-stone-400 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ─── MEDISCHE DISCLAIMER ─── */}
      <section className="py-10">
        <Container>
          <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-stone-400">
            De informatie op deze pagina is bedoeld als algemene voorlichting en
            vervangt geen medisch advies. Raadpleeg altijd een arts of
            gekwalificeerd therapeut voordat je supplementen gaat gebruiken,
            vooral als je medicatie gebruikt of een medische aandoening hebt.
          </p>
        </Container>
      </section>
    </>
  );
}
