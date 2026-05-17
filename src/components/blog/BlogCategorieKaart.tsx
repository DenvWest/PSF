import Link from "next/link";
import type { CategorieConfig } from "@/data/blog/categorieen";
import BlogCategorieIcon from "@/components/blog/BlogCategorieIcon";
import {
  BLOG_CATEGORY_ARROW,
  BLOG_CATEGORY_CARD,
  BLOG_CATEGORY_ICON_BOX,
  BLOG_CATEGORY_META,
  BLOG_NOISE_SVG,
} from "@/components/blog/blog-layout";

interface BlogCategorieKaartProps {
  config: CategorieConfig;
  artikelCount: number;
}

export default function BlogCategorieKaart({
  config,
  artikelCount,
}: BlogCategorieKaartProps) {
  const countLabel =
    artikelCount === 1 ? "1 artikel" : `${artikelCount} artikelen`;

  return (
    <Link
      href={`/blog/${config.id}`}
      className={`${BLOG_CATEGORY_CARD} ${config.kleur.bg}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{ backgroundImage: BLOG_NOISE_SVG }}
      />

      <div className="relative flex min-h-full flex-1 flex-col p-8 md:p-9">
        <div className={`${BLOG_CATEGORY_ICON_BOX} ${config.kleur.accent}`}>
          <BlogCategorieIcon categorie={config.id} className="h-[1.375rem] w-[1.375rem]" />
        </div>

        <div className="mt-auto flex flex-col pt-10 md:pt-12">
          <h2 className="font-display text-[1.375rem] font-semibold leading-tight tracking-tight text-white md:text-2xl">
            {config.naam}
          </h2>
          <p
            className={`mt-3.5 max-w-[28ch] text-sm leading-[1.65] md:mt-4 md:text-[0.9375rem] md:leading-relaxed ${config.kleur.tekst}`}
          >
            {config.beschrijving}
          </p>

          <div className="mt-8 flex w-full items-center justify-between gap-4 border-t border-white/10 pt-5 md:mt-9">
            <span className={BLOG_CATEGORY_META}>{countLabel}</span>
            <span className={BLOG_CATEGORY_ARROW} aria-hidden>
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
