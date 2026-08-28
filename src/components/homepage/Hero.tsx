import Link from "next/link";
import Container from "@/components/layout/Container";
import HomeHeroCtas from "@/components/homepage/HomeHeroCtas";
import IntakeLastSessionLink from "@/components/intake/IntakeLastSessionLink";
import { HOMEPAGE_HERO } from "@/data/homepage";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0 text-ps-green"
      aria-hidden
    >
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.15" opacity="0.35" />
      <path
        d="M6.25 10.15 8.6 12.5 13.85 7.35"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckBullet({
  children,
  index,
}: {
  children: string;
  index: number;
}) {
  return (
    <li
      className="hero-check-item flex gap-3 text-sm leading-snug text-stone-700 motion-safe:animate-[fadeIn_0.45s_ease-out_forwards] motion-safe:opacity-0 motion-reduce:animate-none motion-reduce:opacity-100 sm:text-[15px]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

export default function Hero() {
  const {
    bullets,
    headline,
    subheadline,
    eyebrow,
    affiliateMicro,
    affiliateMicroLinkLabel,
    affiliateMicroLinkHref,
  } = HOMEPAGE_HERO;

  return (
    <section className="relative border-b border-stone-200/50 bg-[#F7F5F0]">
      <HeroBackground />
      <GrainOverlay />

      <Container className="relative max-w-screen-xl">
        <div className="max-w-3xl py-[clamp(2.5rem,6vh,4.5rem)]">
          <p className="mb-5 inline-flex rounded-full border border-ps-green/35 bg-white/50 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-ps-green">
            {eyebrow}
          </p>

          <h1 className="text-pretty text-3xl font-normal leading-[1.14] tracking-[0.01em] text-stone-900 sm:text-[2rem] sm:leading-[1.12] lg:text-[2.35rem]">
            {headline}
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-stone-600 sm:text-base">
            {subheadline}
          </p>

          <ul className="mt-7 space-y-3">
            {bullets.map((bullet, index) => (
              <CheckBullet key={bullet} index={index}>
                {bullet}
              </CheckBullet>
            ))}
          </ul>

          <div className="mt-9">
            <HomeHeroCtas />
          </div>

          <p className="mt-4 max-w-xl text-xs leading-relaxed text-stone-500">
            {affiliateMicro}{" "}
            <Link
              href={affiliateMicroLinkHref}
              className="underline underline-offset-2 transition hover:text-stone-700"
            >
              {affiliateMicroLinkLabel}
            </Link>
          </p>

          <IntakeLastSessionLink theme="light" className="mt-3 block" />
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
