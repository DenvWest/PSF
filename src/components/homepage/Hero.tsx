import Container from "@/components/layout/Container";
import HeroCheckPreview from "@/components/homepage/HeroCheckPreview";
import HomeCheckCta from "@/components/homepage/HomeCheckCta";
import IntakeLastSessionLink from "@/components/intake/IntakeLastSessionLink";
import { HOMEPAGE_HERO } from "@/data/homepage";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ps-green"
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.12" />
      <path
        d="M6.25 10.15 8.6 12.5 13.85 7.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  const { eyebrow, headline, subheadline, bullets, primaryCtaMicro } = HOMEPAGE_HERO;

  return (
    <section className="relative border-b border-stone-200/50 bg-[#F7F5F0]">
      <HeroBackground />
      <GrainOverlay />

      <Container className="relative max-w-screen-xl">
        {/*
          Mobiel volgt de hero het IMU-model: kop gecentreerd, dan het beeld,
          dan pas de tekst. Vanaf lg klapt hij terug naar twee kolommen, met het
          beeld rechts naast de hele linkerkolom.
        */}
        <div className="flex flex-col gap-6 py-[clamp(2rem,5vh,5rem)] sm:gap-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-16 lg:gap-y-10">
          {/*
            `contents` laat kop en tekst op mobiel los meedoen in de flexkolom,
            zodat het beeld ertussen kan staan (IMU-model). Vanaf lg worden ze
            weer één cel, anders valt er een gat onder de kop.
          */}
          <div className="contents lg:col-start-1 lg:row-start-1 lg:block lg:max-w-2xl">
            <div className="order-1 text-center lg:order-none lg:text-left">
              <p className="mb-4 inline-flex rounded-full border border-ps-green/35 bg-white/50 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-ps-green">
                {eyebrow}
              </p>

              <h1 className="text-balance font-serif text-[1.625rem] leading-[1.2] text-stone-900 sm:text-[2.125rem] sm:leading-[1.15] lg:text-[2.75rem]">
                {headline}
              </h1>
            </div>

            <div className="order-3 max-w-2xl lg:order-none lg:mt-7">
              <p className="text-[15px] leading-relaxed text-stone-600 sm:text-base">
                {subheadline}
              </p>

              <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                {bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-2.5 text-sm leading-snug text-stone-700 sm:text-[15px]"
                  >
                    <CheckIcon />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 sm:mt-8">
                <HomeCheckCta location="homepage_hero" className="w-full sm:w-auto" />
                <p className="mt-3 text-xs text-stone-500">{primaryCtaMicro}</p>
                <IntakeLastSessionLink theme="light" className="mt-3 block" />
              </div>
            </div>
          </div>

          <div className="order-2 flex justify-center lg:order-none lg:col-start-2 lg:row-start-1 lg:justify-end">
            <HeroCheckPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,rgba(255,255,255,0.72),transparent_58%)]"
      aria-hidden
    />
  );
}

function GrainOverlay() {
  const grainSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
    </svg>`,
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,${grainSvg}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
      }}
      aria-hidden
    />
  );
}
