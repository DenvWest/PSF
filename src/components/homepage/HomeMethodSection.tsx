import Link from "next/link";
import Container from "@/components/layout/Container";
import { HOMEPAGE_METHOD } from "@/data/homepage";

const METHOD_ICONS = [
  (
    <svg key="claim" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <path d="M12 3L4 7v5c0 4.97 3.6 9.6 8 10.93C16.4 21.6 20 16.97 20 12V7L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.5 12l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg key="prijs" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg key="onafhankelijk" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14.2c.4.5 1.1.8 2 .8 1.2 0 2-.6 2-1.5 0-2-4-1.2-4-3.2 0-.9.8-1.5 2-1.5.9 0 1.6.3 2 .8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg key="datum" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 13.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
] as const;

export default function HomeMethodSection() {
  const { title, intro, cards, cta, ctaHref } = HOMEPAGE_METHOD;

  return (
    <section
      className="border-t border-stone-200/60 bg-[#FDFCFA] px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="methode-heading"
    >
      <Container>
        <h2
          id="methode-heading"
          className="font-serif text-2xl text-stone-900 sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
          {intro}
        </p>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item, index) => (
            <li
              key={item.label}
              className="list-none rounded-lg border border-stone-200 bg-white p-5"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                {METHOD_ICONS[index]}
              </span>
              <p className="text-sm font-semibold text-stone-900">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {item.description}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          className="mt-8 inline-flex min-h-[44px] items-center text-sm font-semibold text-ps-green transition hover:text-ps-green-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50"
        >
          {cta} →
        </Link>
      </Container>
    </section>
  );
}
