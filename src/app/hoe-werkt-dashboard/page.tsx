import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { canonicalMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Hoe Werkt Jouw Dashboard? | PerfectSupplement",
  description:
    "Zie hoe het dashboard je check-ins bewaart, prioriteiten laat verschuiven en je helpt kiezen waar je deze week begint.",
  ...canonicalMetadata("/hoe-werkt-dashboard"),
};

export default function HoeWerktDashboardPage() {
  return (
    <main className="bg-[var(--ps-bg)] pb-20 pt-16 md:pt-20">
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Dashboard uitleg
            </p>
            <h1 className="mb-4 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
              Zo werkt je dashboard na de Leefstijlcheck
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
              Het dashboard laat niet alleen je score zien, maar vooral waar je
              nu de meeste winst pakt. Je ziet wat verschuift over tijd en welke
              check-in nu logisch is.
            </p>
          </header>

          <section className="mb-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-2 text-base font-semibold text-stone-900">
                1) Startpunt
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                Je ziet direct welke pijler nu het meeste lekt: slaap, stress,
                voeding of beweging.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-2 text-base font-semibold text-stone-900">
                2) Check-ins
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                Met korte check-ins houd je het ritme vast. Zo blijft je plan
                haalbaar en niet theoretisch.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-2 text-base font-semibold text-stone-900">
                3) Voortgang
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                Je ziet trends en prioriteitsverschuivingen, zodat je bijstuurt
                op data in plaats van gevoel.
              </p>
            </div>
          </section>

          <section className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
            <h2 className="mb-3 font-serif text-3xl text-stone-900">
              Waarom dit helpt
            </h2>
            <p className="mb-4 text-base leading-relaxed text-stone-600">
              Veel mannen beginnen steeds opnieuw. Het dashboard doorbreekt dat
              patroon: je ziet waar je staat, waar je begint, en wat echt
              verschuift sinds je vorige check.
            </p>
            <p className="text-base leading-relaxed text-stone-600">
              Geen diagnose, wel een praktische route met meetmomenten die je
              consistent houdt.
            </p>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-6 md:p-8">
            <h2 className="mb-4 font-serif text-3xl text-stone-900">
              Klaar om te starten?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
              >
                Open mijn dashboard →
              </Link>
              <Link
                href="/intake"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
              >
                Doe eerst de Leefstijlcheck →
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              Lees ook{" "}
              <Link
                href="/methodologie"
                className="font-medium text-stone-800 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
              >
                onze methodologie
              </Link>{" "}
              en bekijk de{" "}
              <Link
                href="/privacy"
                className="font-medium text-stone-800 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
              >
                privacyuitleg
              </Link>
              .
            </p>
          </section>
        </article>
      </Container>
    </main>
  );
}
