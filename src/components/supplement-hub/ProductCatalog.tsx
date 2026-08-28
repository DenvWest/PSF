"use client";

import { useMemo, useState, type ReactNode } from "react";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { HubProduct } from "@/lib/supplement-hub/product-catalog";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import CatalogSidebar, {
  type CategorieOptie,
} from "@/components/supplement-hub/CatalogSidebar";
import ProductCatalogCard from "@/components/supplement-hub/ProductCatalogCard";

type SortKey = "score" | "kosten" | "categorie";
type Weergave = "lijst" | "raster";

const SORT_LABELS: Record<SortKey, string> = {
  score: "Hoogste PS-Score",
  kosten: "Laagste prijs per dag",
  categorie: "Op categorie",
};

const PERSOONLIJK = "past-bij-jou";

/** Lijst = één product per rij met alle cijfers naast elkaar; raster = twee
 *  kaarten naast elkaar om ze sneller te kunnen vergelijken. */
const WEERGAVEN: ReadonlyArray<{
  key: Weergave;
  label: string;
  icoon: ReactNode;
}> = [
  {
    key: "lijst",
    label: "Lijst — één product per rij",
    icoon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M2 3.5h11M2 7.5h11M2 11.5h11" />
      </svg>
    ),
  },
  {
    key: "raster",
    label: "Raster — twee producten naast elkaar",
    icoon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <rect x="1.8" y="1.8" width="4.9" height="4.9" rx="1" />
        <rect x="8.3" y="1.8" width="4.9" height="4.9" rx="1" />
        <rect x="1.8" y="8.3" width="4.9" height="4.9" rx="1" />
        <rect x="8.3" y="8.3" width="4.9" height="4.9" rx="1" />
      </svg>
    ),
  },
];

type ProductCatalogProps = {
  products: HubProduct[];
  personalization: HubPersonalization;
};

export default function ProductCatalog({
  products,
  personalization,
}: ProductCatalogProps) {
  /** Alleen matches die ook echt een product in de catalogus hebben. */
  const persoonlijkeMatches = useMemo(() => {
    if (personalization.state !== "ready") return [];
    const aanwezig = new Set(products.map((product) => product.category));
    return personalization.matches.filter((match) =>
      aanwezig.has(match.category),
    );
  }, [personalization, products]);

  /** Reden per categorie; leeg zolang er geen check + voedingscheck is. */
  const persoonlijkeRedenen = useMemo(() => {
    const redenen = new Map<string, string>();
    for (const match of persoonlijkeMatches) {
      redenen.set(match.category, match.reason);
    }
    return redenen;
  }, [persoonlijkeMatches]);

  const persoonlijkAantal = useMemo(
    () =>
      products.filter((product) => persoonlijkeRedenen.has(product.category))
        .length,
    [products, persoonlijkeRedenen],
  );

  const [categorie, setCategorie] = useState<string>(
    persoonlijkAantal > 0 ? PERSOONLIJK : "alles",
  );
  const [alleenClaim, setAlleenClaim] = useState(false);
  const [alleenGetest, setAlleenGetest] = useState(false);
  const [sort, setSort] = useState<SortKey>("score");
  const [weergave, setWeergave] = useState<Weergave>("lijst");

  const categorieen = useMemo<CategorieOptie[]>(() => {
    const seen = new Map<string, CategorieOptie>();
    for (const product of products) {
      const bestaand = seen.get(product.category);
      if (bestaand) {
        bestaand.count += 1;
        continue;
      }
      seen.set(product.category, {
        slug: product.category,
        label: product.categoryLabel,
        count: 1,
      });
    }
    return [
      { slug: "alles", label: "Alles", count: products.length },
      ...seen.values(),
    ];
  }, [products]);

  /** Aantal producten dat de hoogste score in zijn categorie deelt. */
  const tieCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.kwaliteitsrang.position !== 1) continue;
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const zichtbaar = useMemo(() => {
    const gefilterd = products.filter((product) => {
      if (
        categorie === PERSOONLIJK &&
        !persoonlijkeRedenen.has(product.category)
      ) {
        return false;
      }
      if (
        categorie !== "alles" &&
        categorie !== PERSOONLIJK &&
        product.category !== categorie
      ) {
        return false;
      }
      if (alleenClaim && product.claimStance !== "voldoet") return false;
      if (alleenGetest && !product.thirdPartyTested) return false;
      return true;
    });

    return [...gefilterd].sort((a, b) => {
      if (sort === "kosten") {
        return a.cost.centenPerDag - b.cost.centenPerDag;
      }
      if (sort === "categorie") {
        return (
          a.categoryLabel.localeCompare(b.categoryLabel) ||
          a.kwaliteitsrang.position - b.kwaliteitsrang.position
        );
      }
      return b.score.total - a.score.total;
    });
  }, [
    products,
    categorie,
    persoonlijkeRedenen,
    alleenClaim,
    alleenGetest,
    sort,
  ]);

  function meldFilter(facet: string, waarde: string) {
    trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_FILTER, { facet, waarde });
    clarityTag(`supplementen_${facet}`, waarde);
  }

  function kiesCategorie(slug: string) {
    setCategorie(slug);
    meldFilter("categorie", slug);
  }

  function kiesWeergave(waarde: Weergave) {
    setWeergave(waarde);
    meldFilter("weergave", waarde);
  }

  const filtersActief =
    categorie !== "alles" || alleenClaim || alleenGetest;

  const kop =
    categorie === PERSOONLIJK
      ? "Past bij jou"
      : categorie === "alles"
        ? "Alle supplementen"
        : (categorieen.find((optie) => optie.slug === categorie)?.label ??
          "Alle supplementen");

  return (
    <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-12">
      <CatalogSidebar
        personalization={personalization}
        productCount={products.length}
        matchNamen={persoonlijkeMatches.map((match) => match.name)}
        persoonlijkAantal={persoonlijkAantal}
        persoonlijkActief={categorie === PERSOONLIJK}
        onPersoonlijkToggle={() =>
          kiesCategorie(categorie === PERSOONLIJK ? "alles" : PERSOONLIJK)
        }
        categorieen={categorieen}
        categorie={categorie}
        onCategorie={kiesCategorie}
        alleenClaim={alleenClaim}
        onAlleenClaim={() => {
          setAlleenClaim(!alleenClaim);
          meldFilter("eu_claim", alleenClaim ? "uit" : "aan");
        }}
        alleenGetest={alleenGetest}
        onAlleenGetest={() => {
          setAlleenGetest(!alleenGetest);
          meldFilter("onafhankelijk_getest", alleenGetest ? "uit" : "aan");
        }}
        filtersActief={filtersActief}
        onWisFilters={() => {
          setCategorie("alles");
          setAlleenClaim(false);
          setAlleenGetest(false);
          meldFilter("wis_filters", "alles");
        }}
      />

      <section aria-label="Producten" className="mt-10 min-w-0 lg:mt-0">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-stone-900 md:text-2xl">
              {kop}
            </h1>
            <p aria-live="polite" className="mt-1 text-sm text-stone-500">
              {zichtbaar.length} van {products.length} producten
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex min-w-0 items-center gap-2 text-sm text-stone-600">
              <span className="flex-shrink-0">Sorteer op</span>
              <select
                value={sort}
                onChange={(event) => {
                  const waarde = event.target.value as SortKey;
                  setSort(waarde);
                  trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_SORTERING, {
                    sortering: waarde,
                  });
                  clarityTag("supplementen_sortering", waarde);
                }}
                className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green sm:flex-none"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <div
              role="group"
              aria-label="Weergave"
              className="flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5"
            >
              {WEERGAVEN.map((optie) => (
                <button
                  key={optie.key}
                  type="button"
                  onClick={() => kiesWeergave(optie.key)}
                  aria-pressed={weergave === optie.key}
                  title={optie.label}
                  className={`rounded-md px-2.5 py-1.5 transition-colors ${
                    weergave === optie.key
                      ? "bg-ps-green text-white"
                      : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                  }`}
                >
                  <span className="sr-only">{optie.label}</span>
                  {optie.icoon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {zichtbaar.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-stone-600">
              Geen product voldoet aan deze combinatie. Zet een filter uit om
              verder te kijken.
            </p>
          </div>
        ) : (
          <ul
            className={
              weergave === "raster"
                ? "mt-5 grid grid-cols-2 gap-3"
                : "mt-5 space-y-3"
            }
            role="list"
          >
            {zichtbaar.map((product) => (
              <li key={product.key}>
                <ProductCatalogCard
                  product={product}
                  tieCount={tieCounts.get(product.category) ?? 1}
                  persoonlijkeReden={
                    persoonlijkeRedenen.get(product.category) ?? null
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
