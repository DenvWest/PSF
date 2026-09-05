import Image from "next/image";
import Link from "next/link";
import type { BlogArtikel } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { blogCover } from "@/lib/blog-cover";
import { CATEGORIE_CONFIG } from "@/data/blog/categorieen";
import BlogCategorieBadge from "./BlogCategorieBadge";

interface BlogArtikelKaartProps {
  artikel: BlogArtikel;
  /** Optionele beschrijving — overschrijft afleiding uit heroIntro */
  beschrijving?: string;
  /** Verberg categorie-badge (bijv. op hub-uitgelicht) */
  hideBadge?: boolean;
}

function korteBeschrijving(heroIntro: string): string {
  const snippet = heroIntro.split(". ").slice(0, 2).join(". ");
  return snippet.endsWith(".") ? snippet : `${snippet}.`;
}

export default function BlogArtikelKaart({
  artikel,
  beschrijving,
  hideBadge = false,
}: BlogArtikelKaartProps) {
  const accent = CATEGORIE_CONFIG[artikel.categorie].kleur.cardAccent;
  const cover = blogCover(artikel);

  return (
    <Link
      href={blogArtikelPad(artikel)}
      className={`group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/60 border-l-2 bg-[var(--ps-surface)] shadow-sm shadow-stone-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md ${accent}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-7">
        {!hideBadge ? (
          <BlogCategorieBadge categorie={artikel.categorie} className="self-start" />
        ) : null}

        <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-stone-900 md:text-xl">
          {artikel.titel}
        </h3>

        <p className="mt-2 text-xs text-stone-400">{artikel.leestijd} leestijd</p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
          {beschrijving ?? korteBeschrijving(artikel.heroIntro)}
        </p>

        <p className="mt-auto pt-6 text-sm text-stone-500 transition group-hover:text-stone-700">
          Lezen →
        </p>
      </div>
    </Link>
  );
}
