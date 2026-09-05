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
            className="group flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 p-5 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/30 hover:shadow-[0_6px_18px_rgba(90,143,106,0.14)] active:translate-y-0"
          >
            <BlogCategorieBadge categorie={artikel.categorie} />
            <h3 className="text-sm font-semibold leading-snug text-stone-900 transition-colors group-hover:text-ps-green">
              {artikel.titel}
            </h3>
            <p className="text-xs text-stone-400">{artikel.leestijd} leestijd</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
