import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import {
  ABOUT_CONTACT,
  ABOUT_CREDENTIALS,
  ABOUT_CTA,
  ABOUT_FOUNDER,
  ABOUT_FOUNDER_SAME_AS,
  ABOUT_HERO,
  ABOUT_INSIGHT,
  ABOUT_METADATA,
  ABOUT_ORIGIN,
  ABOUT_SITE_URL,
  ABOUT_STORY,
  ABOUT_TRUST,
  ABOUT_WHAT_WE_DO,
} from "@/data/about";

export const metadata: Metadata = {
  title: ABOUT_METADATA.title,
  description: ABOUT_METADATA.description,
  alternates: { canonical: "/over-ons" },
};

const linkClass =
  "text-emerald-600 underline-offset-2 hover:underline";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Over PerfectSupplement",
  url: `${ABOUT_SITE_URL}/over-ons`,
  description: ABOUT_METADATA.description,
  mainEntity: {
    "@type": "Organization",
    name: "PerfectSupplement",
    url: ABOUT_SITE_URL,
    description:
      "Onafhankelijk platform voor mannen 40+ — leefstijl, herstel en transparante supplementvergelijking",
    founder: {
      "@type": "Person",
      name: ABOUT_FOUNDER.name,
      url: `${ABOUT_SITE_URL}/over-ons#achtergrond`,
      jobTitle: ABOUT_FOUNDER.jobTitle,
      description:
        "BIG-geregistreerd fysiotherapeut en gecertificeerd leefstijlcoach met focus op mannen 40+",
      ...(ABOUT_FOUNDER_SAME_AS.length > 0
        ? { sameAs: ABOUT_FOUNDER_SAME_AS }
        : {}),
    },
  },
};

export default function OverOnsPage() {
  const [insightLead] = ABOUT_INSIGHT.paragraphs;
  const [, , whatWeDoPurpose] = ABOUT_WHAT_WE_DO.paragraphs;
  const [trustAffiliate] = ABOUT_TRUST.paragraphs;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <Container>
          <article className="py-14 lg:py-20">
            <section className="mb-16">
              <h1 className="font-serif text-4xl font-normal text-slate-900 md:text-5xl">
                {ABOUT_HERO.headline}
              </h1>
              <div className="mt-5 max-w-2xl space-y-4 text-xl text-slate-600">
                {ABOUT_HERO.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section id={ABOUT_STORY.id} className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_STORY.title}
              </h2>
              {ABOUT_STORY.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-slate-600 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </section>

            <section id={ABOUT_INSIGHT.id} className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_INSIGHT.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">{insightLead}</p>
              <p className="text-slate-600 leading-relaxed">
                {ABOUT_INSIGHT.vicieuzeCirkel} {ABOUT_INSIGHT.keyInsightLead}{" "}
                <span className="text-slate-800">{ABOUT_INSIGHT.keyInsight}</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Wil je hier dieper op in? Lees onze gids over{" "}
                <Link href={ABOUT_INSIGHT.links[0].href} className={linkClass}>
                  {ABOUT_INSIGHT.links[0].label}
                </Link>{" "}
                of{" "}
                <Link href={ABOUT_INSIGHT.links[1].href} className={linkClass}>
                  {ABOUT_INSIGHT.links[1].label}
                </Link>{" "}
                — met praktische stappen, zonder diagnoses.
              </p>
            </section>

            <section id={ABOUT_ORIGIN.id} className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_ORIGIN.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {ABOUT_ORIGIN.paragraphs[0]}
              </p>

              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-6 py-7">
                <h3 className="font-serif text-xl font-normal text-slate-900 md:text-2xl">
                  {ABOUT_ORIGIN.positioning.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {ABOUT_ORIGIN.positioning.paragraphs[0]}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <span className="text-slate-900">
                    {ABOUT_ORIGIN.positioning.paragraphs[1]}
                  </span>
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {ABOUT_ORIGIN.paragraphs[1]}
              </p>
            </section>

            <section id={ABOUT_WHAT_WE_DO.id} className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_WHAT_WE_DO.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                <span className="text-slate-800">Eerst inzicht, dan pas aanvullen.</span>{" "}
                Met de gratis{" "}
                <Link href={ABOUT_WHAT_WE_DO.intakeLink.href} className={linkClass}>
                  Leefstijlcheck
                </Link>{" "}
                breng je in drie minuten je slaap, stress, energie, voeding,
                beweging en herstel in kaart. Op basis daarvan krijg je gerichte
                suggesties — eerst leefstijlaanpassingen, daarna pas supplementen
                die aansluiten.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Daarnaast vergelijken we supplementen op vaste criteria:
                dosering, biobeschikbaarheid, prijs-kwaliteit en transparantie.
                Elk product doorloopt hetzelfde stramien — ongeacht het merk.{" "}
                <Link
                  href={ABOUT_WHAT_WE_DO.methodologieLink.href}
                  className={linkClass}
                >
                  {ABOUT_WHAT_WE_DO.methodologieLink.label} →
                </Link>
              </p>
              <p className="text-slate-600 leading-relaxed">{whatWeDoPurpose}</p>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  {ABOUT_WHAT_WE_DO.whatWeDontDoTitle}
                </h3>
                <ul className="space-y-2 text-slate-600">
                  {ABOUT_WHAT_WE_DO.whatWeDontDo.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section id={ABOUT_TRUST.id} className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_TRUST.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">{ABOUT_TRUST.intro}</p>
              <p className="text-slate-600 leading-relaxed">{trustAffiliate}</p>
              <p className="text-slate-600 leading-relaxed">
                Onze scores worden niet beïnvloed door commissie. De{" "}
                <Link href="/methodologie" className={linkClass}>
                  methodologie
                </Link>{" "}
                en criteria staan vast. Meer details vind je in onze{" "}
                <Link href={ABOUT_TRUST.affiliateLink.href} className={linkClass}>
                  {ABOUT_TRUST.affiliateLink.label}
                </Link>
                .
              </p>
              <p className="text-sm text-slate-500">
                {ABOUT_TRUST.medicalDisclaimer}
              </p>
            </section>

            <section id={ABOUT_CREDENTIALS.id} className="mb-16">
              <h2 className="mb-6 font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_CREDENTIALS.title}
              </h2>

              <div className="rounded-2xl bg-slate-50 p-8">
                <h3 className="mb-4 font-serif text-xl text-slate-900">
                  {ABOUT_FOUNDER.name}
                </h3>

                <div className="space-y-2 text-slate-600">
                  {ABOUT_FOUNDER.credentials.map((credential) => (
                    <p key={credential}>{credential}</p>
                  ))}
                </div>

                <p className="mt-4 text-slate-600 leading-relaxed">
                  {ABOUT_FOUNDER.bio}
                </p>
              </div>
            </section>

            <section className="mb-12 rounded-2xl bg-emerald-50 px-8 py-10">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                {ABOUT_CTA.title}
              </h2>
              <p className="mt-3 mb-6 text-slate-600 leading-relaxed">
                {ABOUT_CTA.description}
              </p>
              <Link
                href={ABOUT_CTA.href}
                className="inline-block rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                {ABOUT_CTA.buttonLabel}
              </Link>
            </section>

            <section>
              <p className="text-slate-500">
                {ABOUT_CONTACT.text}{" "}
                <Link href={ABOUT_CONTACT.href} className={linkClass}>
                  {ABOUT_CONTACT.linkLabel} →
                </Link>
              </p>
            </section>
          </article>
        </Container>
      </main>
    </>
  );
}
