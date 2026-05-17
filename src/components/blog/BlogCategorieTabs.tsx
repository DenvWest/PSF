import Link from "next/link";
import type { BlogCategorie } from "@/types/blog";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";

interface BlogCategorieTabsProps {
  activeId: BlogCategorie;
  aantalPerCategorie: Record<BlogCategorie, number>;
}

export default function BlogCategorieTabs({
  activeId,
  aantalPerCategorie,
}: BlogCategorieTabsProps) {
  return (
    <nav aria-label="Categorieën" className="border-b border-stone-200/70">
      <div
        className="-mb-px flex gap-0 overflow-x-auto overscroll-x-contain px-2 [-ms-overflow-style:none] [scrollbar-width:none] md:px-3 [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {ALLE_CATEGORIEEN.map((cat) => {
          const isActive = cat.id === activeId;
          const aantal = aantalPerCategorie[cat.id] ?? 0;

          return (
            <Link
              key={cat.id}
              href={`/blog/${cat.id}`}
              role="tab"
              aria-selected={isActive}
              className={`relative shrink-0 px-4 py-4 text-center transition first:pl-1 last:pr-1 sm:px-5 md:flex-1 md:px-4 ${
                isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <span className="block text-sm font-medium tracking-tight">{cat.naam}</span>
              <span
                className={`mt-0.5 block text-xs tabular-nums ${
                  isActive ? "text-stone-500" : "text-stone-400"
                }`}
              >
                {aantal} {aantal === 1 ? "artikel" : "artikelen"}
              </span>
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full transition md:inset-x-4 ${
                  isActive ? "bg-stone-900" : "bg-transparent"
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
