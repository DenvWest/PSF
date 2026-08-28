"use client";

import { useMemo, useState } from "react";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { HubProduct } from "@/lib/supplement-hub/product-catalog";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import HubPersonalBar from "@/components/supplement-hub/HubPersonalBar";
import ProductCatalogCard from "@/components/supplement-hub/ProductCatalogCard";
import ScoreMethodeBanner from "@/components/supplement-hub/ScoreMethodeBanner";

type SortKey = "score" | "kosten" | "categorie";

const SORT_LABELS: Record<SortKey, string> = {
  score: "Hoogste PS-Score",
  kosten: "Laagste prijs per dag",
  categorie: "Op categorie",
};

const PERSOONLIJK = "past-bij-jou";

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

  const categorieen = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      if (!seen.has(product.category)) {
        seen.set(product.category, product.categoryLabel);
      }
    }
    return [...seen.entries()];
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
      if (categorie === PERSOONLIJK && !persoonlijkeRedenen.has(product.category)) {
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

  const chipClass = (actief: boolean) =>
    actief
      ? "bg-ps-green text-white font-semibold shadow-sm"
      : "bg-white text-stone-600 border border-stone-200 hover:border-ps-green/30 hover:text-ps-green";

  const persoonlijkChipClass = (actief: boolean) =>
    actief
      ? "bg-ps-green text-white font-semibold shadow-sm"
      : "bg-[#F0FAF3] text-[#3D6B4F] border border-[#5A8F6A]/30 font-medium hover:border-ps-green";

  return (
    <section aria-label="Alle supplementproducten">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">
          Vind het supplement dat bij jouw doel past
        </h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          {products.length} producten langs dezelfde meetlat: een berekende
          PS-Score van 0–100 op dosering, vorm, zuiverheid en
          EU-claimvoorwaarde. Prijs telt niet mee in de score — die staat er los
          naast, per claim-conforme dag.
        </p>
      </div>

      <HubPersonalBar
        personalization={personalization}
        productCount={products.length}
        matchNamen={persoonlijkeMatches.map((match) => match.name)}
        className="mt-6"
      />

      <ScoreMethodeBanner className="mt-4" />

      <div className="mt-8 space-y-4">
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
          role="group"
          aria-label="Filter op categorie"
        >
          {persoonlijkAantal > 0 ? (
            <button
              type="button"
              onClick={() => {
                setCategorie(PERSOONLIJK);
                meldFilter("categorie", PERSOONLIJK);
              }}
              aria-pressed={categorie === PERSOONLIJK}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all ${persoonlijkChipClass(categorie === PERSOONLIJK)}`}
            >
              Past bij jou · {persoonlijkAantal}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setCategorie("alles");
              meldFilter("categorie", "alles");
            }}
            aria-pressed={categorie === "alles"}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all ${chipClass(categorie === "alles")}`}
          >
            Alles
          </button>
          {categorieen.map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              onClick={() => {
                setCategorie(slug);
                meldFilter("categorie", slug);
              }}
              aria-pressed={categorie === slug}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all ${chipClass(categorie === slug)}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Verfijn">
            <button
              type="button"
              onClick={() => {
                setAlleenClaim(!alleenClaim);
                meldFilter("eu_claim", alleenClaim ? "uit" : "aan");
              }}
              aria-pressed={alleenClaim}
              className={`rounded-full px-4 py-2 text-sm transition-all ${chipClass(alleenClaim)}`}
            >
              Voldoet aan EU-claim
            </button>
            <button
              type="button"
              onClick={() => {
                setAlleenGetest(!alleenGetest);
                meldFilter("onafhankelijk_getest", alleenGetest ? "uit" : "aan");
              }}
              aria-pressed={alleenGetest}
              className={`rounded-full px-4 py-2 text-sm transition-all ${chipClass(alleenGetest)}`}
            >
              Onafhankelijk getest
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-600">
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
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-stone-500">
        {zichtbaar.length} van {products.length} producten
        {categorie === PERSOONLIJK ? " — jouw selectie" : ""}
      </p>

      {zichtbaar.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
          <p className="text-sm text-stone-600">
            Geen product voldoet aan deze combinatie. Zet een filter uit om
            verder te kijken.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zichtbaar.map((product) => (
            <ProductCatalogCard
              key={product.key}
              product={product}
              tieCount={tieCounts.get(product.category) ?? 1}
              persoonlijkeReden={persoonlijkeRedenen.get(product.category) ?? null}
            />
          ))}
        </div>
      )}

    </section>
  );
}
