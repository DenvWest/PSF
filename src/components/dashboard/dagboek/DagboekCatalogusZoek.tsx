"use client";

import { useEffect, useMemo, useState } from "react";
import { catalogEntry, searchCatalog, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import {
  searchSupplementCatalog,
  supplementCatalogEntry,
  type SupplementCatalogEntry,
} from "@/data/nutrition/supplement-catalog";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import FoodGroupTile from "@/components/dashboard/voortgang/FoodGroupTile";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import SupplementThumbnail from "@/components/dashboard/voortgang/SupplementThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import type { DagboekItem, DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { zonderCatalogusDubbelen } from "@/lib/zoek-dubbelen";
import { tegelVoorNevoGroep, VERPAKT_TEGEL } from "@/lib/voedselgroep-tegel";
import { MIN_ZOEK_LENGTE, zoekSupermarktProductenViaApi } from "@/lib/supermarkt-producten-client";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const MAX_TREFFERS = 8;

/** Wachttijd na de laatste toetsaanslag voordat de server wordt bevraagd. */
const ZOEK_DEBOUNCE_MS = 250;

/** Eén stabiele lege lijst, zodat een afgeleide waarde de `useMemo` hieronder niet bij elke render ongeldig maakt. */
const GEEN_PRODUCTEN: readonly SupermarktProduct[] = [];

type Resultaat =
  | { bron: "voeding"; entry: CatalogEntry }
  | { bron: "supplement"; entry: SupplementCatalogEntry }
  | { bron: "supermarkt"; product: SupermarktProduct };

type TabId = "alle" | "producten" | "supplementen";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "producten", label: "Mijn producten" },
  { id: "supplementen", label: "Mijn supplementen" },
];

function resultaatVoor(bron: DagboekItemBron, key: string): Resultaat | null {
  if (bron === "voeding") {
    const entry = catalogEntry(key);
    return entry ? { bron: "voeding", entry } : null;
  }
  const entry = supplementCatalogEntry(key);
  return entry ? { bron: "supplement", entry } : null;
}

/**
 * Het zoekscherm binnen een nutriëntdetail: zoekt in beide catalogi tegelijk,
 * met "eerder gebruikt" als startpunt vóór er getypt is.
 *
 * Zoekt over de hele catalogus, niet gefilterd op `nutrient` — wie "kaas"
 * typt wil kaas kunnen kiezen ook al draagt die niets bij aan omega-3. De
 * `nutrient`-context bepaalt alleen welk detailscherm je hierna terugbrengt.
 *
 * ## De drie tabbladen
 *
 * "Alle" is het bestaande gedrag: eerder gebruikt vóór je typt, zoekresultaten
 * erna. "Mijn producten"/"Mijn supplementen" tonen één gemengde lijst per
 * bron — bewaarde favorieten (ster-knop) eerst, daarna de rest van je
 * geschiedenis die nog niet bewaard is. Zo is er nooit een lege tab zolang je
 * ooit iets van die bron logde, en de ster blijft een bewuste bovenaan-zet in
 * plaats van de enige manier om iets terug te vinden.
 */
export default function DagboekCatalogusZoek({
  nutrient = null,
  eerderGebruikt,
  favorieten,
  moment,
  onMomentChange,
  onKies,
  onKiesSupermarkt,
  onBewaarFavoriet,
  onVerwijderFavoriet,
  onTerug,
  onVergelijk,
  busyFavoriet = false,
}: {
  /** De stof waarvandaan je kwam — bepaalt alleen de titel. Null vanuit een maaltijd. */
  nutrient?: NutrientId | null;
  /** Items uit eerdere dagen, meest recent eerst — voor de "eerder gebruikt"-lijst. */
  eerderGebruikt: readonly DagboekItem[];
  /** Handmatig bewaarde favorieten, ongeacht geschiedenis. */
  favorieten: readonly DagboekFavoriet[];
  /** Het eetmoment waar de keuze straks aan toegevoegd wordt — hier al te kiezen, zoals MyFitnessPal's dropdown. */
  moment: EetmomentId;
  onMomentChange: (moment: EetmomentId) => void;
  onKies: (bron: DagboekItemBron, key: string) => void;
  /**
   * Los van `onKies`: een supermarktproduct is geen `DagboekItemBron` (zie
   * `nutrition-supermarkt-items.ts`) en heeft dus geen plek in die signature.
   * Alleen relevant vanuit een maaltijd (`nutrient` null) — een
   * supermarktproduct draagt geen `NutrientId`-bijdrage. Krijgt het hele
   * product mee: de catalogus staat server-side, dus het portiescherm kan het
   * niet zelf opzoeken.
   */
  onKiesSupermarkt: (product: SupermarktProduct) => void;
  onBewaarFavoriet: (bron: DagboekItemBron, key: string) => void;
  onVerwijderFavoriet: (bron: DagboekItemBron, key: string) => void;
  onTerug: () => void;
  /** Opent "Vergelijk producten": je vergelijkt op het moment dat je kiest wat je toevoegt. */
  onVergelijk?: () => void;
  busyFavoriet?: boolean;
}) {
  const [zoek, setZoek] = useState("");
  const [tab, setTab] = useState<TabId>("alle");
  /** De laatst ontvangen supermarkttreffers, en voor welke zoekterm ze gelden. */
  const [supermarktRespons, setSupermarktRespons] = useState<{
    term: string;
    producten: SupermarktProduct[];
  }>({ term: "", producten: [] });

  // Supermarktproducten staan server-side (`sm_products`); zoeken is dus een
  // verzoek, met debounce en afbreken zodat een trage vorige zoekopdracht een
  // nieuwere nooit overschrijft. Niet vanuit een nutriëntdetail: een
  // supermarktproduct draagt geen `NutrientId`-bijdrage.
  const supermarktTerm = zoek.trim();
  const zoektSupermarkt = !nutrient && supermarktTerm.length >= MIN_ZOEK_LENGTE;

  useEffect(() => {
    if (!zoektSupermarkt) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void zoekSupermarktProductenViaApi(supermarktTerm, controller.signal).then((producten) => {
        if (controller.signal.aborted) return;
        setSupermarktRespons({ term: supermarktTerm, producten });
      });
    }, ZOEK_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [zoektSupermarkt, supermarktTerm]);

  // Afgeleid, niet gezet: onder de drempel of vanuit een nutriëntdetail zijn er
  // geen supermarkttreffers, en tot het antwoord op de nieuwste term binnen is
  // blijven de vorige treffers staan in plaats van bij elke toets te knipperen.
  const supermarktTreffers = zoektSupermarkt ? supermarktRespons.producten : GEEN_PRODUCTEN;
  const supermarktBezig = zoektSupermarkt && supermarktRespons.term !== supermarktTerm;

  const momentLabel = EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? "je dag";

  const isFavoriet = (bron: DagboekItemBron, key: string) =>
    favorieten.some((f) => f.bron === bron && f.key === key);

  const recent = useMemo(() => {
    const gezien = new Set<string>();
    const uit: Resultaat[] = [];
    for (const item of eerderGebruikt) {
      const dedupSleutel = `${item.bron}:${item.key}`;
      if (gezien.has(dedupSleutel)) continue;
      const resultaat = resultaatVoor(item.bron, item.key);
      if (!resultaat) continue;
      gezien.add(dedupSleutel);
      uit.push(resultaat);
      if (uit.length >= MAX_TREFFERS) return uit;
    }
    return uit;
  }, [eerderGebruikt]);

  const treffers = useMemo((): Resultaat[] => {
    const term = zoek.trim();
    if (!term) return [];
    const catalogusTreffers = searchCatalog(term, MAX_TREFFERS);
    const voeding = catalogusTreffers.map((entry): Resultaat => ({ bron: "voeding", entry }));
    const supplementen = searchSupplementCatalog(term, MAX_TREFFERS).map(
      (entry): Resultaat => ({ bron: "supplement", entry }),
    );
    const supermarkt = zonderCatalogusDubbelen(supermarktTreffers, catalogusTreffers).map(
      (product): Resultaat => ({ bron: "supermarkt", product }),
    );
    return [...voeding, ...supplementen, ...supermarkt].slice(0, MAX_TREFFERS * 3);
  }, [zoek, supermarktTreffers]);

  /** "Mijn producten"/"Mijn supplementen": favorieten eerst, dan de rest van de geschiedenis van die bron. */
  function mijnLijst(bron: DagboekItemBron): Resultaat[] {
    const gezien = new Set<string>();
    const uit: Resultaat[] = [];
    for (const favoriet of favorieten) {
      if (favoriet.bron !== bron || gezien.has(favoriet.key)) continue;
      const resultaat = resultaatVoor(favoriet.bron, favoriet.key);
      if (!resultaat) continue;
      gezien.add(favoriet.key);
      uit.push(resultaat);
    }
    for (const item of eerderGebruikt) {
      if (item.bron !== bron || gezien.has(item.key)) continue;
      const resultaat = resultaatVoor(item.bron, item.key);
      if (!resultaat) continue;
      gezien.add(item.key);
      uit.push(resultaat);
    }
    return uit;
  }

  const resultaten =
    tab === "alle"
      ? zoek.trim()
        ? treffers
        : recent
      : tab === "producten"
        ? mijnLijst("voeding")
        : mijnLijst("supplement");

  const toontEerderGebruikt = tab === "alle" && !zoek.trim();
  const getoondeSupermarktProducten = resultaten.flatMap((resultaat) =>
    resultaat.bron === "supermarkt" ? [resultaat.product] : [],
  );
  const legeMelding =
    tab === "alle"
      ? zoek.trim()
        ? supermarktBezig
          ? "Zoeken…"
          : "Niets gevonden."
        : "Nog niets eerder geregistreerd."
      : tab === "producten"
        ? "Nog geen voedingsmiddelen bewaard of gebruikt."
        : "Nog geen supplementen bewaard of gebruikt.";

  return (
    <div className="flex flex-col gap-2.5">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 min-w-0 flex-1 truncate font-serif text-[16px] font-normal text-[var(--vd-ink)]">
          {nutrient ? `Voeg toe bij ${nutrientReferences[nutrient].label.toLowerCase()}` : `Voeg toe aan ${momentLabel}`}
        </h2>
        {onVergelijk ? (
          <button
            type="button"
            onClick={onVergelijk}
            className="flex-none cursor-pointer whitespace-nowrap rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[var(--vd-ink-2)] transition-colors hover:border-[var(--vd-sage)] hover:text-[var(--vd-sage-2)]"
          >
            Vergelijk producten
          </button>
        ) : null}
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="flex flex-col gap-2.5 border-b border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vd-ink-4)]">
              <Icons.Search s={15} />
            </span>
            <input
              type="search"
              autoFocus
              value={zoek}
              onChange={(event) => setZoek(event.target.value)}
              placeholder="Zoek een voedingsmiddel of supplement…"
              aria-label="Zoek een voedingsmiddel of supplement"
              className="w-full rounded-xl border border-white/15 bg-black/20 py-2.5 pl-9 pr-3 text-[16px] sm:text-[13px] text-[var(--vd-ink)] outline-none transition-colors placeholder:text-[var(--vd-ink-4)] focus:border-white/40"
            />
          </div>

          {/*
            Het eetmoment staat hier en niet meer op de portielaag: je kiest het
            één keer voor alles wat je in deze sessie toevoegt. Chips in plaats
            van een select, want vier opties passen op één regel en een select
            kost een extra tik plus een systeemmenu over de lijst heen.
          */}
          <div
            role="group"
            aria-label="Eetmoment"
            className="flex flex-wrap gap-1.5"
          >
            {EETMOMENTEN.map((m) => {
              const actief = m.id === moment;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMomentChange(m.id)}
                  aria-pressed={actief}
                  className={`min-h-[32px] cursor-pointer rounded-lg border px-2.5 text-[12px] transition-colors ${
                    actief
                      ? "border-[var(--vd-sage)] bg-[rgb(var(--vd-sage-rgb)/20%)] font-semibold text-[var(--vd-sage-2)]"
                      : "border-white/10 bg-white/[0.02] text-[var(--vd-ink-3)] hover:border-white/25 hover:text-[var(--vd-ink-2)]"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <nav
            role="tablist"
            aria-label="Bron van producten"
            className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/20 p-1"
          >
            {TABS.map((t) => {
              const selected = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`dagboek-zoek-tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`dagboek-zoek-paneel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`flex min-h-[34px] cursor-pointer items-center rounded-lg px-3 text-[12.5px] transition-colors ${
                    selected
                      ? "bg-[rgb(var(--vd-sage-rgb)/18%)] font-semibold text-[var(--vd-sage-2)]"
                      : "font-medium text-[var(--vd-ink-3)] hover:text-[var(--vd-ink-2)]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div
          role="tabpanel"
          id={`dagboek-zoek-paneel-${tab}`}
          aria-labelledby={`dagboek-zoek-tab-${tab}`}
        >
          {toontEerderGebruikt && resultaten.length > 0 ? (
            <p className="m-0 border-b border-white/10 px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--vd-ink-4)]">
              Eerder gebruikt
            </p>
          ) : null}

          {resultaten.length === 0 ? (
            <p className="m-0 px-4 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
              {legeMelding}
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-white/[0.06] p-0">
              {resultaten.map((resultaat) => {
                if (resultaat.bron === "supermarkt") {
                  const product = resultaat.product;
                  const tegel = product.bron === "nevo" ? tegelVoorNevoGroep(product.categorie ?? "") : VERPAKT_TEGEL;
                  return (
                    <li key={`supermarkt-${product.prodId}`} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onKiesSupermarkt(product)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FoodGroupTile icoon={tegel.icoon} label={tegel.label} size={40} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] text-[var(--vd-ink)]">
                              {product.naam}
                            </span>
                            <span className="block text-[10px] text-[var(--vd-ink-4)]">
                              {product.merk ?? "Verpakt product"}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                }

                const key = `${resultaat.bron}-${resultaat.entry.key}`;
                const label = resultaat.entry.labelNl;
                const portieLabel = resultaat.entry.porties[0]?.labelNl ?? "";
                const bewaard = isFavoriet(resultaat.bron, resultaat.entry.key);
                return (
                  <li key={key} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => onKies(resultaat.bron, resultaat.entry.key)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {resultaat.bron === "voeding" ? (
                          <FoodThumbnail entry={resultaat.entry} size={40} />
                        ) : (
                          <SupplementThumbnail entry={resultaat.entry} size={40} />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-[var(--vd-ink)]">
                            {label}
                          </span>
                          {resultaat.bron === "supplement" ? (
                            <span className="block text-[10px] text-[var(--vd-ink-4)]">supplement</span>
                          ) : null}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10.5px] text-[var(--vd-ink-4)]">{portieLabel}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyFavoriet}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (bewaard) {
                          onVerwijderFavoriet(resultaat.bron, resultaat.entry.key);
                        } else {
                          onBewaarFavoriet(resultaat.bron, resultaat.entry.key);
                        }
                      }}
                      aria-label={
                        bewaard
                          ? `Verwijder ${label} uit favorieten`
                          : `Bewaar ${label} als favoriet`
                      }
                      aria-pressed={bewaard}
                      className={`mr-3 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                        bewaard ? "text-[var(--vd-amber)]" : "text-[var(--vd-ink-4)] hover:text-[var(--vd-amber)]"
                      }`}
                    >
                      <Icons.Star s={16} filled={bewaard} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {getoondeSupermarktProducten.length > 0 ? (
            <div className="border-t border-white/[0.06] px-3 py-2">
              <SupermarktBronRegel producten={getoondeSupermarktProducten} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
