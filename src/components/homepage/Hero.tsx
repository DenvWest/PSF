import Link from "next/link";
import Container from "@/components/layout/Container";
import { HOMEPAGE_HERO, HOMEPAGE_LIFESTYLE } from "@/data/homepage";

function CheckBullet({ children }: { children: string }) {
  return (
    <li className="flex gap-2.5 text-sm leading-snug text-stone-700 sm:text-[15px]">
      <span
        className="mt-0.5 shrink-0 font-semibold text-emerald-600"
        aria-hidden
      >
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function Hero() {
  const {
    eyebrow,
    headline,
    subheadline,
    bullets,
    primaryCta,
    secondaryCta,
    microCopy,
    footnoteLabel,
    footnoteHref,
  } = HOMEPAGE_HERO;

  return (
    <section className="relative border-b border-stone-200/50 bg-[var(--ps-bg)]">
      <HeroBackground />

      <Container className="relative max-w-screen-xl">
        <div className="max-w-3xl py-[clamp(2rem,5vh,4rem)]">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[2px] text-stone-500">
            {eyebrow}
          </p>

          <h1 className="text-pretty text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
            {headline}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
            {subheadline}
          </p>

          <ul className="mt-6 space-y-2.5">
            {bullets.map((bullet) => (
              <CheckBullet key={bullet}>{bullet}</CheckBullet>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/intake"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ps-bg)]"
            >
              {primaryCta}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`#${HOMEPAGE_LIFESTYLE.sectionId}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ps-bg)]"
            >
              {secondaryCta}
            </Link>
          </div>

          <p className="mt-3 text-xs text-stone-500">{microCopy}</p>

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
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.6),transparent_55%)]"
      aria-hidden
    />
  );
}
