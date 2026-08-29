"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import {
  matchesZoek,
  normalizeZoek,
  type HubProduct,
} from "@/lib/supplement-hub/product-catalog";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import CatalogSidebar, {
  type CategorieOptie,
} from "@/components/supplement-hub/CatalogSidebar";
import OnderbouwingPanel from "@/components/supplement-hub/OnderbouwingPanel";
import ProductCatalogCard from "@/components/supplement-hub/ProductCatalogCard";

type SortKey = "score" | "kosten" | "categorie";
type Weergave = "lijst" | "raster";

const SORT_LABELS: Record<SortKey, string> = {
  score: "Hoogste PS-Score",
  kosten: "Laagste prijs per dag",
  categorie: "Op categorie",
};

const PERSOONLIJK = "past-bij-jou";

/** Aantal producten per stap; de rest komt met "Toon meer". */
const PAGINA = 10;

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
  /** Categorie uit `?categorie=` — de catalogus opent er meteen op. */
  initieleCategorie?: string | null;
};

export default function ProductCatalog({
  products,
  personalization,
  initieleCategorie = null,
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

  /** Alleen een categorie die ook echt producten heeft; anders de hele lijst. */
  const startCategorie = useMemo(() => {
    if (!initieleCategorie) return null;
    return products.some((product) => product.category === initieleCategorie)
      ? initieleCategorie
      : null;
  }, [initieleCategorie, products]);

  const [categorie, setCategorie] = useState<string>(
    startCategorie ?? (persoonlijkAantal > 0 ? PERSOONLIJK : "alles"),
  );
  const [zoek, setZoek] = useState("");
  const [alleenClaim, setAlleenClaim] = useState(false);
  const [alleenGetest, setAlleenGetest] = useState(false);
  const [sort, setSort] = useState<SortKey>("score");
  const [weergave, setWeergave] = useState<Weergave>("lijst");
  const [limiet, setLimiet] = useState(PAGINA);

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
      if (!matchesZoek(product, zoek)) return false;
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
    zoek,
    sort,
  ]);

  const getoond = useMemo(
    () => zichtbaar.slice(0, limiet),
    [zichtbaar, limiet],
  );
  const restant = zichtbaar.length - getoond.length;

  /** Hoe vaak landt iemand hier met een categorie uit een andere pagina? Eén
   *  melding per bezoek, los van de klikken op de zijbalk. */
  const gemeldeStart = useRef(false);
  useEffect(() => {
    if (!startCategorie || gemeldeStart.current) return;
    gemeldeStart.current = true;
    trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_FILTER, {
      facet: "categorie_uit_link",
      waarde: startCategorie,
    });
    clarityTag("supplementen_categorie_uit_link", startCategorie);
  }, [startCategorie]);

  /** Meten we elke toetsaanslag, dan meten we ruis; dit meet de zoekopdracht. */
  const zoekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gemeldeZoekterm = useRef("");
  useEffect(() => {
    const term = normalizeZoek(zoek);
    if (term.length < 2 || term === gemeldeZoekterm.current) return;
    if (zoekTimer.current) clearTimeout(zoekTimer.current);
    zoekTimer.current = setTimeout(() => {
      gemeldeZoekterm.current = term;
      trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_ZOEK, {
        term,
        resultaten: zichtbaar.length,
      });
      clarityTag("supplementen_zoekterm", term);
    }, 700);
    return () => {
      if (zoekTimer.current) clearTimeout(zoekTimer.current);
    };
  }, [zoek, zichtbaar.length]);

  /** Elke wijziging aan de selectie begint weer bovenaan bij de eerste tien. */
  function zetZoek(waarde: string) {
    setZoek(waarde);
    setLimiet(PAGINA);
  }

  function meldFilter(facet: string, waarde: string) {
    trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_FILTER, { facet, waarde });
    clarityTag(`supplementen_${facet}`, waarde);
  }

  function kiesCategorie(slug: string) {
    setCategorie(slug);
    setLimiet(PAGINA);
    meldFilter("categorie", slug);
  }

  function kiesWeergave(waarde: Weergave) {
    setWeergave(waarde);
    meldFilter("weergave", waarde);
  }

  function toonMeer() {
    const nieuw = Math.min(limiet + PAGINA, zichtbaar.length);
    setLimiet(nieuw);
    trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_MEER, {
      getoond: nieuw,
      totaal: zichtbaar.length,
    });
    clarityTag("supplementen_meer_laden", String(nieuw));
  }

  function wisAlles() {
    setCategorie("alles");
    setAlleenClaim(false);
    setAlleenGetest(false);
    setZoek("");
    setLimiet(PAGINA);
    meldFilter("wis_filters", "alles");
  }

  const filtersActief =
    categorie !== "alles" || alleenClaim || alleenGetest || zoek.trim() !== "";

  const kop =
    zoek.trim() !== ""
      ? `Zoekresultaten voor “${zoek.trim()}”`
      : categorie === PERSOONLIJK
        ? "Past bij jou"
        : categorie === "alles"
          ? "Alle supplementen"
          : (categorieen.find((optie) => optie.slug === categorie)?.label ??
            "Alle supplementen");

  return (
    <div>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="7.3" cy="7.3" r="5.1" />
            <path d="m11.2 11.2 3.4 3.4" />
          </svg>
        </span>
        <input
          type="search"
          value={zoek}
          onChange={(event) => zetZoek(event.target.value)}
          placeholder="Zoek op product, merk of categorie"
          aria-label="Zoek in de supplementen"
          className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-11 text-base text-stone-900 placeholder:text-stone-400 focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green"
        />
        {zoek !== "" ? (
          <button
            type="button"
            onClick={() => zetZoek("")}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <span className="sr-only">Wis zoekterm</span>
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        ) : null}
      </div>

      <div className="mt-4 lg:mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-12">
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
            setLimiet(PAGINA);
            meldFilter("eu_claim", alleenClaim ? "uit" : "aan");
          }}
          alleenGetest={alleenGetest}
          onAlleenGetest={() => {
            setAlleenGetest(!alleenGetest);
            setLimiet(PAGINA);
            meldFilter("onafhankelijk_getest", alleenGetest ? "uit" : "aan");
          }}
          filtersActief={filtersActief}
          onWisFilters={wisAlles}
        />

        <section aria-label="Producten" className="mt-5 min-w-0 lg:mt-0">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
            {/* Op mobiel draagt de h1 plus de gekozen chip de context; hier past
                alleen nog de teller naast de sorteerkeuze. */}
            <h2 className="min-w-0 text-sm text-stone-500">
              <span className="sr-only font-display text-base font-semibold text-stone-900 lg:not-sr-only lg:mr-2">
                {kop}
              </span>
              <span aria-live="polite" className="whitespace-nowrap">
                {zichtbaar.length} van {products.length} producten
              </span>
            </h2>

            <div className="flex flex-shrink-0 items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <span className="hidden lg:inline">Sorteer op</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    const waarde = event.target.value as SortKey;
                    setSort(waarde);
                    setLimiet(PAGINA);
                    trackEvent(GA4_EVENTS.SUPPLEMENTEN_CATALOGUS_SORTERING, {
                      sortering: waarde,
                    });
                    clarityTag("supplementen_sortering", waarde);
                  }}
                  className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-sm text-stone-800 focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green"
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
                className="hidden items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5 sm:flex"
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
                {zoek.trim() !== ""
                  ? `Geen product gevonden voor “${zoek.trim()}”.`
                  : "Geen product voldoet aan deze combinatie."}
              </p>
              <button
                type="button"
                onClick={wisAlles}
                className="mt-3 text-sm font-semibold text-ps-green transition-colors hover:text-ps-green-hover"
              >
                Toon alle {products.length} producten
              </button>
            </div>
          ) : (
            <>
              <ul
                className={
                  weergave === "raster"
                    ? "mt-5 grid grid-cols-2 gap-3"
                    : "-mx-4 mt-5 space-y-3 sm:mx-0"
                }
                role="list"
              >
                {getoond.map((product, index) => (
                  <li key={product.key}>
                    <ProductCatalogCard
                      product={product}
                      eager={index === 0}
                      tieCount={tieCounts.get(product.category) ?? 1}
                      persoonlijkeReden={
                        persoonlijkeRedenen.get(product.category) ?? null
                      }
                    />
                  </li>
                ))}
              </ul>

              {restant > 0 ? (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={toonMeer}
                    className="w-full rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-ps-green hover:text-ps-green sm:w-auto"
                  >
                    Toon {Math.min(PAGINA, restant)} meer
                  </button>
                  <p className="mt-2 text-xs text-stone-400">
                    {getoond.length} van {zichtbaar.length} getoond
                  </p>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-8 lg:hidden">
            <OnderbouwingPanel bron="supplementen_onder_lijst" />
          </div>
        </section>
      </div>
    </div>
  );
}
