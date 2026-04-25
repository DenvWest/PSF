import type { Metadata } from "next";
import Link from "next/link";
import FaqSearch from "@/components/faq-search";
import Container from "@/components/layout/Container";
import { faqHelpCards, faqItems } from "@/data/contact-faq";

export const metadata: Metadata = {
  title: {
    absolute: "FAQ's | Perfect Supplement",
  },
  description:
    "Veelgestelde vragen, snelle routes en contactopties van Perfect Supplement.",
  alternates: { canonical: "/faqs" },
};

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-stone-200/80 bg-stone-50">
        <Container>
          <div className="max-w-6xl py-16 md:py-20 lg:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              FAQ&apos;S
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
              Veelgestelde vragen en snelle routes
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
              Zoek snel de juiste route of filter direct door de veelgestelde
              vragen heen.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-stone-100 bg-[var(--ps-bg)]">
        <Container>
          <div className="max-w-6xl py-14 md:py-16 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                Snel naar
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                Kies je route
              </h2>
              <p className="mt-4 text-base leading-7 text-stone-600 md:text-lg md:leading-8">
                Van veelgestelde vragen tot onze methodologie en zakelijke
                contacten. Alles op één plek, in dezelfde rustige toon als de
                rest van de site.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {faqHelpCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm ring-1 ring-stone-900/[0.04] transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold tracking-tight text-stone-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                    {card.description}
                  </p>
                  <p className="mt-6 text-sm font-medium text-stone-800 underline decoration-stone-300 underline-offset-4 transition group-hover:text-stone-800 group-hover:decoration-stone-400">
                    Open
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section
        id="veelgestelde-vragen"
        className="scroll-mt-24 border-b border-stone-100 bg-stone-50/60"
      >
        <Container>
          <div className="max-w-6xl py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14 xl:gap-20">
              <div className="lg:pt-1">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                  Veelgestelde vragen
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                  Antwoorden die bij ons horen
                </h2>
                <p className="mt-4 text-base leading-7 text-stone-600">
                  Korte, eerlijke antwoorden. Voor de volledige achtergrond kun
                  je altijd doorlinken naar{" "}
                  <Link
                    href="/methodologie"
                    className="font-medium text-stone-800 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
                  >
                    de methodologie
                  </Link>
                  .
                </p>
                <p className="mt-6 text-sm leading-6 text-stone-500">
                  Zoek hieronder direct op onderwerp, bijvoorbeeld samenwerking,
                  methodologie of reactietijd.
                </p>
              </div>

              <FaqSearch items={faqItems} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
