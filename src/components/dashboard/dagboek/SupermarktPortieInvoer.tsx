"use client";

import { useState } from "react";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import {
  bedragVanSupermarktveld,
  SUPERMARKT_MACRO_VELDEN,
} from "@/lib/nutrition-supermarkt-items";
import * as Icons from "@/components/app/icons";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer voor een supermarktproduct (Laag A) — calorie/macro-ring,
 * geen tekort-oordeel.
 *
 * ## Waarom dit een eigen component is en geen tak in `DagboekPortieInvoer`
 *
 * `DagboekPortieInvoer` rekent met `bedragVanItem`/`NutrientId` en draagt de
 * favoriet-ster (bewaren voor "Mijn producten"). Een `SupermarktProduct` heeft
 * geen `NutrientId`-bijdrage en geen favoriet-mechanisme (het is geen
 * `DagboekItemBron`, zie `nutrition-supermarkt-items.ts`) — samenvoegen zou
 * die twee assen in één component laten vervlechten. Zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3.
 *
 * ## Waarom een volledig scherm en geen bottom-sheet
 *
 * `DagboekPortieInvoer`/de eerste versie van dit component lagen als laag
 * óver de zoeklijst — dat past bij snel meerdere producten achter elkaar
 * loggen. Deze vorm (27 sep, herzien naar de MyFitnessPal-referentie) is een
 * volledig scherm met rijen, zelfde idioom als `DagboekProductDetail`/
 * `DagboekNutrientDetail`: header met terugchevron, dan rijen die je één voor
 * één instelt, de ring als laatste bevestiging onderaan.
 *
 * ## Aantal porties × portiegrootte, geen `1,0 stuk`
 *
 * `SupermarktProduct` draagt geen portie-definitie zoals `FOOD_CATALOG.porties`
 * (geen "1 plakje", "1 schep") — de brondata is per 100 g, punt. Een schijn-
 * precieze portie-eenheid ("1,0 stuk") zou data suggereren die er niet is.
 * In plaats daarvan: een editable gram-veld ("Portiegrootte") vermenigvuldigd
 * met een geheel aantal ("Aantal porties"). Het totale gewicht bepaalt de
 * bijdrage, net als bij elk ander item in dit dagboek.
 */
export default function SupermarktPortieInvoer({
  product,
  moment,
  onBevestig,
  onTerug,
  busy = false,
}: {
  /** Het gekozen product, uit het zoekresultaat — het scherm haalt zelf niets op. */
  product: SupermarktProduct;
  moment: EetmomentId;
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onTerug: () => void;
  busy?: boolean;
}) {
  const [gekozenMoment, setGekozenMoment] = useState<EetmomentId>(moment);
  const [aantalPorties, setAantalPorties] = useState(1);
  const [portiegrootteGram, setPortiegrootteGram] = useState(100);
  /** Welke rij op dit moment zijn eigen invoer toont. */
  const [openRij, setOpenRij] = useState<"maaltijd" | "porties" | "portiegrootte" | null>(
    null,
  );

  const totaalGram = Math.max(1, Math.trunc(aantalPorties * portiegrootteGram));
  const momentLabel = EETMOMENTEN.find((m) => m.id === gekozenMoment)?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 min-w-0 flex-1 truncate font-serif text-[19px] font-normal text-[var(--vd-ink)]">
          Voedsel toevoegen
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={() => onBevestig(gekozenMoment, totaalGram)}
          aria-label="Bevestigen"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--vd-sage-2)] transition-colors hover:text-[var(--vd-sage)] disabled:opacity-40"
        >
          <Icons.Check s={20} />
        </button>
      </header>

      <p className="m-0 truncate text-[15px] font-bold text-[var(--vd-ink)]">{product.naam}</p>

      <section className="flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setOpenRij(openRij === "maaltijd" ? null : "maaltijd")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Maaltijd</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">{momentLabel}</span>
        </button>
        {openRij === "maaltijd" ? (
          <div role="group" aria-label="Kies een maaltijd" className="flex flex-wrap gap-1.5 bg-black/10 px-3.5 py-3">
            {EETMOMENTEN.map((m) => {
              const actief = m.id === gekozenMoment;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setGekozenMoment(m.id);
                    setOpenRij(null);
                  }}
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
        ) : null}

        <button
          type="button"
          onClick={() => setOpenRij(openRij === "porties" ? null : "porties")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Aantal porties</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">{aantalPorties}</span>
        </button>
        {openRij === "porties" ? (
          <div className="flex items-center gap-2.5 bg-black/10 px-3.5 py-3">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={aantalPorties}
              disabled={busy}
              onChange={(event) =>
                setAantalPorties(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
              }
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpenRij(openRij === "portiegrootte" ? null : "portiegrootte")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Portiegrootte</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">
            {portiegrootteGram} g
          </span>
        </button>
        {openRij === "portiegrootte" ? (
          <div className="flex items-center gap-2.5 bg-black/10 px-3.5 py-3">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              value={portiegrootteGram}
              disabled={busy}
              onChange={(event) =>
                setPortiegrootteGram(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
              }
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[var(--vd-ink-4)]">gram</span>
          </div>
        ) : null}
      </section>

      <p className="m-0 text-[11px] text-[var(--vd-ink-4)]">
        Totaal: {totaalGram} g
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
          Levert
        </p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {SUPERMARKT_MACRO_VELDEN.map((veld) => {
            const bedrag = bedragVanSupermarktveld(product, veld.veld, totaalGram);
            return (
              <li
                key={veld.veld}
                className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
              >
                <span>{veld.label}</span>
                <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                  {bedrag === null ? "n.o." : `${Math.round(bedrag * 10) / 10} ${veld.unit}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="m-0 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
        Informatief, geen tekort-oordeel — dit telt niet mee in wat je dagboek verder meet.
      </p>

      <SupermarktBronRegel producten={[product]} />

      <button
        type="button"
        disabled={busy}
        onClick={() => onBevestig(gekozenMoment, totaalGram)}
        className="min-h-[44px] w-full cursor-pointer rounded-xl bg-[var(--vd-sage)] px-4 text-[13px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Toevoegen
      </button>
    </div>
  );
}
