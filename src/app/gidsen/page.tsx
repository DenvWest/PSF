import type { Metadata } from "next";
import Link from "next/link";
import GuideCard from "@/components/gidsen/GuideCard";
import Container from "@/components/layout/Container";
import {
  FILTER_CATEGORIES,
  filterGuides,
  type FilterCategory,
} from "@/data/guides";
import { canonicalMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title:
    "Gratis gidsen: slaap, stress, energie, beweging en herstel | PerfectSupplement",
  description:
    "Compacte, onderbouwde gidsen voor mannen 40+. Kies slaap, stress, energie, beweging, herstel of testosteron — gratis via e-mail of webgids.",
  ...canonicalMetadata("/gidsen"),
};

type GidsenPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

function resolveFilter(filterParam: string | undefined): FilterCategory | "alle" {
  if (!filterParam || filterParam === "alle") {
    return "alle";
  }

  const match = FILTER_CATEGORIES.find(
    (category) => category.key === filterParam,
  );

  if (!match || match.key === "alle") {
    return "alle";
  }

  return match.key;
}

export default async function GidsenPage({ searchParams }: GidsenPageProps) {
  const params = await searchParams;
  const activeFilter = resolveFilter(params.filter);
  const guides = filterGuides(activeFilter);

  return (
    <main className="bg-[#F7F5F0] text-[#1B2620]">
      <Container className="py-16 pb-24">
        <header className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D3C6] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5A8F6A]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[#5A8F6A]"
            />
            Gratis gidsen
          </div>
          <h1 className="mt-6 font-serif text-[clamp(34px,5vw,56px)] font-normal leading-[1.04] tracking-[-0.015em]">
            Begin bij rust, ritme en herstel.
          </h1>
          <p className="mt-5 max-w-[620px] text-[clamp(16px,1.6vw,19px)] leading-relaxed text-[#5A6560]">
            Compacte, onderbouwde gidsen voor mannen 40+. Geen wondermiddelen
            — wel houdbare gewoontes die je energie, slaap en veerkracht
            ondersteunen. Elke gids is een instap, geen eindpunt.
          </p>
        </header>

        <nav
          aria-label="Filter gidsen"
          className="mt-10 flex flex-wrap gap-2.5 border-b border-[#E7E3D8] pb-2"
        >
          {FILTER_CATEGORIES.map((category) => {
            const isActive = activeFilter === category.key;
            const href =
              category.key === "alle" ? "/gidsen" : `/gidsen?filter=${category.key}`;

            return (
              <Link
                key={category.key}
                href={href}
                className={`min-h-11 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "border-[#5A8F6A] bg-[#5A8F6A] text-white"
                    : "border-[#E4E0D6] bg-white text-[#46514B] hover:border-[#5A8F6A]/40"
                }`}
              >
                {category.label}
              </Link>
            );
          })}
        </nav>

        <section
          aria-label="Gidsen overzicht"
          className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6"
        >
          {guides.map((guide) => (
            <GuideCard key={guide.key} guide={guide} />
          ))}
        </section>

        <p className="mt-12 text-center text-sm text-[#8A9189]">
          Elke gids verbindt door naar de bijbehorende pillar, je profiel en de
          gratis Leefstijlcheck.
        </p>
      </Container>
    </main>
  );
}
