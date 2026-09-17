import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { INTAKE_CTA } from "@/lib/intake-product-copy";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description:
    "Deze pagina bestaat niet (meer). Ga naar de homepage, de supplementgidsen of doe de Leefstijlcheck.",
  robots: { index: false, follow: true },
};

const suggestions = [
  {
    href: "/supplementen",
    title: "Supplementen",
    description: "Vergelijk werkzame stoffen op dosering, vorm en prijs per dag.",
  },
  {
    href: "/gidsen",
    title: "Gezondheidsgidsen",
    description: "Compacte, onderbouwde gidsen per leefstijlthema.",
  },
  {
    href: "/intake",
    title: "Leefstijlcheck",
    description: "18 vragen, 3 minuten — een persoonlijk overzicht van slaap, stress, energie en herstel.",
  },
];

export default function NotFound() {
  return (
    <main className="text-stone-900">
      <Container>
        <div className="py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Foutcode 404
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
              Deze pagina bestaat niet
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              De link klopt niet meer, of de pagina is verplaatst. Ga verder via de homepage, of kies
              hieronder een van onze meest gebruikte pagina&apos;s.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
              >
                Naar de homepage
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
              >
                {INTAKE_CTA.discoverOverview}
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
            {suggestions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-ps-green/30"
              >
                <h2 className="font-display text-base font-semibold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                  Bekijk →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
