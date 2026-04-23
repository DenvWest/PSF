import { CATALOG, type ThemaTag } from "@/data/supplementen-hub/catalog";
import CategoryNav from "@/components/supplementen-hub/CategoryNav";
import SupplementCatalogCard from "@/components/supplementen-hub/SupplementCatalogCard";

function getUniqueThemas(): ThemaTag[] {
  const seen = new Set<ThemaTag>();
  const result: ThemaTag[] = [];
  for (const entry of CATALOG) {
    for (const thema of entry.themas) {
      if (!seen.has(thema)) {
        seen.add(thema);
        result.push(thema);
      }
    }
  }
  return result;
}

export default function SupplementCatalog() {
  const themas = getUniqueThemas();

  return (
    <section aria-label="Alle supplementgidsen">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">
          Alle supplementgidsen
        </h2>
        <p className="mt-2 text-sm text-stone-500 max-w-lg">
          Objectieve gidsen per supplement — geen rankings, wel onderbouwing.
        </p>
      </div>

      {/* Eén CategoryNav: chips boven het grid op mobiel, sidebar op desktop */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <div className="w-full flex-shrink-0 md:mb-0 md:w-48">
          <CategoryNav themas={themas} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((entry) => (
              <SupplementCatalogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
