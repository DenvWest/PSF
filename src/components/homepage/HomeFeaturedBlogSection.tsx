import Link from "next/link";
import Container from "@/components/layout/Container";
import BlogArtikelKaart from "@/components/blog/BlogArtikelKaart";
import { getArtikelBySlug } from "@/data/blog";

const FEATURED_SLUGS = [
  "cortisol-verlagen-natuurlijk",
  "ashwagandha-werking-mannen",
  "magnesium-en-slaapkwaliteit",
] as const;

const BESCHRIJVINGEN: Record<string, string> = {
  "cortisol-verlagen-natuurlijk":
    "Chronisch verhoogd cortisol beïnvloedt je slaap, stemming en gewicht. Ontdek vijf methodes die klinisch zijn onderzocht.",
  "ashwagandha-werking-mannen":
    "Wat doet ashwagandha precies, wat mag je verwachten en waar let je op bij het kiezen van een supplement?",
  "magnesium-en-slaapkwaliteit":
    "Magnesium speelt een rol bij melatonineaanmaak en spierontspanning. Welke vorm werkt het beste voor slaap?",
};

export default function HomeFeaturedBlogSection() {
  const artikelen = FEATURED_SLUGS.map((slug) => getArtikelBySlug(slug)).filter(
    (a): a is NonNullable<typeof a> => a !== undefined,
  );

  return (
    <section className="border-t border-stone-200/60 py-20 md:py-28">
      <Container>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-6 bg-stone-300" aria-hidden />
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-400">
            Blog
          </p>
        </div>

        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Uitgelichte artikelen
          </h2>
          <Link
            href="/blog"
            className="group flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
          >
            Alle artikelen
            <span
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {artikelen.map((artikel) => (
            <BlogArtikelKaart
              key={artikel.slug}
              artikel={artikel}
              beschrijving={BESCHRIJVINGEN[artikel.slug]}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
