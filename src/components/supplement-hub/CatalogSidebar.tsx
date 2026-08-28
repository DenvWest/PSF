"use client";

import Image from "next/image";
import Link from "next/link";
import { PS_SCORE_MODEL_VERSION } from "@/data/supplement-hub/score-model";
import HubPersonalBar from "@/components/supplement-hub/HubPersonalBar";
import OnderbouwingPanel from "@/components/supplement-hub/OnderbouwingPanel";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";

export type CategorieOptie = {
  slug: string;
  label: string;
  count: number;
  /** Emoji als er geen productfoto is. */
  icon: string;
  /** Foto van het best scorende product uit de categorie; draagt de tegel op mobiel. */
  imageSrc: string | null;
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
  const tegelTekst = (actief: boolean) =>
    actief
      ? "font-semibold text-ps-green lg:bg-ps-green lg:text-white lg:shadow-sm"
      : "text-stone-600 hover:text-ps-green lg:hover:bg-stone-100/70";

  const knopClass = (actief: boolean) =>
    actief
      ? "bg-ps-green text-white font-semibold shadow-sm"
      : "border border-stone-200 bg-white text-stone-600 hover:border-ps-green/40 hover:text-ps-green lg:border-transparent lg:bg-transparent lg:hover:bg-stone-100/70";

  return (
    <aside
      aria-label="Verfijn de catalogus"
      className="flex flex-col gap-7 lg:sticky lg:top-24 lg:block lg:h-[calc(100dvh-7rem)] lg:space-y-6 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim"
    >
      <div className="hidden lg:block">
        <p className="hidden font-display text-sm font-semibold text-stone-900 lg:block">
          Stel je vergelijking samen
        </p>
        <p className="hidden text-xs leading-relaxed text-stone-500 lg:mt-1.5 lg:block">
          Alle {productCount} producten langs dezelfde meetlat: dosering, vorm,
          etiket en EU-claim; prijs telt niet mee in de score.
        </p>
        <Link
          href="/ps-score"
          className="hidden text-xs font-medium text-ps-green transition-colors hover:text-ps-green-hover lg:mt-2 lg:inline-block"
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
          <p className={`${KOPJE} hidden lg:block`}>Categorie</p>
          <span className="lg:hidden" aria-hidden />
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
          className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
          role="group"
          aria-label="Filter op categorie"
        >
          {categorieen.map((optie) => {
            const actief = categorie === optie.slug;
            return (
              <button
                key={optie.slug}
                type="button"
                onClick={() => onCategorie(optie.slug)}
                aria-pressed={actief}
                className={`flex w-[5.5rem] flex-shrink-0 flex-col items-center gap-1.5 rounded-lg py-1 text-center text-[0.72rem] leading-tight transition-all lg:w-full lg:flex-shrink lg:flex-row lg:justify-between lg:gap-2 lg:px-3 lg:py-2 lg:text-left lg:text-sm ${tegelTekst(actief)}`}
              >
                <span
                  aria-hidden
                  className={`flex h-[5.25rem] w-[5.25rem] items-center justify-center overflow-hidden rounded-full bg-stone-50 transition-all lg:hidden ${
                    actief
                      ? "ring-2 ring-ps-green"
                      : "ring-1 ring-stone-200/80"
                  }`}
                >
                  {optie.imageSrc ? (
                    <Image
                      src={optie.imageSrc}
                      alt=""
                      width={168}
                      height={168}
                      className="h-full w-full object-contain p-1.5"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display text-xl font-bold text-stone-500">
                      {optie.count}
                    </span>
                  )}
                </span>
                <span className="w-full px-0.5 lg:truncate lg:px-0">
                  {optie.label}
                </span>
                <span
                  aria-hidden
                  className={`hidden text-xs tabular-nums lg:inline ${
                    actief ? "text-white/70" : "text-stone-400"
                  }`}
                >
                  {optie.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={`${KOPJE} mb-2 hidden lg:block`}>Verfijn</p>
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
          role="group"
          aria-label="Verfijn"
        >
          <button
            type="button"
            onClick={onAlleenClaim}
            aria-pressed={alleenClaim}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-left text-sm transition-all lg:w-full lg:flex-shrink lg:rounded-lg lg:px-3 lg:py-2 ${knopClass(alleenClaim)}`}
          >
            Voldoet aan EU-claim
          </button>
          <button
            type="button"
            onClick={onAlleenGetest}
            aria-pressed={alleenGetest}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-left text-sm transition-all lg:w-full lg:flex-shrink lg:rounded-lg lg:px-3 lg:py-2 ${knopClass(alleenGetest)}`}
          >
            Onafhankelijk getest
          </button>
        </div>
      </div>

      <OnderbouwingPanel bron="supplementen_zijbalk" />
    </aside>
  );
}
