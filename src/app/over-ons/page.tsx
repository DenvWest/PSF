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
  "font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] hover:decoration-[#5A8F6A] transition";

const bodyClass = "text-base md:text-lg leading-[1.75] text-stone-700";

const h2Class =
  "font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-8 text-balance text-stone-900";

const eyebrowClass = "block text-xs uppercase tracking-[0.2em] text-[#5A8F6A] mb-4";

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
        `Fysiotherapeut ingeschreven in het BIG-register (nr. ${ABOUT_FOUNDER.bigNumber}), leefstijlcoach (Civabv/KNGF-keurmerk) en oprichter van PerfectSupplement`,
      ...(ABOUT_FOUNDER_SAME_AS.length > 0
        ? { sameAs: ABOUT_FOUNDER_SAME_AS }
        : {}),
    },
  },
};

function StepNode({ number }: { number: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100 font-serif text-sm text-[#5A8F6A]">
        {number}
      </div>
    </div>
  );
}

export default function OverOnsPage() {
  const [heroLead, ...heroBody] = ABOUT_HERO.paragraphs;
  const [insightLead] = ABOUT_INSIGHT.paragraphs;
  const [whatWeDoIntake, whatWeDoComparison, whatWeDoPurpose] =
    ABOUT_WHAT_WE_DO.paragraphs;
  const [trustAffiliate] = ABOUT_TRUST.paragraphs;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <Container>
          <article>

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="-mx-6 px-6 py-28 md:py-32 lg:-mx-8 lg:px-8 lg:py-36 bg-[#E8E2D5]">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500 mb-6">
                Over PerfectSupplement
              </span>
              <h1 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight text-balance text-stone-900 md:text-6xl lg:text-7xl">
                {ABOUT_HERO.headline}
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-stone-700">
                {heroLead}
              </p>
              <div className="mt-16 h-px w-24 bg-stone-400/40" />
            </section>

            {/* ── INTRO ────────────────────────────────────────────────── */}
            <section className="py-16 md:py-20">
              <div className="mx-auto max-w-3xl space-y-6">
                {heroBody.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className={bodyClass}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* ── JOURNEY ──────────────────────────────────────────────── */}
            <div className="relative">
              {/* Dashed center line — desktop only */}
              <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-stone-200" />

              {/* ── Step 01: Wie zit hierachter — LEFT ─────────────────── */}
              <section id={ABOUT_STORY.id} className="py-14 md:py-16">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>01</span>
                  <h2 className={h2Class}>{ABOUT_STORY.title}</h2>
                  {ABOUT_STORY.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className={bodyClass}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div className="pr-16 space-y-6">
                    <span className={eyebrowClass}>01</span>
                    <h2 className={h2Class}>{ABOUT_STORY.title}</h2>
                    {ABOUT_STORY.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)} className={bodyClass}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <StepNode number="01" />
                  <div />
                </div>
              </section>

              {/* ── Step 02: Wat mannen missen — RIGHT ─────────────────── */}
              <section id={ABOUT_INSIGHT.id} className="py-14 md:py-16 -mx-6 px-6 bg-white lg:-mx-8 lg:px-8">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>02</span>
                  <h2 className={h2Class}>{ABOUT_INSIGHT.title}</h2>
                  <p className={bodyClass}>{insightLead}</p>
                  <p className={bodyClass}>
                    {ABOUT_INSIGHT.vicieuzeCirkel} {ABOUT_INSIGHT.keyInsightLead}{" "}
                    <span className="font-medium text-stone-800">
                      {ABOUT_INSIGHT.keyInsight}
                    </span>
                  </p>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div />
                  <StepNode number="02" />
                  <div className="pl-16 space-y-6">
                    <span className={eyebrowClass}>02</span>
                    <h2 className={h2Class}>{ABOUT_INSIGHT.title}</h2>
                    <p className={bodyClass}>{insightLead}</p>
                    <p className={bodyClass}>
                      {ABOUT_INSIGHT.vicieuzeCirkel} {ABOUT_INSIGHT.keyInsightLead}{" "}
                      <span className="font-medium text-stone-800">
                        {ABOUT_INSIGHT.keyInsight}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* ── Step 03: Waarom PerfectSupplement — LEFT ───────────── */}
              <section id={ABOUT_ORIGIN.id} className="py-14 md:py-16">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>03</span>
                  <h2 className={h2Class}>{ABOUT_ORIGIN.title}</h2>
                  <p className={bodyClass}>{ABOUT_ORIGIN.paragraphs[0]}</p>
                  <div className="space-y-6 pt-2">
                    <h3 className="font-serif text-2xl leading-tight text-stone-900 md:text-3xl">
                      {ABOUT_ORIGIN.positioning.title}
                    </h3>
                    <blockquote className="max-w-2xl border-l-2 border-[#5A8F6A] py-2 pl-6 font-serif text-2xl leading-snug text-stone-800 md:text-3xl">
                      {ABOUT_ORIGIN.positioning.paragraphs[0]}
                    </blockquote>
                  </div>
                  <p className={bodyClass}>{ABOUT_ORIGIN.paragraphs[1]}</p>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div className="pr-16 space-y-6">
                    <span className={eyebrowClass}>03</span>
                    <h2 className={h2Class}>{ABOUT_ORIGIN.title}</h2>
                    <p className={bodyClass}>{ABOUT_ORIGIN.paragraphs[0]}</p>
                    <div className="space-y-6 pt-2">
                      <h3 className="font-serif text-2xl leading-tight text-stone-900 md:text-3xl">
                        {ABOUT_ORIGIN.positioning.title}
                      </h3>
                      <blockquote className="border-l-2 border-[#5A8F6A] py-2 pl-6 font-serif text-2xl leading-snug text-stone-800 lg:text-3xl">
                        {ABOUT_ORIGIN.positioning.paragraphs[0]}
                      </blockquote>
                    </div>
                    <p className={bodyClass}>{ABOUT_ORIGIN.paragraphs[1]}</p>
                  </div>
                  <StepNode number="03" />
                  <div />
                </div>
              </section>

              {/* ── Step 04: Wat we voor je doen — RIGHT ───────────────── */}
              <section id={ABOUT_WHAT_WE_DO.id} className="py-14 md:py-16 -mx-6 px-6 bg-white lg:-mx-8 lg:px-8">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>04 — Aanpak</span>
                  <h2 className={h2Class}>{ABOUT_WHAT_WE_DO.title}</h2>
                  <p className="font-serif text-xl leading-snug text-stone-800 md:text-2xl">
                    {ABOUT_WHAT_WE_DO.brandPrinciple}
                  </p>
                  <p className={bodyClass}>
                    <span className="font-medium text-stone-800">
                      {ABOUT_WHAT_WE_DO.leadPhrase}
                    </span>{" "}
                    {whatWeDoIntake}
                  </p>
                  <p>
                    <Link href={ABOUT_WHAT_WE_DO.intakeLink.href} className={linkClass}>
                      {ABOUT_WHAT_WE_DO.intakeLink.label} →
                    </Link>
                  </p>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {ABOUT_WHAT_WE_DO.intakeDisclaimer}
                  </p>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {ABOUT_WHAT_WE_DO.privacyNoteBefore}
                    <Link href={ABOUT_WHAT_WE_DO.privacyLink.href} className={linkClass}>
                      {ABOUT_WHAT_WE_DO.privacyLink.label}
                    </Link>
                    {ABOUT_WHAT_WE_DO.privacyNoteAfter}
                  </p>
                  <p className={bodyClass}>
                    {whatWeDoComparison}{" "}
                    <Link href={ABOUT_WHAT_WE_DO.methodologieLink.href} className={linkClass}>
                      {ABOUT_WHAT_WE_DO.methodologieLink.label} →
                    </Link>
                  </p>
                  <p className={bodyClass}>{ABOUT_WHAT_WE_DO.evidenceParagraph}</p>
                  <p className={bodyClass}>{whatWeDoPurpose}</p>
                  <div className="pt-6">
                    <h3 className="mb-8 font-serif text-2xl leading-tight text-stone-900">
                      {ABOUT_WHAT_WE_DO.whatWeDontDoTitle}
                    </h3>
                    <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                      {ABOUT_WHAT_WE_DO.whatWeDontDo.map((item, index) => (
                        <div key={item}>
                          <span className="font-serif text-2xl text-[#5A8F6A]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="mt-3 text-base leading-relaxed text-stone-600 md:text-lg">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div />
                  <StepNode number="04" />
                  <div className="pl-16 space-y-6">
                    <span className={eyebrowClass}>04 — Aanpak</span>
                    <h2 className={h2Class}>{ABOUT_WHAT_WE_DO.title}</h2>
                    <p className="font-serif text-xl leading-snug text-stone-800 lg:text-2xl">
                      {ABOUT_WHAT_WE_DO.brandPrinciple}
                    </p>
                    <p className={bodyClass}>
                      <span className="font-medium text-stone-800">
                        {ABOUT_WHAT_WE_DO.leadPhrase}
                      </span>{" "}
                      {whatWeDoIntake}
                    </p>
                    <p>
                      <Link href={ABOUT_WHAT_WE_DO.intakeLink.href} className={linkClass}>
                        {ABOUT_WHAT_WE_DO.intakeLink.label} →
                      </Link>
                    </p>
                    <p className="text-sm leading-relaxed text-stone-500">
                      {ABOUT_WHAT_WE_DO.intakeDisclaimer}
                    </p>
                    <p className="text-sm leading-relaxed text-stone-500">
                      {ABOUT_WHAT_WE_DO.privacyNoteBefore}
                      <Link href={ABOUT_WHAT_WE_DO.privacyLink.href} className={linkClass}>
                        {ABOUT_WHAT_WE_DO.privacyLink.label}
                      </Link>
                      {ABOUT_WHAT_WE_DO.privacyNoteAfter}
                    </p>
                    <p className={bodyClass}>
                      {whatWeDoComparison}{" "}
                      <Link href={ABOUT_WHAT_WE_DO.methodologieLink.href} className={linkClass}>
                        {ABOUT_WHAT_WE_DO.methodologieLink.label} →
                      </Link>
                    </p>
                    <p className={bodyClass}>{ABOUT_WHAT_WE_DO.evidenceParagraph}</p>
                    <p className={bodyClass}>{whatWeDoPurpose}</p>
                    <div className="pt-6">
                      <h3 className="mb-8 font-serif text-2xl leading-tight text-stone-900 lg:text-3xl">
                        {ABOUT_WHAT_WE_DO.whatWeDontDoTitle}
                      </h3>
                      <div className="grid gap-x-8 gap-y-8 grid-cols-2">
                        {ABOUT_WHAT_WE_DO.whatWeDontDo.map((item, index) => (
                          <div key={item}>
                            <span className="font-serif text-2xl text-[#5A8F6A]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <p className="mt-3 text-base leading-relaxed text-stone-600">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Step 05: Transparantie — LEFT ──────────────────────── */}
              <section id={ABOUT_TRUST.id} className="py-14 md:py-16">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>05</span>
                  <h2 className={h2Class}>{ABOUT_TRUST.title}</h2>
                  <p className={bodyClass}>{ABOUT_TRUST.intro}</p>
                  <p className={bodyClass}>{trustAffiliate}</p>
                  <p className={bodyClass}>
                    Onze scores worden niet beïnvloed door commissie. De{" "}
                    <Link href="/methodologie" className={linkClass}>methodologie</Link>{" "}
                    en criteria staan vast. Meer details vind je in onze{" "}
                    <Link href={ABOUT_TRUST.affiliateLink.href} className={linkClass}>
                      {ABOUT_TRUST.affiliateLink.label}
                    </Link>
                    .
                  </p>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {ABOUT_TRUST.medicalDisclaimer}
                  </p>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div className="pr-16 space-y-6">
                    <span className={eyebrowClass}>05</span>
                    <h2 className={h2Class}>{ABOUT_TRUST.title}</h2>
                    <p className={bodyClass}>{ABOUT_TRUST.intro}</p>
                    <p className={bodyClass}>{trustAffiliate}</p>
                    <p className={bodyClass}>
                      Onze scores worden niet beïnvloed door commissie. De{" "}
                      <Link href="/methodologie" className={linkClass}>methodologie</Link>{" "}
                      en criteria staan vast. Meer details vind je in onze{" "}
                      <Link href={ABOUT_TRUST.affiliateLink.href} className={linkClass}>
                        {ABOUT_TRUST.affiliateLink.label}
                      </Link>
                      .
                    </p>
                    <p className="text-sm leading-relaxed text-stone-500">
                      {ABOUT_TRUST.medicalDisclaimer}
                    </p>
                  </div>
                  <StepNode number="05" />
                  <div />
                </div>
              </section>

              {/* ── Step 06: Achtergrond — RIGHT ───────────────────────── */}
              <section id={ABOUT_CREDENTIALS.id} className="py-14 md:py-16 -mx-6 px-6 bg-white lg:-mx-8 lg:px-8">
                {/* Mobile */}
                <div className="lg:hidden space-y-6">
                  <span className={eyebrowClass}>06 — Wie schrijft dit</span>
                  <h2 className={h2Class}>{ABOUT_CREDENTIALS.title}</h2>
                  <div className="mt-4 space-y-6">
                    <h3 className="font-serif text-2xl leading-tight text-stone-900 md:text-3xl">
                      {ABOUT_FOUNDER.name}
                    </h3>
                    <div className="space-y-3">
                      {ABOUT_FOUNDER.credentials.map((credential) => (
                        <p key={credential} className="text-sm uppercase tracking-widest text-stone-500">
                          {credential}
                        </p>
                      ))}
                    </div>
                    <p className={`${bodyClass} max-w-2xl italic text-stone-600`}>
                      {ABOUT_FOUNDER.roleNote}
                    </p>
                    <div className="max-w-2xl space-y-6">
                      {ABOUT_FOUNDER.bioParagraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 48)} className={bodyClass}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                  <div />
                  <StepNode number="06" />
                  <div className="pl-16 space-y-6">
                    <span className={eyebrowClass}>06 — Wie schrijft dit</span>
                    <h2 className={h2Class}>{ABOUT_CREDENTIALS.title}</h2>
                    <div className="mt-4 space-y-6">
                      <h3 className="font-serif text-2xl leading-tight text-stone-900 lg:text-3xl">
                        {ABOUT_FOUNDER.name}
                      </h3>
                      <div className="space-y-3">
                        {ABOUT_FOUNDER.credentials.map((credential) => (
                          <p key={credential} className="text-sm uppercase tracking-widest text-stone-500">
                            {credential}
                          </p>
                        ))}
                      </div>
                      <p className={`${bodyClass} italic text-stone-600`}>
                        {ABOUT_FOUNDER.roleNote}
                      </p>
                      <div className="space-y-6">
                        {ABOUT_FOUNDER.bioParagraphs.map((paragraph) => (
                          <p key={paragraph.slice(0, 48)} className={bodyClass}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            {/* ── END JOURNEY ──────────────────────────────────────────── */}

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className="py-20 md:py-28">
              <hr className="mb-20 border-stone-200 md:mb-28" />
              <div className="mx-auto max-w-2xl">
                <h2 className={h2Class}>{ABOUT_CTA.title}</h2>
                <p className={bodyClass}>{ABOUT_CTA.description}</p>
                <p className="mt-8">
                  <Link href={ABOUT_CTA.href} className={`${linkClass} text-lg`}>
                    {ABOUT_CTA.buttonLabel} →
                  </Link>
                </p>
              </div>
            </section>

            {/* ── CONTACT ──────────────────────────────────────────────── */}
            <section className="pb-24 md:pb-32">
              <p className="mx-auto max-w-2xl text-base text-stone-500 md:text-lg">
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
