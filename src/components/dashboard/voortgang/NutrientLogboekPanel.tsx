"use client";

import { useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import NutrientRouteChoiceCard from "@/components/dashboard/voortgang/NutrientRouteChoiceCard";
import { trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";
import {
  ROUTE_STATUS_COLOR,
  routeMatchesQuery,
  routesWithOpenChoice,
} from "@/lib/nutrition-route-choice";
import { sortRoutesByAttention, type NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * Het voedingslogboek: wat je check zegt over de volwaardigheid van je inname,
 * per stof, met de keuze eraan vast.
 *
 * ## Waarom dit blok op twee schermen staat
 *
 * Kompas is waar je kiest, Keuze is waar je aanbod staat — maar voor voeding
 * viel dat onderscheid weg zodra de vraag "haal ik dit uit mijn eten of uit
 * een potje" er was. Die vraag hoort op beide plekken, want op beide plekken
 * is hij het antwoord: op Kompas op de vraag *wat doe ik nu*, op Keuze op de
 * vraag *waarom staat dit aanbod hier*.
 *
 * Wat er per surface verschilt is de diepte, niet de inhoud. Kompas toont de
 * stoffen die aandacht vragen; Keuze toont alles wat een keuze openheeft. Eén
 * component, twee standen — geen tweede lijst die kan gaan afwijken.
 *
 * ## Waarom hier één stof tegelijk openstaat
 *
 * In zijn eerste vorm stonden alle rijen volledig uitgeklapt onder elkaar:
 * vijf stoffen × status, drempel, meetnuance, drie knoppen en drie bronnen.
 * Dat is geen keuzescherm meer maar een dossier waarin de keuze verdrinkt —
 * en juist die keuze is het enige waar dit blok voor bestaat.
 *
 * Nu is elke stof één regel, en klapt er één tegelijk open. Dat laatste is een
 * bewuste beperking en geen technische: twee open dossiers naast elkaar
 * brengen precies de muur terug die we net weghaalden, en de vraag is per stof
 * te beantwoorden — je hoeft eiwit en zink niet naast elkaar te zien om over
 * eiwit te beslissen.
 *
 * De chiprij erboven doet wat de keuzekolom op /supplementen doet: springen
 * naar wat je zoekt. Bij vijf items is dat een chiprij en geen zoekveld — je
 * wilt Omega-3 áánklikken, niet typen.
 *
 * ## Wat hier bewust niet staat
 *
 * Geen milligrammen, geen dagtotalen, geen percentage van een ADH. De check
 * meet frequenties en `food-sources.ts` staat op `verified: false`; een
 * optelsom zou schijnprecisie zijn op precies het scherm waar iemand zijn
 * keuze op baseert. Zie de kop van `nutrient-routes.ts`.
 */

export default function NutrientLogboekPanel({
  statuses,
  gateOpen,
  surface,
  compact = false,
  maxRows,
  onGoVoortgang,
  proteinTarget = null,
  ageRange = null,
  showSearch = false,
}: {
  statuses: readonly NutrientRouteStatus[];
  gateOpen: boolean;
  surface: string;
  compact?: boolean;
  /** Kompas toont er hooguit een paar; Keuze toont ze allemaal. */
  maxRows?: number;
  onGoVoortgang?: () => void;
  /** Persoonlijke eiwit-range; alleen de eiwitrij toont hem. */
  proteinTarget?: ProteinTargetRange | null;
  ageRange?: string | null;
  /**
   * Het zoekveld. Vandaag zijn het vijf stoffen en doen de chips het werk —
   * daarom staat hij alleen op Keuze, waar het logboek zijn eigen scherm heeft
   * en waar de lijst gaat groeien zodra er meer stoffen en bronnen bij komen.
   * Op Kompas zou hij nu meubilair zijn boven twee regels.
   */
  showSearch?: boolean;
}) {
  // Alleen wat een keuze openheeft, sterkste signaal eerst. Een stof die je al
  // uit je eten haalt is goed nieuws, maar geen keuze.
  const open = useMemo(
    () => sortRoutesByAttention(routesWithOpenChoice(statuses)),
    [statuses],
  );

  // Niets staat open bij binnenkomst: het overzicht is de eerste staat, en de
  // stof die je aanklikt is de tweede. Zou de bovenste automatisch openklappen,
  // dan is de rij eronder meteen weer weggedrukt.
  const [openNutrient, setOpenNutrient] = useState<NutrientId | null>(null);
  // `null` = alles. Een chip filtert de lijst; hij vervangt hem niet, zodat de
  // terugweg naar het overzicht altijd één klik is.
  const [filter, setFilter] = useState<NutrientId | null>(null);
  const [query, setQuery] = useState("");

  if (open.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Je voedingslogboek
        </p>
        <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Je haalt alle vijf de stoffen uit je eten. Dan is hier niets te kiezen
          — en dat is de bedoeling.
        </p>
      </div>
    );
  }

  // Een chip filtert binnen wat er te kiezen valt; de kaplimiet geldt daarna,
  // zodat "Omega-3" op Kompas hem ook toont als hij buiten de eerste twee viel.
  // Zoeken staat daar weer bovenop: een treffer op een bron ("haring") mag de
  // stof erachter opleveren, ook als er een chip aanstaat.
  const byChip = filter ? open.filter((row) => row.nutrient === filter) : open;
  const searching = query.trim().length > 0;
  const filtered = searching
    ? open.filter((row) => routeMatchesQuery(row, query))
    : byChip;
  // Tijdens zoeken geldt de kaplimiet niet: je zoekt juist naar iets wat
  // buiten de eerste twee viel, en het dan alsnog wegsnijden is het ergste
  // antwoord dat een zoekveld kan geven.
  const shown = maxRows != null && !searching ? filtered.slice(0, maxRows) : filtered;
  const rest = filtered.length - shown.length;

  const handleFilter = (next: NutrientId | null) => {
    setFilter(next);
    // Eén stof kiezen ís hem willen zien: hem dan nog dicht laten staan kost
    // een tweede klik voor iets wat je al gevraagd hebt.
    setOpenNutrient(next);
    trackEvent("nutrition_logboek_filter", {
      surface,
      nutrient: next ?? "alles",
    });
    clarityTag("nutrition_logboek_filter", next ?? "alles");
  };

  const handleToggle = (nutrient: NutrientId) => {
    const next = openNutrient === nutrient ? null : nutrient;
    setOpenNutrient(next);
    if (next) {
      trackEvent("nutrition_route_expanded", {
        surface,
        nutrient,
        route_status: open.find((row) => row.nutrient === nutrient)?.status ?? "onbekend",
      });
      clarityTag("nutrition_route", nutrient);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <p className="m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Je voedingslogboek
        </p>
        <p className="m-0 mt-1 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Per stof: wat je check erover zegt, en hoe je hem binnenkrijgt. Open
          een stof en kies zelf of dat uit je eten komt, uit een supplement, of
          allebei.
        </p>
      </div>

      {/* Zoeken op stof én op bron: wie "haring" typt weet meestal niet bij
          welke stof die hoort, en dát is de vraag die het logboek beantwoordt.
          Zie `routeMatchesQuery`. */}
      {showSearch && open.length > 1 ? (
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7E8C82]"
          >
            <Icons.Search s={13} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              if (query.trim().length > 0) {
                trackEvent("nutrition_logboek_search", {
                  surface,
                  results: filtered.length,
                });
              }
            }}
            placeholder="Zoek een stof of voedingsmiddel — bijvoorbeeld haring"
            aria-label="Zoek in je voedingslogboek"
            className="min-h-[34px] w-full rounded-lg border border-white/12 bg-black/20 pl-8 pr-2.5 text-[12px] text-[#F1EFE8] placeholder:text-[#7E8C82] focus:border-[#5A8F6A] focus:outline-none"
          />
        </div>
      ) : null}

      {/* De keuzekolom van /supplementen, in de ruimte die dit scherm heeft:
          de linker rail is al bezet door je domeinen, dus wordt het een
          chiprij. De stip draagt de status, zodat je vóór het openklappen al
          ziet welke stof je aandacht wil. */}
      {open.length > 1 && !searching ? (
        <nav aria-label="Kies een stof" className="flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => handleFilter(null)}
            className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold transition ${
              filter === null
                ? "border-[#5A8F6A] bg-[rgba(90,143,106,0.18)] text-[#9CC5A9]"
                : "border-white/12 bg-transparent text-[#9FB0A6] hover:border-white/25"
            }`}
          >
            Alles
            <span className="tabular-nums text-[#7E8C82]">{open.length}</span>
          </button>
          {open.map((row) => {
            const active = filter === row.nutrient;
            return (
              <button
                key={row.nutrient}
                type="button"
                aria-pressed={active}
                onClick={() => handleFilter(active ? null : row.nutrient)}
                className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold transition ${
                  active
                    ? "border-[#5A8F6A] bg-[rgba(90,143,106,0.18)] text-[#9CC5A9]"
                    : "border-white/12 bg-transparent text-[#9FB0A6] hover:border-white/25"
                }`}
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: ROUTE_STATUS_COLOR[row.status] }}
                />
                {row.label}
              </button>
            );
          })}
        </nav>
      ) : null}

      {/* Een zoekterm zonder treffer moet dat zeggen. Een stil lege lijst leest
          als een storing, en de terugweg hoort in dezelfde zin te staan. */}
      {searching && shown.length === 0 ? (
        <p className="m-0 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Niets gevonden voor “{query.trim()}”.{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[#9CC5A9] underline"
          >
            Toon alles
          </button>
        </p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {shown.map((status) => (
          <NutrientRouteChoiceCard
            key={status.nutrient}
            status={status}
            gateOpen={gateOpen}
            surface={surface}
            compact={compact}
            open={openNutrient === status.nutrient}
            onToggle={() => handleToggle(status.nutrient)}
            proteinTarget={proteinTarget}
            ageRange={ageRange}
          />
        ))}
      </ul>

      {rest > 0 && onGoVoortgang ? (
        <button
          type="button"
          onClick={onGoVoortgang}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#9CC5A9]"
        >
          Nog {rest} {rest === 1 ? "stof" : "stoffen"} in je logboek
          <Icons.ChevronRight s={14} />
        </button>
      ) : null}

      <p className="m-0 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
        Uit je eigen antwoorden, in porties en momenten — geen milligrammen. Zo
        meet de check, en verder gaan we niet.
      </p>
    </div>
  );
}
