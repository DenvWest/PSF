"use client";

import { useState } from "react";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import {
  bedragVanItem,
  type DagboekItem,
  type NutrientOndergrensGesplitst,
} from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Het detailscherm van één nutriënt: status vandaag, wat daaraan bijdroeg, en
 * de ingang om er iets aan toe te voegen.
 *
 * Toont alleen items die daadwerkelijk aan déze stof bijdragen — een dag kan
 * tien producten dragen waarvan er drie iets zeggen over magnesium. Filteren
 * gebeurt via `bedragVanItem`, dezelfde functie die de som optelt, zodat de
 * lijst en het getal nooit uit elkaar kunnen lopen.
 *
 * Zelfde kaart-taal als de eetmoment-secties op het overzicht (sectie met
 * header-balk, `rounded-2xl border`), zodat dit scherm niet als een los
 * prototype aanvoelt maar als een gewoon vervolg van "Je dag".
 */

function labelVoorItem(item: DagboekItem): string | null {
  if (item.bron === "supplement") return supplementCatalogEntry(item.key)?.labelNl ?? null;
  return catalogEntry(item.key)?.labelNl ?? null;
}

export default function DagboekNutrientDetail({
  nutrient,
  items,
  stof,
  onVerwijder,
  onVoegToe,
  onTerug,
  busy = false,
}: {
  nutrient: NutrientId;
  /** Alle items van de dag — dit scherm filtert zelf op wat aan `nutrient` bijdraagt. */
  items: readonly DagboekItem[];
  stof: NutrientOndergrensGesplitst | undefined;
  onVerwijder: (item: DagboekItem) => void;
  onVoegToe: () => void;
  onTerug: () => void;
  busy?: boolean;
}) {
  const [zichtbaarMoment, setZichtbaarMoment] = useState<EetmomentId | "alle">("alle");

  const bijdragend = items
    .map((item) => ({ item, bedrag: bedragVanItem(item, nutrient) }))
    .filter(
      (rij): rij is { item: DagboekItem; bedrag: NonNullable<typeof rij.bedrag> } =>
        rij.bedrag !== null,
    )
    .filter((rij) => zichtbaarMoment === "alle" || rij.item.moment === zichtbaarMoment);

  const label = nutrientReferences[nutrient].label;
  const gedekt = stof && stof.minstens > 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar je dag"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#F1EFE8]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 font-serif text-[19px] font-normal text-[#F1EFE8]">{label}</h2>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <header className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span
            aria-hidden
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              gedekt ? "bg-[#5A8F6A]/20 text-[#9CC5A9]" : "bg-white/[0.05] text-[#6F8177]"
            }`}
          >
            <Icons.Utensils s={16} />
          </span>
          <h3 className="m-0 font-sans text-[13.5px] font-bold text-[#F1EFE8]">Status vandaag</h3>
        </header>
        <div className="px-4 py-3.5">
          {stof ? (
            <p className="m-0 text-[13px] leading-relaxed text-[#9FB0A6]">
              Vandaag minstens{" "}
              <b className="font-semibold text-[#F1EFE8]">
                {stof.minstens} {stof.unit}
              </b>
              {" "}
              {stof.uitVoeding > 0 || stof.uitSupplement > 0 ? (
                <>
                  — {stof.uitVoeding > 0 ? `${stof.uitVoeding} ${stof.unit} uit voeding` : null}
                  {stof.uitVoeding > 0 && stof.uitSupplement > 0 ? ", " : null}
                  {stof.uitSupplement > 0
                    ? `${stof.uitSupplement} ${stof.unit} uit supplement`
                    : null}
                </>
              ) : null}
              .
            </p>
          ) : (
            <p className="m-0 text-[13px] leading-relaxed text-[#7E8C82]">
              Nog niets geregistreerd dat {label.toLowerCase()} levert. Voeg hieronder je eerste
              product of supplement toe.
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <select
          value={zichtbaarMoment}
          onChange={(event) => setZichtbaarMoment(event.target.value as EetmomentId | "alle")}
          aria-label="Filter op eetmoment"
          className="rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#9FB0A6] outline-none transition-colors focus:border-white/40"
        >
          <option value="alle">Alle momenten</option>
          {EETMOMENTEN.map((moment) => (
            <option key={moment.id} value={moment.id}>
              {moment.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={onVoegToe}
          className="cursor-pointer whitespace-nowrap rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/10 px-3.5 py-1.5 text-[12px] font-semibold text-[#9CC5A9] transition-colors hover:border-[#5A8F6A] hover:bg-[#5A8F6A]/20 disabled:opacity-50"
        >
          + Voeg toe
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <header className="flex items-center justify-between gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <h3 className="m-0 font-sans text-[13.5px] font-bold text-[#F1EFE8]">
            Wat hieraan bijdroeg
          </h3>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
            {bijdragend.length} {bijdragend.length === 1 ? "item" : "items"}
          </span>
        </header>

        {bijdragend.length === 0 ? (
          <p className="m-0 px-4 py-6 text-center text-[12px] leading-relaxed text-[#6F8177]">
            Nog niets dat {label.toLowerCase()} levert voor dit filter.
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-white/[0.06] p-0">
            {bijdragend.map(({ item, bedrag }, index) => {
              const itemLabel = labelVoorItem(item);
              if (!itemLabel) return null;
              const momentLabel = EETMOMENTEN.find((m) => m.id === item.moment)?.label;
              const voedingEntry = item.bron === "voeding" ? catalogEntry(item.key) : null;
              return (
                <li
                  key={`${item.key}-${index}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  {voedingEntry ? (
                    <FoodThumbnail entry={voedingEntry} size={40} />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C8FC9]/20 text-[16px] font-medium text-[#9DB3E0]"
                    >
                      {itemLabel.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[#F1EFE8]">
                      {itemLabel}
                    </span>
                    <span className="block text-[10.5px] text-[#6F8177]">
                      {momentLabel}
                      {item.bron === "supplement" ? " · supplement" : null}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-[#9FB0A6]">
                    {Math.round(bedrag.value * 10) / 10} {bedrag.unit}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onVerwijder(item)}
                    aria-label={`Verwijder ${itemLabel}`}
                    className="shrink-0 cursor-pointer rounded px-1.5 py-1 text-[14px] leading-none text-[#6F8177] transition-colors hover:text-[#F1EFE8] disabled:opacity-40"
                  >
                    &times;
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
