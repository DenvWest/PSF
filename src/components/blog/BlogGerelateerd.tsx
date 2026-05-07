import Link from "next/link";
import type { BlogArtikel } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import BlogCategorieBadge from "./BlogCategorieBadge";

interface BlogGerelateerProps {
  artikelen: BlogArtikel[];
}

export default function BlogGerelateerd({ artikelen }: BlogGerelateerProps) {
  if (artikelen.length === 0) return null;

  return (
    <section aria-labelledby="gerelateerd-heading">
      <h2
        id="gerelateerd-heading"
        className="font-display text-[0.9375rem] font-semibold text-stone-900 md:text-base"
      >
        Verder lezen
      </h2>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artikelen.map((artikel) => (
          <Link
            key={artikel.slug}
            href={blogArtikelPad(artikel)}
            className="group flex flex-col gap-2 rounded-xl border border-stone-200/95 bg-white p-5 transition-colors hover:border-stone-300 hover:bg-stone-50/85"
          >
            <BlogCategorieBadge categorie={artikel.categorie} />
            <h3 className="text-sm font-semibold leading-snug text-stone-900 transition group-hover:text-stone-600">
              {artikel.titel}
            </h3>
            <p className="text-xs text-stone-400">{artikel.leestijd} leestijd</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
