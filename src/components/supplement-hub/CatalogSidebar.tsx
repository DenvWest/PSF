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
      : "text-stone-600 hover:bg-stone-100/70 hover:text-ps-green";

  return (
    <aside
      aria-label="Verfijn de catalogus"
      className="min-w-0 space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim"
    >
      <div>
        <p className="font-display text-sm font-semibold text-stone-900">
          Stel je vergelijking samen
        </p>
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-stone-500 sm:text-xs">
          Alle {productCount} producten langs dezelfde meetlat: dosering, vorm,
          etiket en EU-claim.{" "}
          <span className="hidden sm:inline">
            Prijs telt niet mee in de score.
          </span>
        </p>
        <Link
          href="/ps-score"
          className="mt-2 inline-block text-[0.7rem] font-medium leading-snug text-ps-green transition-colors hover:text-ps-green-hover sm:text-xs"
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
        <div className="mb-2 flex items-baseline justify-between gap-2">
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
          className="flex flex-col gap-0.5"
          role="group"
          aria-label="Filter op categorie"
        >
          {categorieen.map((optie) => (
            <button
              key={optie.slug}
              type="button"
              onClick={() => onCategorie(optie.slug)}
              aria-pressed={categorie === optie.slug}
              className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.8rem] transition-all sm:px-3 sm:py-2 sm:text-sm ${knopClass(categorie === optie.slug)}`}
            >
              <span className="truncate">{optie.label}</span>
              <span
                aria-hidden
                className={`text-[0.7rem] tabular-nums sm:text-xs ${
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
        <p className={`${KOPJE} mb-2`}>Verfijn</p>
        <div className="flex flex-col gap-0.5" role="group" aria-label="Verfijn">
          <button
            type="button"
            onClick={onAlleenClaim}
            aria-pressed={alleenClaim}
            className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[0.8rem] leading-snug transition-all sm:px-3 sm:py-2 sm:text-sm ${knopClass(alleenClaim)}`}
          >
            Voldoet aan EU-claim
          </button>
          <button
            type="button"
            onClick={onAlleenGetest}
            aria-pressed={alleenGetest}
            className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[0.8rem] leading-snug transition-all sm:px-3 sm:py-2 sm:text-sm ${knopClass(alleenGetest)}`}
          >
            Onafhankelijk getest
          </button>
        </div>
      </div>

      <OnderbouwingPanel bron="supplementen_zijbalk" />
    </aside>
  );
}
