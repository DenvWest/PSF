"use client";

import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import {
  AUDIENCE_PARAM,
  audienceBand,
  type AudienceBand,
  type ContentAudience,
} from "@/lib/content-audience";
import {
  countByAudience,
  countByGroup,
  matchesSearch,
  sortLibraryItems,
  type LibraryItem,
  type LibrarySort,
} from "@/lib/library/library-item";
import LibraryCard from "@/components/library/LibraryCard";
import LibrarySidebar, {
  type LibraryCrossLink,
} from "@/components/library/LibrarySidebar";
import type { AudienceContext } from "@/components/library/LibraryAudienceLens";
import {
  LIB_SHELL,
  LIB_TOOLBAR_BUTTON,
} from "@/components/library/library-tokens";

export type LibraryFilterDef = {
  key: string;
  label: string;
  predicate: (item: LibraryItem) => boolean;
  /** Filters met dezelfde groep sluiten elkaar uit (radio-gedrag). */
  exclusiveGroup?: string;
};

type Weergave = "lijst" | "raster";

/** Aantal items per stap; de rest komt met "Toon meer". */
const PAGINA = 12;

const BAND_KOP: Record<AudienceBand, string | null> = {
  "voor-jou": null,
  algemeen: "Voor iedereen",
  "andere-fysiologie": "Voor de andere groep",
};

type LibraryBrowserProps = {
  /** Bepaalt de meetlabels; de vormtaal is voor beide gelijk. */
  surface: "blog" | "kennisbank";
  items: LibraryItem[];
  groups: ReadonlyArray<{ key: string; label: string; icon?: ReactNode }>;
  allesLabel: string;
  itemNoun: { enkel: string; meervoud: string };
  intro: { title: string; body: string; link?: { label: string; href: string } };
  audienceContext: Record<ContentAudience, AudienceContext>;
  initialAudience?: ContentAudience;
  initialGroup?: string;
  filters?: LibraryFilterDef[];
  sorts: ReadonlyArray<{ key: LibrarySort; label: string }>;
  zoekPlaceholder: string;
  crossLinks: LibraryCrossLink[];
  personalSlot?: ReactNode;
  /** Blok onder de lijst (check-CTA, disclaimer). */
  footerSlot?: ReactNode;
};

/**
 * De bibliotheek-browser: één keuzekolom plus één lijst, gedeeld door de blog
 * en de kennisbank. De publiekslens herordent, de rest snijdt.
 */
export default function LibraryBrowser({
  surface,
  items,
  groups,
  allesLabel,
  itemNoun,
  intro,
  audienceContext,
  initialAudience = "alle",
  initialGroup = "alles",
  filters = [],
  sorts,
  zoekPlaceholder,
  crossLinks,
  personalSlot,
  footerSlot,
}: LibraryBrowserProps) {
  const [audience, setAudience] = useState<ContentAudience>(initialAudience);
  const [group, setGroup] = useState(initialGroup);
  const [zoek, setZoek] = useState("");
  const [actieveFilters, setActieveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<LibrarySort>(sorts[0]?.key ?? "nieuwste");
  const [weergave, setWeergave] = useState<Weergave>("raster");
  const [zichtbaar, setZichtbaar] = useState(PAGINA);

  const zoekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupCounts = useMemo(() => countByGroup(items), [items]);

  const audienceCounts = useMemo(
    () => ({
      mannen: countByAudience(items, "mannen"),
      vrouwen: countByAudience(items, "vrouwen"),
    }),
    [items],
  );

  const zichtbareGroepen = useMemo(
    () =>
      groups
        .map((entry) => ({
          key: entry.key,
          label: entry.label,
          icon: entry.icon,
          count: groupCounts.get(entry.key) ?? 0,
        }))
        .filter((entry) => entry.count > 0),
    [groups, groupCounts],
  );

  const gefilterd = useMemo(() => {
    const actief = filters.filter((filter) =>
      actieveFilters.includes(filter.key),
    );

    const resultaat = items.filter((item) => {
      if (group !== "alles" && item.groupKey !== group) return false;
      if (!matchesSearch(item, zoek)) return false;
      return actief.every((filter) => filter.predicate(item));
    });

    return sortLibraryItems(resultaat, sort, audience);
  }, [items, group, zoek, filters, actieveFilters, sort, audience]);


  /* De bandkop hoort bij de eerste kaart van een band; vooraf berekenen zodat
     de render zelf geen lopende variabele hoeft bij te houden. */
  const rijen = useMemo(() => {
    const banden = gefilterd.map((item) =>
      audienceBand(item.audience, audience),
    );
    return gefilterd.map((item, index) => ({
      item,
      kop:
        index === 0 || banden[index] !== banden[index - 1]
          ? BAND_KOP[banden[index]]
          : null,
    }));
  }, [gefilterd, audience]);

  const getoond = rijen.slice(0, zichtbaar);
  const restant = rijen.length - getoond.length;

  const filtersActief =
    group !== "alles" || zoek.trim().length > 0 || actieveFilters.length > 0;

  function kiesAudience(value: ContentAudience) {
    setAudience(value);
    setZichtbaar(PAGINA);
    trackEvent(GA4_EVENTS.BIBLIOTHEEK_PUBLIEK, { surface, publiek: value });
    clarityTag(`${surface}_publiek`, value);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (value === "alle") {
        url.searchParams.delete(AUDIENCE_PARAM);
      } else {
        url.searchParams.set(AUDIENCE_PARAM, value);
      }
      window.history.replaceState(null, "", url.toString());
    }
  }

  function kiesGroup(value: string) {
    setGroup(value);
    setZichtbaar(PAGINA);
    trackEvent(GA4_EVENTS.BIBLIOTHEEK_FILTER, { surface, groep: value });
  }

  function wijzigZoek(value: string) {
    setZoek(value);
    setZichtbaar(PAGINA);
    if (zoekTimer.current) clearTimeout(zoekTimer.current);
    if (value.trim().length < 3) return;
    zoekTimer.current = setTimeout(() => {
      trackEvent(GA4_EVENTS.BIBLIOTHEEK_ZOEK, { surface });
    }, 900);
  }

  function toggleFilter(key: string) {
    const gekozen = filters.find((filter) => filter.key === key);
    setZichtbaar(PAGINA);

    setActieveFilters((huidig) => {
      if (huidig.includes(key)) {
        return huidig.filter((entry) => entry !== key);
      }
      const zonderConflict = gekozen?.exclusiveGroup
        ? huidig.filter((entry) => {
            const ander = filters.find((filter) => filter.key === entry);
            return ander?.exclusiveGroup !== gekozen.exclusiveGroup;
          })
        : huidig;
      return [...zonderConflict, key];
    });

    trackEvent(GA4_EVENTS.BIBLIOTHEEK_FILTER, { surface, groep: key });
  }

  function wisFilters() {
    setGroup("alles");
    setZoek("");
    setActieveFilters([]);
    setZichtbaar(PAGINA);
  }

  function toonMeer() {
    setZichtbaar((huidig) => huidig + PAGINA);
    trackEvent(GA4_EVENTS.BIBLIOTHEEK_MEER, { surface, getoond: zichtbaar });
  }

  const aantalLabel = `${gefilterd.length} ${
    gefilterd.length === 1 ? itemNoun.enkel : itemNoun.meervoud
  }`;

  return (
    <div className={LIB_SHELL}>
      <LibrarySidebar
        intro={intro}
        audience={audience}
        onAudience={kiesAudience}
        audienceCounts={audienceCounts}
        audienceContext={audienceContext}
        totaal={items.length}
        groups={zichtbareGroepen}
        group={group}
        onGroup={kiesGroup}
        allesLabel={allesLabel}
        toggles={filters.map((filter) => ({
          key: filter.key,
          label: filter.label,
          actief: actieveFilters.includes(filter.key),
          onToggle: () => toggleFilter(filter.key),
        }))}
        crossLinks={crossLinks}
        filtersActief={filtersActief}
        onWisFilters={wisFilters}
        personalSlot={personalSlot}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/80 pb-3">
          <p className="mr-auto text-sm tabular-nums text-stone-500">
            {aantalLabel}
          </p>

          <label className="relative order-first w-full sm:order-none sm:w-56">
            <span className="sr-only">{zoekPlaceholder}</span>
            <input
              type="search"
              value={zoek}
              onChange={(event) => wijzigZoek(event.target.value)}
              placeholder={zoekPlaceholder}
              className="h-9 w-full rounded-full border border-stone-200/90 bg-white pl-9 pr-3 text-[0.8125rem] text-stone-800 shadow-[0_1px_2px_rgba(28,25,23,0.03)] placeholder:text-stone-400 transition-shadow duration-200 focus:border-ps-green focus:outline-none focus:ring-2 focus:ring-ps-green/40 focus:shadow-[0_2px_10px_rgba(90,143,106,0.14)]"
            />
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path strokeLinecap="round" d="m10.5 10.5 3 3" />
            </svg>
          </label>

          <span className="relative">
            <select
              aria-label="Sorteren"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as LibrarySort);
                setZichtbaar(PAGINA);
              }}
              className={`${LIB_TOOLBAR_BUTTON} appearance-none pr-8`}
            >
              {sorts.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.55rem] text-stone-400"
            >
              ▼
            </span>
          </span>

          <div
            className="hidden items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5 sm:flex"
            role="group"
            aria-label="Weergave"
          >
            {(["lijst", "raster"] as const).map((optie) => (
              <button
                key={optie}
                type="button"
                onClick={() => setWeergave(optie)}
                aria-pressed={weergave === optie}
                title={optie === "lijst" ? "Lijst" : "Raster"}
                className={`h-8 rounded-full px-3 text-[0.75rem] font-medium capitalize transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${
                  weergave === optie
                    ? "bg-ps-green text-white shadow-[0_2px_6px_rgba(90,143,106,0.32)]"
                    : "text-stone-500 hover:-translate-y-px hover:text-ps-green"
                }`}
              >
                {optie}
              </button>
            ))}
          </div>
        </div>

        {getoond.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
            <p className="font-display text-base font-semibold text-stone-900">
              Geen resultaten
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
              Probeer een andere zoekterm of wis de filters.
            </p>
            <button
              type="button"
              onClick={wisFilters}
              className="mt-5 inline-flex min-h-10 items-center rounded-full bg-ps-green px-5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(90,143,106,0.28)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:bg-ps-green-hover hover:shadow-[0_6px_18px_rgba(90,143,106,0.36)] active:translate-y-0"
            >
              Wis filters
            </button>
          </div>
        ) : (
          <div
            className={
              weergave === "raster"
                ? "mt-5 grid gap-5 @container sm:grid-cols-2"
                : "mt-5 flex flex-col gap-3"
            }
          >
            {getoond.map(({ item, kop }, index) => {
              const toonKop = audience !== "alle" && kop !== null;

              return (
                <div
                  key={item.id}
                  className={
                    weergave === "raster"
                      ? `flex flex-col gap-3 ${toonKop ? "sm:col-span-2" : ""}`
                      : undefined
                  }
                >
                  {toonKop ? (
                    <p
                      className={`font-display text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-stone-400 ${
                        index === 0 ? "" : "mt-3 border-t border-stone-200/80 pt-4"
                      }`}
                    >
                      {kop}
                    </p>
                  ) : null}
                  <LibraryCard
                    item={item}
                    audience={audience}
                    weergave={weergave}
                    prioriteitBeeld={index < 4}
                    onOpen={() =>
                      trackEvent(GA4_EVENTS.BIBLIOTHEEK_ITEM_GEOPEND, {
                        surface,
                        groep: item.groupKey,
                        publiek: audience,
                        positie: index + 1,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {restant > 0 ? (
          <button
            type="button"
            onClick={toonMeer}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 px-5 text-sm font-semibold text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/40 hover:text-ps-green hover:shadow-[0_4px_14px_rgba(90,143,106,0.16)] active:translate-y-0"
          >
            Toon meer ({restant})
          </button>
        ) : null}

        {footerSlot != null ? (
          <div key="library-footer">{footerSlot}</div>
        ) : null}
      </div>
    </div>
  );
}
