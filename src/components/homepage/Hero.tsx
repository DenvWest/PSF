import Link from "next/link";
import Container from "@/components/layout/Container";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import IntakeLastSessionLink from "@/components/intake/IntakeLastSessionLink";
import { HOMEPAGE_HERO, HOMEPAGE_LIFESTYLE } from "@/data/homepage";

const HERO_BULLETS = [
  "Slaaptekort en verstoord herstel",
  "Chronische stress en mentale druk",
  "Te weinig beweging of juist te weinig herstel",
  "Overgewicht en metabole gezondheid",
] as const;

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
  const { primaryCta, secondaryCta, footnoteLabel, footnoteHref } = HOMEPAGE_HERO;

  return (
    <section className="relative border-b border-stone-200/50 bg-[#F7F5F0]">
      <HeroBackground />
      <GrainOverlay />

      <Container className="relative max-w-screen-xl">
        <div className="max-w-3xl py-[clamp(2.5rem,6vh,4.5rem)]">
          <p className="mb-5 inline-flex rounded-full border border-ps-green/35 bg-white/50 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-ps-green">
            VOOR MANNEN 40+
          </p>

          <h1 className="text-pretty text-4xl font-normal leading-[1.12] tracking-[0.01em] text-stone-900 sm:text-5xl lg:text-6xl">
            <span className="block">Minder energie na je 40e?</span>
            <span className="mt-1 block text-[0.92em] font-normal italic text-stone-500">
              Meestal ligt het niet aan testosteron.
            </span>
          </h1>

          <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-stone-600 sm:text-lg">
            <p>
              Testosteron daalt geleidelijk na je 40e — maar bij de meeste mannen is dat niet
              de hoofdoorzaak van vermoeidheid, minder libido of trager herstel.
            </p>
            <p>
              Vaker spelen andere factoren een grotere rol: slaap, stress, lichaamsgewicht en
              beweging.
            </p>
          </div>

          <ul className="mt-7 space-y-3">
            {HERO_BULLETS.map((bullet, index) => (
              <CheckBullet key={bullet} index={index}>
                {bullet}
              </CheckBullet>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/intake"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover hover:shadow-[0_6px_20px_rgba(90,143,106,0.32)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F5F0]"
            >
              {primaryCta}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`#${HOMEPAGE_LIFESTYLE.sectionId}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F5F0]"
            >
              {secondaryCta}
            </Link>
          </div>

          <IntakeCtaMicro className="mt-3 max-w-xl text-xs text-stone-500" />

          <IntakeLastSessionLink theme="light" className="mt-3 block" />

          <p className="mt-4 text-xs text-stone-400">
            <Link
              href={footnoteHref}
              className="underline decoration-stone-300 underline-offset-2 transition hover:text-stone-600 hover:decoration-stone-400"
            >
              {footnoteLabel}
            </Link>
          </p>
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
