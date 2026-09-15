import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import {
  VOEDING_HUB_META,
  voedingDatabaseStats,
  voedingHubCards,
} from "@/lib/voeding-public";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: VOEDING_HUB_META.title,
  description: VOEDING_HUB_META.description,
  ...canonicalMetadata("/voeding"),
  openGraph: {
    title: VOEDING_HUB_META.title,
    description: VOEDING_HUB_META.description,
    url: "/voeding",
    type: "website",
  },
};

export default function VoedingHubPage() {
  const cards = voedingHubCards();
  const stats = voedingDatabaseStats();

  return (
    <main className="pb-16 md:pb-20 py-12 md:py-16">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Leefstijl eerst
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Voeding per stof
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Vijf stoffen met een interventiepad: eerst je bord controleren, dan
            verbeteren, en pas daarna een supplement overwegen. Elke pagina toont
            welke bronnen per portie het meest bijdragen — naast elkaar, niet
            opgeteld.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            {stats.catalogCount} voedingsmiddelen in de database,{" "}
            {stats.verifiedCount} met NEVO-gehalte per portie.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/intake/voeding"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
            >
              Doe de voedingscheck (1 min) →
            </Link>
            <Link href="/voeding-na-40" className={`inline-flex min-h-11 items-center px-1 py-3 text-sm ${LINK}`}>
              Lees de voedingspijler →
            </Link>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <li key={card.slug}>
              <Link
                href={`/voeding/${card.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-white px-6 py-6 transition hover:border-ps-green/35 hover:shadow-[0_8px_24px_rgba(90,143,106,0.08)]"
              >
                <p className="font-display text-xl font-semibold text-stone-900 group-hover:text-ps-green">
                  {card.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{card.teaser}</p>
                <p className="mt-4 text-xs text-stone-500">
                  {card.bronCount} bronnen · {card.verifiedCount} NEVO-geverifieerd
                </p>
                <span className="mt-5 text-sm font-medium text-stone-700 group-hover:text-ps-green">
                  Bekijk bronnen per portie →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-xl border border-stone-200 bg-stone-50/70 px-6 py-5 text-sm leading-relaxed text-stone-600">
          <p className="font-semibold text-stone-800">Hoe dit verschilt van vergelijkingen</p>
          <p className="mt-2">
            Op{" "}
            <Link href="/supplementen" className={LINK}>
              supplementgidsen
            </Link>{" "}
            en{" "}
            <Link href="/beste/magnesium" className={LINK}>
              vergelijkingspagina&apos;s
            </Link>{" "}
            kies je een product. Hier kies je uit je bord — de stap die in de
            praktijk vaak wordt overgeslagen.
          </p>
        </div>

        <MedicalDisclaimer className="mt-10" />
      </Container>
    </main>
  );
}
