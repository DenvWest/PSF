import Link from "next/link";
import type { BlogArtikel } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import BlogCategorieBadge from "./BlogCategorieBadge";

interface BlogArtikelKaartProps {
  artikel: BlogArtikel;
  /** Optionele beschrijving — overschrijft afleiding uit heroIntro */
  beschrijving?: string;
}

function korteBeschrijving(heroIntro: string): string {
  const snippet = heroIntro.split(". ").slice(0, 2).join(". ");
  return snippet.endsWith(".") ? snippet : `${snippet}.`;
}

export default function BlogArtikelKaart({
  artikel,
  beschrijving,
}: BlogArtikelKaartProps) {
  return (
    <Link
      href={blogArtikelPad(artikel)}
      className="group flex min-h-0 flex-col rounded-2xl border border-stone-200/60 bg-white p-7 transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <BlogCategorieBadge categorie={artikel.categorie} className="self-start" />

      <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-stone-900 md:text-xl">
        {artikel.titel}
      </h3>

      <p className="mt-2 text-xs text-stone-400">{artikel.leestijd} leestijd</p>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
        {beschrijving ?? korteBeschrijving(artikel.heroIntro)}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.15em] text-stone-800">
        <span>Lees artikel</span>
        <span
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}
