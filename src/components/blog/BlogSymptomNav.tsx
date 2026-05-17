import Link from "next/link";
import type { IntentArticleLink } from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { getArtikelBySlug } from "@/data/blog";

interface BlogSymptomNavProps {
  links: IntentArticleLink[];
  topics: string[];
}

export default function BlogSymptomNav({ links, topics }: BlogSymptomNavProps) {
  const resolved = links
    .map((item) => {
      const artikel = getArtikelBySlug(item.slug);
      if (!artikel) return null;
      return { label: item.label, href: blogArtikelPad(artikel) };
    })
    .filter((item): item is { label: string; href: string } => item !== null);

  if (resolved.length === 0) return null;

  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <p className="ps-eyebrow">Veelgezocht</p>
      {topics.length > 0 ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-stone-500">
          {topics.slice(0, 4).join(" · ")}
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-stone-200/80 border-y border-stone-200/80">
        {resolved.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex min-h-11 items-center justify-between gap-4 py-3.5 text-base text-stone-700 transition hover:text-stone-900"
            >
              <span className="font-medium leading-snug">{item.label}</span>
              <span
                className="shrink-0 text-stone-400 transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
