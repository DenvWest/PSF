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
 * De keuzekolom naast de catalogus. Op desktop een kolom met alle keuzes onder
 * elkaar; op mobiel één regel met een categorie-keuze en twee verfijnchips, zodat
 * de producten meteen in beeld staan in plaats van onder een scherm vol filters.
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
  const chip = (actief: boolean) =>
    actief
      ? "border-ps-green bg-ps-green font-semibold text-white"
      : "border-stone-200 bg-white text-stone-600";

  const rijKnop = (actief: boolean) =>
    actief
      ? "bg-ps-green font-semibold text-white shadow-sm"
      : "text-stone-600 hover:bg-stone-100/70 hover:text-ps-green";

  return (
    <aside
      aria-label="Verfijn de catalogus"
      className="flex flex-col gap-3 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:gap-6 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim"
    >
      <div className="hidden lg:block">
        <p className="font-display text-sm font-semibold text-stone-900">
          Stel je vergelijking samen
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
          Alle {productCount} producten langs dezelfde meetlat: dosering, vorm,
          etiket en EU-claim; prijs telt niet mee in de score.
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

      {/* Mobiel: één regel keuzes. */}
      <div
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 scrollbar-hide lg:hidden"
        role="group"
        aria-label="Filter de catalogus"
      >
        <span className="relative flex-shrink-0">
          <select
            aria-label="Categorie"
            value={categorie}
            onChange={(event) => onCategorie(event.target.value)}
            className={`h-10 appearance-none rounded-full border pl-4 pr-9 text-sm transition-colors focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green ${chip(
              categorie !== "alles",
            )}`}
          >
            {categorieen.map((optie) => (
              <option key={optie.slug} value={optie.slug}>
                {optie.label} ({optie.count})
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.6rem] ${
              categorie !== "alles" ? "text-white/80" : "text-stone-400"
            }`}
          >
            ▼
          </span>
        </span>

        <button
          type="button"
          onClick={onAlleenClaim}
          aria-pressed={alleenClaim}
          className={`h-10 flex-shrink-0 rounded-full border px-4 text-sm transition-colors ${chip(alleenClaim)}`}
        >
          EU-claim
        </button>
        <button
          type="button"
          onClick={onAlleenGetest}
          aria-pressed={alleenGetest}
          className={`h-10 flex-shrink-0 rounded-full border px-4 text-sm transition-colors ${chip(alleenGetest)}`}
        >
          Getest
        </button>
        {filtersActief ? (
          <button
            type="button"
            onClick={onWisFilters}
            className="h-10 flex-shrink-0 px-2 text-sm font-medium text-stone-400 underline underline-offset-2"
          >
            Wis
          </button>
        ) : null}
      </div>

      {/* Desktop: categorie als kolom. */}
      <div className="hidden lg:block">
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
        <div className="flex flex-col gap-0.5" role="group" aria-label="Filter op categorie">
          {categorieen.map((optie) => {
            const actief = categorie === optie.slug;
            return (
              <button
                key={optie.slug}
                type="button"
                onClick={() => onCategorie(optie.slug)}
                aria-pressed={actief}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${rijKnop(actief)}`}
              >
                <span className="truncate">{optie.label}</span>
                <span
                  aria-hidden
                  className={`text-xs tabular-nums ${actief ? "text-white/70" : "text-stone-400"}`}
                >
                  {optie.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block">
        <p className={`${KOPJE} mb-2`}>Verfijn</p>
        <div className="flex flex-col gap-0.5" role="group" aria-label="Verfijn">
          <button
            type="button"
            onClick={onAlleenClaim}
            aria-pressed={alleenClaim}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${rijKnop(alleenClaim)}`}
          >
            Voldoet aan EU-claim
          </button>
          <button
            type="button"
            onClick={onAlleenGetest}
            aria-pressed={alleenGetest}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${rijKnop(alleenGetest)}`}
          >
            Onafhankelijk getest
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <OnderbouwingPanel bron="supplementen_zijbalk" />
      </div>
    </aside>
  );
}
