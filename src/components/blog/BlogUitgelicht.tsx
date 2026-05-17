import Link from "next/link";
import type { BlogArtikel } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import Container from "@/components/layout/Container";
import BlogMeta from "@/components/blog/BlogMeta";
import { BLOG_BG_CLASS } from "@/components/blog/blog-layout";

interface BlogUitgelichtProps {
  artikelen: BlogArtikel[];
}

function korteBeschrijving(heroIntro: string): string {
  const snippet = heroIntro.split(". ").slice(0, 2).join(". ");
  return snippet.endsWith(".") ? snippet : `${snippet}.`;
}

export default function BlogUitgelicht({ artikelen }: BlogUitgelichtProps) {
  if (artikelen.length === 0) return null;

  return (
    <section className={`${BLOG_BG_CLASS} pb-12 md:pb-16`} aria-label="Uitgelicht">
      <Container>
        <p className="ps-eyebrow">Uitgelicht</p>
        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
          {artikelen.map((artikel) => (
            <article
              key={artikel.slug}
              className="border-t border-stone-200/80 pt-6 md:pt-7"
            >
              <Link href={blogArtikelPad(artikel)} className="group block">
                <h2 className="font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-stone-900 transition group-hover:text-stone-700 md:text-[2.375rem]">
                  {artikel.titel}
                </h2>
                <div className="mt-6 mb-5">
                  <BlogMeta
                    leestijd={artikel.leestijd}
                    gepubliceerdOp={artikel.gepubliceerdOp}
                    variant="featured"
                  />
                </div>
                <p className="line-clamp-3 text-base leading-[1.7] text-stone-500">
                  {korteBeschrijving(artikel.heroIntro)}
                </p>
                <p className="mt-6 text-base text-stone-500 transition group-hover:text-stone-700">
                  Lezen →
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
