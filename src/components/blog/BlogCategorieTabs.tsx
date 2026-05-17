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
        className="grid grid-cols-2 gap-px bg-stone-200/40 p-px md:flex md:gap-0 md:bg-transparent md:p-0"
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
              className={`relative flex min-h-[4.25rem] flex-col items-center justify-center bg-white px-3 py-3.5 text-center transition md:min-h-0 md:flex-1 md:shrink md:px-4 md:py-4 ${
                isActive ? "text-stone-900" : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-700"
              }`}
            >
              <span className="block whitespace-nowrap text-sm font-medium tracking-tight">
                {cat.naam}
              </span>
              <span
                className={`mt-0.5 block whitespace-nowrap text-xs tabular-nums ${
                  isActive ? "text-stone-500" : "text-stone-400"
                }`}
              >
                {aantal} {aantal === 1 ? "artikel" : "artikelen"}
              </span>
              <span
                className={`absolute inset-x-2 bottom-0 hidden h-0.5 rounded-full md:block md:inset-x-4 ${
                  isActive ? "bg-stone-900" : "bg-transparent"
                }`}
                aria-hidden
              />
              {isActive ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-stone-900 md:hidden"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
