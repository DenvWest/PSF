"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BlogArtikel, BlogCategorie } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import BlogCategorieBadge from "./BlogCategorieBadge";

const FILTERS: { label: string; value: string }[] = [
  { label: "Alles", value: "" },
  { label: "Stress", value: "stress" },
  { label: "Slaap", value: "slaap" },
  { label: "Energie", value: "energie" },
];

interface BlogOverzichtContentProps {
  artikelen: BlogArtikel[];
}

export default function BlogOverzichtContent({
  artikelen,
}: BlogOverzichtContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategorie = searchParams.get("categorie") ?? "";

  const gefilterd =
    activeCategorie === ""
      ? artikelen
      : artikelen.filter((a) => a.categorie === activeCategorie);

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("categorie", value);
    } else {
      params.delete("categorie");
    }
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }

  return (
    <section aria-labelledby="blog-artikelen-heading">
      <h2 id="blog-artikelen-heading" className="sr-only">
        Artikelen
      </h2>

      {/* Categorie filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter op categorie">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleFilter(filter.value)}
            aria-pressed={activeCategorie === filter.value}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors duration-150 ${
              activeCategorie === filter.value
                ? "bg-stone-900 text-white"
                : "border border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {gefilterd.length === 0 && (
        <p className="mt-16 text-sm text-stone-400">
          Geen artikelen gevonden in deze categorie.
        </p>
      )}

      {/* Artikel-grid */}
      {gefilterd.length > 0 && (
        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {gefilterd.map((artikel) => (
            <ArtikelCard key={artikel.slug} artikel={artikel} />
          ))}
        </div>
      )}
    </section>
  );
}

function ArtikelCard({ artikel }: { artikel: BlogArtikel }) {
  const introSnippet = artikel.heroIntro.split(". ").slice(0, 2).join(". ");
  const snippet = introSnippet.endsWith(".")
    ? introSnippet
    : `${introSnippet}.`;

  return (
    <Link
      href={blogArtikelPad(artikel)}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <BlogCategorieBadge
        categorie={artikel.categorie as BlogCategorie}
        className="self-start"
      />

      <h2 className="mt-3 text-base font-semibold leading-snug text-stone-900 transition group-hover:text-stone-600">
        {artikel.titel}
      </h2>

      <p className="mt-1 text-xs text-stone-400">{artikel.leestijd} leestijd</p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-500 line-clamp-3">
        {snippet}
      </p>

      <p className="mt-4 text-sm font-medium text-stone-400 transition group-hover:text-stone-800">
        →
      </p>
    </Link>
  );
}
