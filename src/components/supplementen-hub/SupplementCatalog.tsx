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

      {/* Mobile: chip row boven grid */}
      <div className="md:hidden mb-4">
        <CategoryNav themas={themas} />
      </div>

      <div className="md:flex md:gap-8">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-48 flex-shrink-0">
          <CategoryNav themas={themas} />
        </div>

        {/* Card grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATALOG.map((entry) => (
              <SupplementCatalogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
