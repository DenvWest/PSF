import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import GidsCover from "@/components/gidsen/GidsCover";
import GuideOptIn, { GuideOptInRoot } from "@/components/gidsen/GuideOptIn";
import Container from "@/components/layout/Container";
import {
  GUIDE_TRUST_ITEMS,
  GUIDES,
  getGuideBySlug,
} from "@/data/guides";
import { canonicalMetadata } from "@/lib/seo/canonical";

type GuideLandingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.key }));
}

export async function generateMetadata({
  params,
}: GuideLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Gids niet gevonden | PerfectSupplement",
    };
  }

  return {
    title: `Gratis ${guide.title}gids | PerfectSupplement`,
    description: guide.heroSub,
    ...canonicalMetadata(`/gidsen/${guide.key}`),
  };
}

function BenefitCheckIcon() {
  return (
    <span
      aria-hidden
      className="block h-[11px] w-1.5 rotate-45 border-b-2 border-r-2 border-[color-mix(in_srgb,var(--ac)_80%,#1B2620)]"
      style={{ transform: "rotate(45deg) translate(-1px, -1px)" }}
    />
  );
}

export default async function GuideLandingPage({ params }: GuideLandingPageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const accentStyle = {
    "--ac": guide.accent,
  } as CSSProperties;

  return (
    <GuideOptInRoot guideTitle={guide.title} accent={guide.accent}>
      <main
        className="bg-[#F7F5F0] text-[#1B2620]"
        style={accentStyle}
      >
        <Container className="pt-6">
          <Link
            href="/gidsen"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#5A6560] transition-colors hover:text-[#1B2620]"
          >
            <span aria-hidden className="text-[17px]">
              ←
            </span>
            Alle gidsen
          </Link>
        </Container>

        <section className="pb-[72px] pt-8">
          <Container>
            <div className="flex flex-wrap items-start gap-14">
              <div className="min-w-[300px] flex-[1_1_480px]">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{
                    background: "color-mix(in srgb, var(--ac) 13%, #fff)",
                    color: "color-mix(in srgb, var(--ac) 70%, #1B2620)",
                  }}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-[var(--ac)]"
                  />
                  Gratis compacte gids · {guide.title}
                </div>

                <h1 className="mt-[22px] font-serif text-[clamp(34px,4.6vw,54px)] font-normal leading-[1.05] tracking-[-0.015em]">
                  {guide.heroTitle}
                </h1>
                <p className="mt-5 max-w-[540px] text-[clamp(16px,1.5vw,18.5px)] leading-relaxed text-[#5A6560]">
                  {guide.heroSub}
                </p>

                <ul className="mt-8 flex flex-col gap-3.5">
                  {guide.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3.5">
                      <span
                        className="mt-px flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: "color-mix(in srgb, var(--ac) 16%, #fff)",
                        }}
                      >
                        <BenefitCheckIcon />
                      </span>
                      <span className="text-base leading-normal text-[#33403A]">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <GuideOptIn variant="hero" />
              </div>

              <aside className="sticky top-24 flex min-w-[280px] flex-[1_1_340px] flex-col items-center">
                <div className="h-[500px] w-[316px]">
                  <GidsCover title={guide.title} accent={guide.accent} />
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2.5">
                  {["≈ 20 min leeswerk", "PDF direct", "Onderbouwd"].map(
                    (label) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-full border border-[#ECE8DD] bg-white px-4 py-2.5"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-[var(--ac)]"
                        />
                        <span className="text-[13.5px] font-semibold text-[#33403A]">
                          {label}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </aside>
            </div>
          </Container>
        </section>

        <section className="bg-[#102018] text-[#E7EDE8]">
          <Container className="py-[72px]">
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: "color-mix(in srgb, var(--ac) 60%, #9FB0A6)" }}
            >
              Herkenning
            </p>
            <h2 className="mt-4 max-w-[680px] font-serif text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.1] tracking-[-0.01em]">
              Past bij jou als…
            </h2>
            <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
              {guide.recognition.map((item) => (
                <article
                  key={item}
                  className="border-t-2 pt-[18px]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--ac) 55%, transparent)",
                  }}
                >
                  <p className="m-0 text-[17px] leading-normal text-[#D6DED8]">
                    {item}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-11 max-w-[620px] text-[15px] leading-relaxed text-[#8FA095]">
              Herken je jezelf? Dan is dit je startpunt. De gids is de eerste stap
              in een traject:{" "}
              <strong className="text-[#CDD7D0]">
                meten, begrijpen, verbeteren
              </strong>{" "}
              — geen losse PDF.
            </p>
          </Container>
        </section>

        <section className="pt-20">
          <Container>
            <div className="flex flex-wrap items-start gap-12">
              <div className="min-w-[320px] flex-[1_1_320px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5A8F6A]">
                  Onderbouwd, niet verzonnen
                </p>
                <h2 className="mt-4 font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.12]">
                  Evidence-based, in begrijpelijke taal.
                </h2>
                <p className="mt-[18px] max-w-[460px] text-base leading-[1.65] text-[#5A6560]">
                  We baseren ons op gangbare richtlijnen en peer-reviewed
                  onderzoek. Aannames en bronnen staan transparant in de gids
                  vermeld — zodat je zelf kunt nalezen waar het op rust.
                </p>
              </div>
              <div className="grid min-w-[360px] flex-[1_1_360px] grid-cols-2 gap-3.5">
                {GUIDE_TRUST_ITEMS.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-[#ECE8DD] bg-white p-5"
                  >
                    <h3 className="font-serif text-[15.5px] font-semibold text-[#1B2620]">
                      {item.title}
                    </h3>
                    <p className="mt-[7px] text-[13.5px] leading-normal text-[#5A6560]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-[72px]">
          <Container className="!max-w-[760px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5A8F6A]">
              Waarom deze gids
            </p>
            <div className="mt-7 flex flex-col gap-6">
              {guide.longform.map((paragraph) => (
                <p
                  key={paragraph}
                  className="m-0 text-[19px] leading-[1.72] text-[#33403A] [text-wrap:pretty]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <blockquote
              className="mt-12 border-l-[3px] border-[var(--ac)] py-2 pl-7 font-serif text-[30px] italic leading-[1.25] text-[#1B2620]"
            >
              {guide.pullquote}
            </blockquote>
          </Container>
        </section>

        <section className="pb-20">
          <Container>
            <div className="rounded-3xl border border-[#ECE8DD] bg-[#FBFAF6] p-[clamp(28px,4vw,48px)]">
              <h2 className="max-w-[560px] font-serif text-[clamp(24px,2.8vw,32px)] font-normal leading-[1.15]">
                De gids is je instap. Hier ga je verder.
              </h2>
              <p className="mt-3.5 max-w-[560px] text-[15.5px] leading-relaxed text-[#5A6560]">
                Een goede gewoonte begint met begrijpen waar je nu staat.
                Verdiep je in de onderwerpen die er voor jou toe doen — of meet
                je startpunt.
              </p>
              <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                {guide.verdieping.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-2xl border border-[#ECE8DD] bg-white p-[22px] transition-[border-color,transform] duration-250 hover:-translate-y-0.5 hover:border-[var(--ac)]"
                  >
                    <div className="text-[15.5px] font-bold text-[#1B2620]">
                      {item.label}
                    </div>
                    <div className="mt-1.5 text-[13.5px] leading-normal text-[#5A6560]">
                      {item.sub}
                    </div>
                    <div
                      className="mt-4 text-sm font-semibold"
                      style={{
                        color: "color-mix(in srgb, var(--ac) 78%, #1B2620)",
                      }}
                    >
                      Bekijk →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#102018] text-[#E7EDE8]">
          <Container className="!max-w-[760px] py-20 text-center">
            <h2 className="font-serif text-[clamp(28px,3.6vw,42px)] font-normal leading-[1.12]">
              Klaar om te beginnen?
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-relaxed text-[#9FB0A6]">
              Laat je e-mail achter en ontvang de gids{" "}
              <strong className="text-[#E7EDE8]">{guide.title}</strong> direct
              in je inbox.
            </p>
            <GuideOptIn variant="dark" />
          </Container>
        </section>

        <footer className="bg-[#0C150F] text-[#7E8C82]">
          <Container className="flex flex-wrap items-center justify-between gap-6 py-10">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden
                className="h-3.5 w-3.5 rotate-45 rounded-sm bg-[var(--ac)]"
              />
              <span className="font-semibold text-[#B7C2BA]">
                PerfectSupplement
              </span>
            </div>
            <p className="m-0 max-w-[680px] text-[12.5px] leading-relaxed">
              De informatie in deze gids bestaat uit algemene leefstijladviezen
              en is geen medische diagnose of behandeladvies. Heb je klachten?
              Raadpleeg dan je huisarts of een erkend zorgverlener.
            </p>
          </Container>
        </footer>
      </main>
    </GuideOptInRoot>
  );
}
