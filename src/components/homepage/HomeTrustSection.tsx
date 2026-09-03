import Link from "next/link";
import Container from "@/components/layout/Container";
import HomeComparisonsLink from "@/components/homepage/HomeComparisonsLink";
import { HOMEPAGE_TRUST } from "@/data/homepage";

export default function HomeTrustSection() {
  const {
    title,
    intro,
    points,
    cta,
    ctaHref,
    affiliateMicro,
    affiliateMicroLinkLabel,
    affiliateMicroLinkHref,
  } = HOMEPAGE_TRUST;

  return (
    <section
      className="border-t border-stone-200/60 bg-white px-6 py-16 lg:px-8 lg:py-24"
      aria-labelledby="belofte-heading"
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2
            id="belofte-heading"
            className="font-serif text-2xl leading-tight text-stone-900 sm:text-3xl"
          >
            {title}
          </h2>
          <p className="home-lead mt-5 text-stone-600">{intro}</p>

          <ul className="mt-9 space-y-5 border-l border-stone-200 pl-6">
            {points.map((point) => (
              <li key={point} className="text-sm leading-relaxed text-stone-600 sm:text-[15px]">
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Link
              href={ctaHref}
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-ps-green transition hover:text-ps-green-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50"
            >
              {cta} →
            </Link>
            <HomeComparisonsLink />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-stone-500">
            {affiliateMicro}{" "}
            <Link
              href={affiliateMicroLinkHref}
              className="underline underline-offset-2 transition hover:text-stone-700"
            >
              {affiliateMicroLinkLabel}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
