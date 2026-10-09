"use client";

import { useMemo, useState } from "react";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { searchCatalog } from "@/data/nutrition/food-catalog";
import { trackEvent } from "@/lib/ga4";
import { rijksteBronnen, stofInfo, type RijksteStand, type RijksteStof } from "@/lib/nutrition-rijkste-bronnen";

/**
 * De rijkste voedingsbronnen van één stof (start op 10, "Toon meer" tot de hele lijst, zoeken en filteren op voedselgroep), onder "Wat hieraan bijdroeg" in het
 * stofdetail. Logica en keuzes staan in `nutrition-rijkste-bronnen.ts`; dit
 * is alleen de weergave met de drie standen, een tik om toe te voegen en een
 * sprong naar de vergelijkingstabel met de top 3.
 */

const STANDEN: readonly { id: RijksteStand; label: string; uitleg: string }[] = [
  { id: "portie", label: "Per portie", uitleg: "Wat je per keer binnenkrijgt, op de gebruikelijke portie." },
  { id: "100g", label: "Per 100 g", uitleg: "Veel stof in weinig gewicht — ook als je er zelden 100 g van eet." },
  {
    id: "100kcal",
    label: "Per 100 kcal",
    uitleg: "Veel stof voor weinig calorieën. Afgeleid: NEVO-gehalte gedeeld door NEVO-energie.",
  },
];

const START = 10;
const STAP = 10;

const GROEPEN = [
  { id: "vis", label: "Vis & schaaldieren", categorieen: ["vis", "zeevruchten"] },
  { id: "noten", label: "Noten & zaden", categorieen: ["noten", "zaden"] },
  { id: "peulvruchten", label: "Peulvruchten", categorieen: ["peulvruchten", "plantaardig"] },
  { id: "groente", label: "Groente & fruit", categorieen: ["groenten", "fruit"] },
  { id: "granen", label: "Granen & brood", categorieen: ["granen", "brood", "pasta", "ontbijt"] },
  { id: "zuivel", label: "Zuivel & ei", categorieen: ["zuivel", "kaas", "eieren"] },
  { id: "vlees", label: "Vlees", categorieen: ["vlees", "orgaanvlees"] },
] as const;

function getal(value: number): string {
  return value.toLocaleString("nl-NL", { maximumFractionDigits: value < 10 ? 1 : 0 });
}

export default function DagboekRijksteBronnen({
  stof,
  busy = false,
  onKies,
  onVergelijk,
}: {
  stof: RijksteStof;
  busy?: boolean;
  onKies: (key: string) => void;
  onVergelijk: (keys: readonly string[]) => void;
}) {
  const [stand, setStand] = useState<RijksteStand>("portie");
  const [zoek, setZoek] = useState("");
  const [groep, setGroep] = useState<string | null>(null);
  const [zichtbaar, setZichtbaar] = useState(START);
  const alle = useMemo(() => rijksteBronnen(stof, stand, Number.MAX_SAFE_INTEGER), [stof, stand]);
  const term = zoek.trim();
  const actieveGroep = GROEPEN.find((g) => g.id === groep) ?? null;
  const beschikbareGroepen = useMemo(
    () => GROEPEN.filter((g) => alle.some((b) => (g.categorieen as readonly string[]).includes(b.entry.category))),
    [alle],
  );
  const gevonden = useMemo(() => {
    const treffers = term ? new Set(searchCatalog(term, 200).map((entry) => entry.key)) : null;
    return alle
      .map((bron, index) => ({ bron, rang: index + 1 }))
      .filter(({ bron }) => !treffers || treffers.has(bron.entry.key))
      .filter(({ bron }) => !actieveGroep || (actieveGroep.categorieen as readonly string[]).includes(bron.entry.category));
  }, [alle, term, actieveGroep]);
  const bronnen = gevonden.slice(0, zichtbaar);
  const nogMeer = gevonden.length - bronnen.length;
  const hoogste = alle[0]?.waarde ?? 0;
  const { label, ri, kern } = stofInfo(stof);
  const kleur = kern ? `var(--vd-stof-${stof})` : "var(--vd-ink-3)";
  const actief = STANDEN.find((s) => s.id === stand) ?? STANDEN[0];

  function kiesStand(nieuw: RijksteStand) {
    if (nieuw === stand) return;
    setStand(nieuw);
    trackEvent("nutrition_dagboek_rijkste_stand", { nutrient: stof, stand: nieuw });
  }

  if (alle.length === 0) return null;

  return (
    <section aria-labelledby={`rijkste-${stof}`} className="overflow-hidden rounded-2xl border border-white/10">
      <header className="flex flex-col gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <h3 id={`rijkste-${stof}`} className="m-0 font-sans text-[13.5px] font-bold text-[var(--vd-ink)]">
          Rijkste bronnen van {label.toLowerCase()}
        </h3>
        <div role="radiogroup" aria-label="Rangschik" className="flex w-full rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {STANDEN.map((optie) => (
            <button
              key={optie.id}
              type="button"
              role="radio"
              aria-checked={stand === optie.id}
              onClick={() => kiesStand(optie.id)}
              className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors ${
                stand === optie.id
                  ? "bg-[var(--vd-sage)] text-[var(--vd-bg)]"
                  : "text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
              }`}
            >
              {optie.label}
            </button>
          ))}
        </div>
        <p className="m-0 text-[11px] leading-relaxed text-[var(--vd-ink-3)]">{actief.uitleg}</p>
        <input
          type="search"
          value={zoek}
          onChange={(event) => {
            setZoek(event.target.value);
            setZichtbaar(START);
          }}
          onBlur={() => {
            if (term) trackEvent("nutrition_dagboek_rijkste_zoek", { nutrient: stof, treffers: gevonden.length });
          }}
          placeholder={`Zoek een voedingsmiddel met ${label.toLowerCase()}`}
          aria-label={`Zoek een voedingsmiddel met ${label.toLowerCase()}`}
          className="min-h-[36px] w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12px] text-[var(--vd-ink)] placeholder:text-[var(--vd-ink-4)] focus:border-[var(--vd-sage)] focus:outline-none"
        />
        {beschikbareGroepen.length > 1 ? (
          <div role="group" aria-label="Filter op voedselgroep" className="flex flex-wrap gap-1.5">
            {beschikbareGroepen.map((g) => {
              const aan = g.id === groep;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={aan}
                  onClick={() => {
                    setGroep(aan ? null : g.id);
                    setZichtbaar(START);
                    if (!aan) trackEvent("nutrition_dagboek_rijkste_groep", { nutrient: stof, groep: g.id });
                  }}
                  className={`min-h-[30px] cursor-pointer rounded-full border px-2.5 text-[11px] font-semibold transition-colors ${
                    aan
                      ? "border-[var(--vd-sage)] bg-[var(--vd-sage)] text-[var(--vd-bg)]"
                      : "border-white/10 text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      {bronnen.length === 0 ? (
        <p className="m-0 px-4 py-3 text-[12px] text-[var(--vd-ink-3)]">
          Niets gevonden met {label.toLowerCase()}{term ? <> voor &ldquo;{term}&rdquo;</> : null}.
        </p>
      ) : null}

      <ol className="m-0 list-none p-0">
        {bronnen.map(({ bron, rang }) => {
          const breedte = hoogste > 0 ? Math.max(4, Math.round((bron.waarde / hoogste) * 100)) : 0;
          const riAandeel =
            stand === "portie" && ri !== null ? Math.round((bron.perPortie / ri) * 100)
              : null;
          const context = [
            `${bron.portieLabel} · ${bron.portieGram} g`,
            stof !== "fiberG" && bron.vezelsPerPortie !== null && bron.vezelsPerPortie >= 0.1 ? `${getal(bron.vezelsPerPortie)} g vezels` : null,
            bron.kcalPerPortie !== null ? `${Math.round(bron.kcalPerPortie)} kcal` : null,
          ].filter((deel): deel is string => deel !== null);

          return (
            <li key={bron.entry.key} className="border-b border-white/[0.06] last:border-b-0">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  trackEvent("nutrition_dagboek_rijkste_gekozen", { nutrient: stof, stand, positie: rang });
                  onKies(bron.entry.key);
                }}
                aria-label={`Voeg ${bron.entry.labelNl} toe`}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03] disabled:opacity-50"
              >
                <span className="w-4 shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink-4)]">
                  {rang}
                </span>
                <FoodThumbnail entry={bron.entry} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[var(--vd-ink)]">{bron.entry.labelNl}</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[var(--vd-track)]">
                    <span
                      aria-hidden
                      className="block h-full rounded-full"
                      style={{ width: `${breedte}%`, background: kleur, opacity: 0.85 }}
                    />
                  </span>
                  <span className="mt-1 block truncate text-[10.5px] text-[var(--vd-ink-4)]">{context.join(" · ")}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-mono text-[12.5px] tabular-nums text-[var(--vd-ink)]">
                    {getal(bron.waarde)} <span className="text-[10px] text-[var(--vd-ink-3)]">{bron.unit}</span>
                  </span>
                  <span className="text-[10px] text-[var(--vd-ink-4)]">
                    {stand === "portie" ? (riAandeel !== null ? `${riAandeel}% ADH` : "per portie") : stand === "100g" ? "per 100 g" : "per 100 kcal"}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-[16px] leading-none text-[var(--vd-sage-2)]">
                  +
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {nogMeer > 0 ? (
        <button
          type="button"
          onClick={() => {
            setZichtbaar(zichtbaar + STAP);
            trackEvent("nutrition_dagboek_rijkste_meer", { nutrient: stof, aantal: bronnen.length + Math.min(STAP, nogMeer) });
          }}
          className="w-full cursor-pointer border-t border-white/10 bg-white/[0.02] px-4 py-2.5 text-[12px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:bg-white/[0.04]"
        >
          Toon {Math.min(STAP, nogMeer)} meer <span className="font-normal text-[var(--vd-ink-3)]">· nog {nogMeer}</span>
        </button>
      ) : null}

      {alle.length >= 2 ? (
        <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-2.5">
          <span className="text-[10.5px] leading-snug text-[var(--vd-ink-4)]">
            Alleen gemeten waarden: NEVO-online 2025/9.0 (RIVM) en beoordeelde bronnen. Supplementen staan hier niet tussen.
          </span>
          <button
            type="button"
            onClick={() => {
              const keys = alle.slice(0, 3).map((b) => b.entry.key);
              trackEvent("nutrition_dagboek_rijkste_vergelijk", { nutrient: stof, stand, aantal: keys.length });
              onVergelijk(keys);
            }}
            className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg border border-[rgb(var(--vd-sage-rgb)/40%)] bg-[rgb(var(--vd-sage-rgb)/10%)] px-3 py-1.5 text-[12px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:border-[var(--vd-sage)] hover:bg-[rgb(var(--vd-sage-rgb)/20%)]"
          >
            Vergelijk top 3
          </button>
        </footer>
      ) : null}
    </section>
  );
}
