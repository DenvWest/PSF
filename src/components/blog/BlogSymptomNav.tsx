import Link from "next/link";
import type { IntentArticleLink } from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { getArtikelBySlug } from "@/data/blog";
import { BLOG_EDITORIAL_LINK } from "@/components/blog/blog-layout";

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
    <nav aria-label="Onderwerpen in deze categorie" className="border-b border-stone-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="pt-6 text-[0.6875rem] font-medium tracking-wide text-stone-400">
          Veelgezocht: {topics.slice(0, 4).join(" · ")}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 py-4">
          {resolved.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={BLOG_EDITORIAL_LINK}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
