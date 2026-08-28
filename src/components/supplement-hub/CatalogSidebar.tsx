"use client";

import Link from "next/link";
import { PS_SCORE_MODEL_VERSION } from "@/data/supplement-hub/score-model";
import HubPersonalBar from "@/components/supplement-hub/HubPersonalBar";
import OnderbouwingPanel from "@/components/supplement-hub/OnderbouwingPanel";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";

export type CategorieOptie = {
  slug: string;
  label: string;
  count: number;
};

type CatalogSidebarProps = {
  personalization: HubPersonalization;
  productCount: number;
  matchNamen: string[];
  persoonlijkAantal: number;
  persoonlijkActief: boolean;
  onPersoonlijkToggle: () => void;
  categorieen: CategorieOptie[];
  categorie: string;
  onCategorie: (slug: string) => void;
  alleenClaim: boolean;
  onAlleenClaim: () => void;
  alleenGetest: boolean;
  onAlleenGetest: () => void;
  /** Staat er een filter aan? Dan verschijnt "Wis filters". */
  filtersActief: boolean;
  onWisFilters: () => void;
};

const KOPJE =
  "font-display text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-stone-400";

/**
 * De keuzekolom naast de catalogus. Alles wat een knop is staat hier — persoonlijke
 * selectie, categorie, verfijning en onderbouwing — zodat de productrijen zelf
 * niets anders dragen dan het product.
 */
export default function CatalogSidebar({
  personalization,
  productCount,
  matchNamen,
  persoonlijkAantal,
  persoonlijkActief,
  onPersoonlijkToggle,
  categorieen,
  categorie,
  onCategorie,
  alleenClaim,
  onAlleenClaim,
  alleenGetest,
  onAlleenGetest,
  filtersActief,
  onWisFilters,
}: CatalogSidebarProps) {
  const knopClass = (actief: boolean) =>
    actief
      ? "bg-ps-green text-white font-semibold shadow-sm"
      : "border border-stone-200 bg-white text-stone-600 hover:border-ps-green/40 hover:text-ps-green lg:border-transparent lg:bg-transparent lg:hover:bg-stone-100/70";

  return (
    <aside
      aria-label="Verfijn de catalogus"
      className="space-y-6 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:space-y-6 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim"
    >
      <div className="hidden lg:block">
        <p className="font-display text-sm font-semibold text-stone-900">
          Stel je vergelijking samen
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
          Alle {productCount} producten langs dezelfde meetlat: dosering, vorm,
          etiket en EU-claim. Prijs telt niet mee in de score.
        </p>
        <Link
          href="/ps-score"
          className="mt-2 inline-block text-xs font-medium text-ps-green transition-colors hover:text-ps-green-hover"
        >
          Model {PS_SCORE_MODEL_VERSION} — lees de methode →
        </Link>
      </div>

      <HubPersonalBar
        personalization={personalization}
        productCount={productCount}
        matchNamen={matchNamen}
        persoonlijkAantal={persoonlijkAantal}
        actief={persoonlijkActief}
        onToggle={onPersoonlijkToggle}
      />

      <div>
        <div className="mb-2 hidden items-baseline justify-between gap-2 lg:flex">
          <p className={KOPJE}>Categorie</p>
          {filtersActief ? (
            <button
              type="button"
              onClick={onWisFilters}
              className="text-[0.7rem] font-medium text-stone-400 underline underline-offset-2 transition-colors hover:text-ps-green"
            >
              Wis filters
            </button>
          ) : null}
        </div>
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
          role="group"
          aria-label="Filter op categorie"
        >
          {categorieen.map((optie) => (
            <button
              key={optie.slug}
              type="button"
              onClick={() => onCategorie(optie.slug)}
              aria-pressed={categorie === optie.slug}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-all lg:w-full lg:flex-shrink lg:justify-between lg:rounded-lg lg:px-3 lg:py-2 ${knopClass(categorie === optie.slug)}`}
            >
              <span className="truncate">{optie.label}</span>
              <span
                aria-hidden
                className={`hidden text-xs tabular-nums lg:inline ${
                  categorie === optie.slug ? "text-white/70" : "text-stone-400"
                }`}
              >
                {optie.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={`${KOPJE} mb-2 hidden lg:block`}>Verfijn</p>
        <div
          className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5"
          role="group"
          aria-label="Verfijn"
        >
          <button
            type="button"
            onClick={onAlleenClaim}
            aria-pressed={alleenClaim}
            className={`rounded-full px-4 py-2 text-left text-sm transition-all lg:w-full lg:rounded-lg lg:px-3 lg:py-2 ${knopClass(alleenClaim)}`}
          >
            Voldoet aan EU-claim
          </button>
          <button
            type="button"
            onClick={onAlleenGetest}
            aria-pressed={alleenGetest}
            className={`rounded-full px-4 py-2 text-left text-sm transition-all lg:w-full lg:rounded-lg lg:px-3 lg:py-2 ${knopClass(alleenGetest)}`}
          >
            Onafhankelijk getest
          </button>
        </div>
      </div>

      <OnderbouwingPanel bron="supplementen_zijbalk" />
    </aside>
  );
}
