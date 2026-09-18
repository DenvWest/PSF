"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { catalogEntry, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";

/**
 * Het zoeken als eigen scherm, niet als dropdown onder een knop.
 *
 * ## Waarom dit een schermwissel is en geen uitklapper
 *
 * De eerste vorm zette het zoekveld met zijn resultaten in een kleine,
 * absoluut gepositioneerde laag onder de "+ Toevoegen"-knop — een aanvulling
 * op de maaltijdtabel, geen eigen plek. Dat oogt als een detail van de tabel,
 * niet als de zoekervaring zelf.
 *
 * Deze vorm vervangt het hele scherm zolang je zoekt: een kop met terug-knop
 * en maaltijdwissel, een zoekveld, en de resultaten als volle rijen met foto.
 * Dat is de vorm die je uit een boodschappen- of dagboek-app kent, en het is
 * wat het scherm nu ook daadwerkelijk doet — zoeken is hier de taak, niet een
 * uitzondering op de tabelweergave.
 *
 * ## Wat er níét in zit
 *
 * Geen streepjescode scannen (vereist een productendatabase-koppeling die er
 * niet is) en geen "Mijn maaltijden" / "Mijn recepten" (vereist een
 * sjabloon-feature die niet bestaat). Een tab die niets doet is erger dan geen
 * tab — "Alle" en "Eerder gegeten" zijn de twee die hier al werkelijk iets
 * opleveren.
 */

export default function DagboekZoekScherm({
  moment,
  toegevoegd,
  suggesties,
  zoekActief,
  zoek,
  onZoekChange,
  onMomentChange,
  onKies,
  onVerwijder,
  onSluiten,
  busy = false,
}: {
  moment: EetmomentId;
  /** Items die deze sessie al bij dit moment horen. */
  toegevoegd: readonly DagboekItem[];
  /** Zoekresultaten, of — bij een leeg veld — wat je eerder at. */
  suggesties: readonly CatalogEntry[];
  /** Of `suggesties` een zoekresultaat is (voor de kop "Eerder gegeten" vs. niets). */
  zoekActief: boolean;
  zoek: string;
  onZoekChange: (waarde: string) => void;
  onMomentChange: (moment: EetmomentId) => void;
  onKies: (entry: CatalogEntry) => void;
  onVerwijder: (item: DagboekItem) => void;
  onSluiten: () => void;
  busy?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const momentLabel =
    EETMOMENTEN.find((m) => m.id === moment)?.label ?? moment;

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSluiten}
          aria-label="Terug naar je dag"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[#9FB0A6] hover:text-[#F1EFE8]"
        >
          <Icons.ChevronLeft s={17} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] px-3 text-[14px] font-semibold text-[#9CC5A9]"
          >
            {momentLabel}
            <Icons.ChevronDown s={14} />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Menu sluiten"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default border-none bg-transparent p-0"
              />
              <ul
                role="menu"
                className="absolute left-0 z-20 mt-1 m-0 flex w-40 list-none flex-col gap-0 rounded-[12px] border border-white/15 bg-[#16241a] p-1 shadow-2xl"
              >
                {EETMOMENTEN.map((keuze) => (
                  <li key={keuze.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onMomentChange(keuze.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full cursor-pointer rounded-[8px] border-none px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-white/[0.06] ${
                        keuze.id === moment
                          ? "bg-white/[0.05] text-[#9CC5A9]"
                          : "bg-transparent text-[#F1EFE8]"
                      }`}
                    >
                      {keuze.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </header>

      <label className="relative block">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6F8177]"
        >
          <Icons.Search s={15} />
        </span>
        <span className="sr-only">{`Zoek een product voor ${momentLabel.toLowerCase()}`}</span>
        <input
          type="search"
          autoFocus
          value={zoek}
          disabled={busy}
          onChange={(event) => onZoekChange(event.target.value)}
          placeholder={`Zoek een product voor ${momentLabel.toLowerCase()}…`}
          aria-label={`Zoek een product voor ${momentLabel.toLowerCase()}`}
          className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[14px] text-[#F1EFE8] outline-none transition-colors placeholder:text-[#6F8177] focus:border-white/40"
        />
      </label>

      {toegevoegd.length > 0 ? (
        <ul
          aria-label={`Toegevoegd bij ${momentLabel.toLowerCase()}`}
          className="m-0 flex list-none flex-col gap-1.5 rounded-xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/[0.08] p-2 py-1.5"
        >
          {toegevoegd.map((item, index) => {
            const label = catalogEntry(item.key)?.labelNl ?? item.key;
            return (
              <li
                key={`${item.key}-${index}`}
                className="flex items-center justify-between gap-2 py-0.5"
              >
                <span className="truncate text-[12.5px] text-[#E7EDE8]">
                  {label}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onVerwijder(item)}
                  aria-label={`Verwijder ${label} uit ${momentLabel.toLowerCase()}`}
                  className="cursor-pointer rounded px-1 text-[13px] leading-none text-[#6F8177] transition-colors hover:text-[#F1EFE8] disabled:opacity-40"
                >
                  &times;
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div>
        {!zoekActief && suggesties.length > 0 ? (
          <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6F8177]">
            Eerder gegeten
          </p>
        ) : null}

        {suggesties.length === 0 ? (
          <p className="m-0 px-1 py-2 text-[12px] leading-relaxed text-[#6F8177]">
            {zoekActief
              ? "Niets gevonden."
              : "Nog niets eerder geregistreerd — begin met typen."}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {suggesties.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onKies(entry)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <FoodThumbnail entry={entry} size={40} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] text-[#F1EFE8]">
                        {entry.labelNl}
                      </span>
                      <span className="block text-[10.5px] text-[#6F8177]">
                        {entry.porties[0]?.labelNl ?? ""}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/20 text-[#F1EFE8]"
                  >
                    <Icons.Plus s={13} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
