import Link from "next/link";
import type { BlogArtikel } from "@/types/blog";
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
        className="text-base font-semibold uppercase tracking-[0.12em] text-stone-400"
      >
        Gerelateerde artikelen
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artikelen.map((artikel) => (
          <Link
            key={artikel.slug}
            href={`/blog/${artikel.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
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
