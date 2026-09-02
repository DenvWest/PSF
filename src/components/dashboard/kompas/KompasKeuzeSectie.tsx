"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { buildDashboardKeuzeHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import {
  aanbevelingOriginLine,
  buildKompasAanbevelingen,
  weekIndexFromDate,
} from "@/lib/kompas-aanbeveling";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { isLadderMomentDomain, type LadderMomentDomain } from "@/lib/ladder-moments";
import { useLadderMoments } from "@/lib/ladder-moments-context";
import { resolveSchapDomain } from "@/lib/schap-availability";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";
import type { DashboardData, PillarId } from "@/types/dashboard";

const ACCENT = "#5A8F6A";
const MAX_ROWS_PER_GROUP = 5;
const MAX_ROWS_SINGLE_GROUP = 8;

type KompasKeuzeView = "aanbevolen" | "mijn_keuze";

type KompasKeuzeSectieProps = {
  priorityDomain: PillarId;
  /**
   * Wat de analyse aanwijst (`model.enginePriority`). Gelijk aan
   * `priorityDomain` zolang de gebruiker zelf geen andere focus koos.
   */
  enginePriorityDomain?: PillarId | null;
  /** `shouldShowEngineShiftNudge`: je koos zelf een focus én de analyse wijst nu iets anders aan. */
  showEngineShiftNudge?: boolean;
  /** Zet je focus op het analyse-domein (`accept_engine`). */
  onAcceptEngine?: () => void;
  acceptEngineBusy?: boolean;
  /** Voor de Aanbevolen-tab: leest de domeinchecks via `resolveDomainLadderReadout`. */
  data?: DashboardData;
  onOpenDomain: (domain: PillarId) => void;
  /** Stuurt naar Mijn Dag op een gepland moment. Zonder deze prop valt die bestemming terug op het domeinscherm. */
  onOpenAgenda?: (date?: string) => void;
};

type KeuzeGroup = {
  key: string;
  domain: PillarId | null;
  label: string;
  color: string;
  items: VoortgangFavoriteItem[];
  /** Alleen op Aanbevolen: het laag-label rechts in de kaartkop, in plaats van de telling. */
  badge?: string;
  /** Alleen op Aanbevolen: waarop deze laag rust, onderaan de kaart. */
  originLine?: string;
  isPriority?: boolean;
  isEngineAdvice?: boolean;
};

/**
 * Waar één rij naartoe gaat. Bepaald per rij, niet per kaart — een supplement
 * en een geplande activiteit in hetzelfde domein wijzen naar verschillende
 * plekken.
 */
type ItemDestination =
  | { kind: "domain" }
  | { kind: "schap" }
  | { kind: "agenda"; date: string };

function kindIcon(kind: VoortgangFavoriteItem["kind"]): ReactNode {
  switch (kind) {
    case "supplement":
      return <Icons.Pill s={12} />;
    case "dienst":
      return <Icons.Briefcase s={12} />;
    default:
      return <Icons.Activity s={12} />;
  }
}

/**
 * Herkomst onder de titel: waar je hem koos, nooit merk/prijs/oordeel.
 * Een ladderrij draagt zijn laag, een supplement of dienst zijn soort — een
 * activiteit draagt niets extra's, want dat is de standaard op deze surface.
 */
function metaLine(item: VoortgangFavoriteItem): string | null {
  const parts: string[] = [];
  const laag = parseLadderFavoriteLayer(item.id);
  const laagNaam = item.domain && laag != null ? resolveLadderLayerName(item.domain, laag) : null;
  if (laagNaam) {
    parts.push(`Prioriteit ${laag} · ${laagNaam}`);
  }
  if (item.kind === "supplement") {
    parts.push("Supplement");
  } else if (item.kind === "dienst") {
    parts.push("Dienst");
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function domainOrder(priorityDomain: PillarId): PillarId[] {
  return [priorityDomain, ...KOMPAS_RAIL_PILLAR_IDS.filter((id) => id !== priorityDomain)];
}

/**
 * Groepeer op domein, prioriteitsdomein eerst en verder in de volgorde van de
 * ringen hierboven — zodat de kaarten dezelfde leesrichting houden als de
 * balken. Rijen zonder domein (bewaard vóór de domein-scoping) krijgen een
 * eigen groep: liever geen herkomst dan een verzonnen herkomst.
 */
function buildKeuzeGroups(
  items: VoortgangFavoriteItem[],
  priorityDomain: PillarId,
): KeuzeGroup[] {
  const groups: KeuzeGroup[] = [];
  for (const domain of domainOrder(priorityDomain)) {
    const rows = items.filter((item) => item.domain === domain);
    if (rows.length === 0) {
      continue;
    }
    groups.push({
      key: domain,
      domain,
      label: PILLAR[domain].label,
      color: PILLAR[domain].color,
      items: rows,
    });
  }

  const zonderDomein = items.filter((item) => !item.domain);
  if (zonderDomein.length > 0) {
    groups.push({
      key: "overig",
      domain: null,
      label: "Overig",
      color: "#7E8C82",
      items: zonderDomein,
    });
  }

  return groups;
}

/**
 * Eén kaart per domein met een ladder. Welke laag en welke actie dat wordt,
 * beslist `buildKompasAanbevelingen` — laag uit je laatste meting, actie
 * roterend per week. Hier staat alleen hoe dat op de kaart komt te staan.
 *
 * Het favoriet-id komt uit dezelfde bron als een echte ladderkeuze, zodat
 * `metaLine` er de laagnaam uit leest zonder een tweede functie.
 */
function buildAanbevolenGroups(
  priorityDomain: PillarId,
  data: DashboardData | undefined,
  weekIndex: number,
  enginePriorityDomain: PillarId | null,
): KeuzeGroup[] {
  return buildKompasAanbevelingen(
    priorityDomain,
    data,
    weekIndex,
    enginePriorityDomain,
  ).map((row) => ({
    key: row.domain,
    domain: row.domain,
    label: row.label,
    color: row.color,
    badge: row.stateLabel
      ? `Prioriteit ${row.layerId} · ${row.stateLabel}`
      : `Prioriteit ${row.layerId}`,
    originLine: aanbevelingOriginLine(row.origin),
    isPriority: row.isPriority,
    isEngineAdvice: row.isEngineAdvice,
    items: [
      {
        id: row.itemId,
        title: row.action,
        kind: "activiteit" as const,
        domain: row.domain,
      },
    ],
  }));
}

/**
 * Mijn keuze: heeft dit al een moment, dan is Mijn Dag de bestemming. Anders
 * is het nog niet gepland — dan gaat een supplement of dienst naar het schap
 * (oordeel en prijs staan daar) en een activiteit naar de ladder (waar je hem
 * plant).
 */
function resolveKeuzeDestination(
  item: VoortgangFavoriteItem,
  domain: PillarId,
  momentFor: ((domain: LadderMomentDomain, title: string) => { date: string } | null) | null,
): ItemDestination {
  if (
    (item.kind === "activiteit" || item.kind === "dienst") &&
    momentFor &&
    isLadderMomentDomain(domain)
  ) {
    const block = momentFor(domain, item.title);
    if (block) {
      return { kind: "agenda", date: block.date };
    }
  }
  if (item.kind === "supplement" || item.kind === "dienst") {
    return resolveSchapDomain(domain) ? { kind: "schap" } : { kind: "domain" };
  }
  return { kind: "domain" };
}

/**
 * Eén groep = volle breedte, twee = halven, drie of meer = drie kolommen. Een
 * vast `grid-cols-3` laat bij één domein twee derde van de rij leeg; de
 * klassen staan voluit zodat Tailwind ze in de build ziet.
 */
function gridColumns(count: number): string {
  if (count <= 1) {
    return "";
  }
  if (count === 2) {
    return "@[620px]/tile:grid-cols-2";
  }
  return "@[620px]/tile:grid-cols-2 @[980px]/tile:grid-cols-3";
}

const ROW_CLASS =
  "flex items-start gap-2.5 border-t border-white/[0.05] px-3.5 py-2.5 text-left no-underline first:border-t-0";
const ROW_STATIC_CLASS = `${ROW_CLASS} text-[#F1EFE8]`;
const ROW_INTERACTIVE_CLASS = `${ROW_CLASS} w-full cursor-pointer text-[#F1EFE8] transition hover:bg-white/[0.04]`;

function RowContent({
  item,
  color,
  interactive,
}: {
  item: VoortgangFavoriteItem;
  color: string;
  interactive: boolean;
}) {
  const meta = metaLine(item);
  return (
    <>
      <span
        aria-hidden
        className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${color}24`, color }}
      >
        {kindIcon(item.kind)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-snug text-[#F1EFE8] text-pretty">
          {item.title}
        </span>
        {meta ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-[#7E8C82]">{meta}</span>
        ) : null}
      </span>
      {interactive ? (
        <span aria-hidden className="mt-0.5 shrink-0 text-[#7E8C82]">
          <Icons.ChevronRight s={13} />
        </span>
      ) : null}
    </>
  );
}

function KeuzeRow({
  item,
  group,
  destination,
  onOpenDomain,
  onOpenAgenda,
  onNavigate,
}: {
  item: VoortgangFavoriteItem;
  group: KeuzeGroup;
  destination: ItemDestination | null;
  onOpenDomain: (domain: PillarId) => void;
  onOpenAgenda?: (date?: string) => void;
  onNavigate: (destination: ItemDestination) => void;
}) {
  if (!destination || !group.domain) {
    return (
      <span className={ROW_STATIC_CLASS}>
        <RowContent item={item} color={group.color} interactive={false} />
      </span>
    );
  }

  const domain = group.domain;

  if (destination.kind === "schap") {
    const schapDomain = resolveSchapDomain(domain);
    if (!schapDomain) {
      return (
        <span className={ROW_STATIC_CLASS}>
          <RowContent item={item} color={group.color} interactive={false} />
        </span>
      );
    }
    return (
      <Link
        href={buildDashboardKeuzeHref(schapDomain, "favorieten")}
        aria-label={`Bekijk ${item.title} op Keuze`}
        onClick={() => onNavigate(destination)}
        className={ROW_INTERACTIVE_CLASS}
      >
        <RowContent item={item} color={group.color} interactive />
      </Link>
    );
  }

  if (destination.kind === "agenda") {
    return (
      <button
        type="button"
        aria-label={`Bekijk ${item.title} op Mijn Dag`}
        onClick={() => {
          onNavigate(destination);
          onOpenAgenda?.(destination.date);
        }}
        className={ROW_INTERACTIVE_CLASS}
      >
        <RowContent item={item} color={group.color} interactive />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Open ${item.title} op je ladder`}
      onClick={() => {
        onNavigate(destination);
        onOpenDomain(domain);
      }}
      className={ROW_INTERACTIVE_CLASS}
    >
      <RowContent item={item} color={group.color} interactive />
    </button>
  );
}

function KeuzeGroupCard({
  group,
  maxRows,
  resolveDestination,
  onOpenDomain,
  onOpenAgenda,
  onRowNavigate,
}: {
  group: KeuzeGroup;
  maxRows: number;
  resolveDestination: (item: VoortgangFavoriteItem, domain: PillarId) => ItemDestination;
  onOpenDomain: (domain: PillarId) => void;
  onOpenAgenda?: (date?: string) => void;
  onRowNavigate: (group: KeuzeGroup, item: VoortgangFavoriteItem, destination: ItemDestination) => void;
}) {
  const shown = group.items.slice(0, maxRows);
  const rest = group.items.length - shown.length;
  const style = { fontFamily: "var(--f-sans)" } as CSSProperties;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-black/15 ${
        group.isPriority || group.isEngineAdvice
          ? "border-[#5A8F6A]/40"
          : "border-white/8"
      }`}
      style={style}
    >
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/8 px-3.5 py-2.5">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: group.color }}
        />
        <span className="min-w-0 flex-1 truncate font-serif text-[14.5px] text-[#F1EFE8]">
          {group.label}
        </span>
        {/*
          Twee losse markeringen, want ze beantwoorden twee vragen: waar je
          focus staat (jouw keuze) en wat de analyse aanwijst
          (`model.enginePriority`). Meestal hetzelfde domein en dus één chip;
          koos je zelf een andere focus, dan hoort dat verschil zichtbaar te
          zijn in plaats van dat één van de twee stil wint.
        */}
        {group.isEngineAdvice ? (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#C8956C]">
            Advies
          </span>
        ) : null}
        {group.isPriority ? (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9CC5A9]">
            Je focus
          </span>
        ) : null}
        <span className="shrink-0 rounded-md border border-white/10 bg-black/25 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#9FB0A6]">
          {group.badge ?? <span className="tabular-nums">{group.items.length}</span>}
        </span>
      </span>

      <span className="block">
        {shown.map((item) => (
          <KeuzeRow
            key={item.id}
            item={item}
            group={group}
            destination={group.domain ? resolveDestination(item, group.domain) : null}
            onOpenDomain={onOpenDomain}
            onOpenAgenda={onOpenAgenda}
            onNavigate={(destination) => onRowNavigate(group, item, destination)}
          />
        ))}

        {rest > 0 ? (
          <span className="block border-t border-white/[0.05] px-3.5 py-2 text-[11.5px] text-[#7E8C82]">
            +{rest} meer op Keuze
          </span>
        ) : null}

        {group.originLine ? (
          <span className="block border-t border-white/[0.05] px-3.5 py-2 text-[11px] leading-snug text-[#7E8C82] text-pretty">
            {group.originLine}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function PrimaireKnop({
  children,
  onClick,
  href,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  href?: string;
  ariaLabel?: string;
}) {
  const className =
    "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-none px-4 py-2.5 text-[13px] font-semibold text-[#0f1c10] no-underline shadow-[0_8px_22px_rgba(90,143,106,0.28)] transition hover:brightness-110";
  const style: CSSProperties = {
    background: `linear-gradient(135deg, #9CC5A9, ${ACCENT})`,
    fontFamily: "var(--f-sans)",
  };

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} onClick={onClick} className={className} style={style}>
        {children}
        <Icons.ArrowRight s={14} />
      </Link>
    );
  }

  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} className={className} style={style}>
      {children}
      <Icons.ArrowRight s={14} />
    </button>
  );
}

/**
 * "De analyse wijst nu X aan — meebewegen?"
 *
 * Alleen zichtbaar als je zélf een focus koos én de analyse daarna iets anders
 * aanwees (`shouldShowEngineShiftNudge`). Dezelfde afweging als op Agenda in
 * `PriorityOverTimePanel`, maar hier op de plek waar het verschil ook te zien
 * is: naast de twee kaarten die het dragen.
 *
 * De knop schrijft `accept_engine` naar dezelfde voorkeur als de focus-picker
 * — geen tweede pad, en dus geen tweede stand die uiteen kan lopen. Wie wil
 * blijven waar hij zit doet niets: de nudge dringt niet aan en verdwijnt vanzelf
 * zodra de analyse en je focus weer samenvallen.
 */
function EngineShiftNudge({
  adviceLabel,
  onAccept,
  busy,
}: {
  adviceLabel: string;
  onAccept: () => void;
  busy: boolean;
}) {
  return (
    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-xl border border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.07)] px-3.5 py-3">
      <p className="m-0 min-w-[20ch] flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
        Je meting wijst nu {adviceLabel.toLowerCase()} aan, terwijl je focus
        ergens anders staat. Je hoeft niets te doen — of je beweegt mee.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={onAccept}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[rgba(200,149,108,0.55)] bg-transparent px-3 py-2 text-[12.5px] font-semibold text-[#E2B98F] transition hover:bg-[rgba(200,149,108,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        Volg het nieuwe advies
        <Icons.ArrowRight s={13} />
      </button>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: KompasKeuzeView;
  onChange: (view: KompasKeuzeView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Aanbevolen of Mijn keuze"
      className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      {(
        [
          { id: "aanbevolen" as const, label: "Aanbevolen" },
          { id: "mijn_keuze" as const, label: "Mijn keuze" },
        ] as const
      ).map((option) => {
        const active = option.id === view;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
              active
                ? "bg-[#5A8F6A]/20 text-[#F1EFE8]"
                : "text-[#7E8C82] hover:text-[#CDD7D0]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Aanbevolen ↔ Mijn keuze op de home, in hetzelfde kaartgrid.
 *
 * Opvolger van twee losse secties (`KompasAanbevelingSectie` als vaste kaart
 * op alleen het prioriteitsdomein, en deze sectie als spiegel van je
 * bewaarde keuzes). Vanaf 26 augustus 2026 delen ze één kop en toggle: elke
 * kaart hier is een deur, geen tweede plek om te bewaren of af te vinken.
 * Bewaren blijft het schap (Favorieten-tab) en de ladder; afvinken blijft
 * Mijn Dag (`agenda_blocks`).
 *
 * Elke rij kiest zijn eigen bestemming (`resolveKeuzeDestination` /
 * Aanbevolen altijd naar de ladder) in plaats van dat de hele kaart naar één
 * plek linkt — een supplement en een al geplande activiteit in hetzelfde
 * domein horen niet meer achter dezelfde deur.
 *
 * Wát er in de Aanbevolen-tab staat beslist `buildKompasAanbevelingen`, niet
 * dit bestand: laag uit je laatste meting, actie roterend per week, en een
 * eerlijke terugval op laag 1 voor domeinen zonder check. Hier staat alleen
 * hoe dat op de kaart komt.
 */
export default function KompasKeuzeSectie({
  priorityDomain,
  enginePriorityDomain = null,
  showEngineShiftNudge = false,
  onAcceptEngine,
  acceptEngineBusy = false,
  data,
  onOpenDomain,
  onOpenAgenda,
}: KompasKeuzeSectieProps) {
  const [view, setView] = useState<KompasKeuzeView>("mijn_keuze");
  const { items, hydrated } = useVoortgangFavorites();
  const moments = useLadderMoments();

  const keuzeGroups = useMemo(
    () => buildKeuzeGroups(items, priorityDomain),
    [items, priorityDomain],
  );
  // De week waarin de rotatie zit. Eén keer per render vastgeprikt, zodat een
  // dagwissel om middernacht de kaarten niet halverwege omgooit.
  const weekIndex = useMemo(() => weekIndexFromDate(todayInAgendaTimezone()), []);
  const aanbevolenGroups = useMemo(
    () => buildAanbevolenGroups(priorityDomain, data, weekIndex, enginePriorityDomain),
    [priorityDomain, data, weekIndex, enginePriorityDomain],
  );

  const shownAanbevolenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const group of aanbevolenGroups) {
      const key = `${group.key}:${group.badge ?? ""}`;
      if (shownAanbevolenRef.current.has(key)) {
        continue;
      }
      shownAanbevolenRef.current.add(key);
      trackEvent("dashboard_kompas_aanbeveling_shown", {
        surface: "kompas_home",
        domain: group.key,
        is_priority: group.isPriority === true,
        week_index: weekIndex,
      });
    }
  }, [aanbevolenGroups, weekIndex]);

  // Vóór hydratie weten we niet of er niets is of nog niets geladen; dan liever
  // niets tonen dan een lege staat die meteen weer omklapt.
  if (!hydrated) {
    return null;
  }

  const handleChangeView = (next: KompasKeuzeView) => {
    if (next === view) {
      return;
    }
    trackEvent("dashboard_kompas_keuzes_toggle", { surface: "kompas_home", view: next });
    clarityTag("dashboard_kompas_home", `keuzes_toggle_${next}`);
    setView(next);
  };

  const handleKeuzeRowNavigate = (
    group: KeuzeGroup,
    item: VoortgangFavoriteItem,
    destination: ItemDestination,
  ) => {
    trackEvent("dashboard_kompas_keuzes_click", {
      surface: "kompas_home",
      view: "mijn_keuze",
      domain: group.domain ?? "onbekend",
      kind: item.kind,
      destination: destination.kind,
      element: "rij",
    });
    clarityTag("dashboard_kompas_home", `keuzes_${group.domain ?? "onbekend"}_${destination.kind}`);
  };

  const handleAanbevolenRowNavigate = (group: KeuzeGroup) => {
    trackEvent("dashboard_kompas_aanbeveling_click", {
      surface: "kompas_home",
      domain: group.domain ?? "onbekend",
    });
    clarityTag("dashboard_kompas_home", `aanbeveling_${group.domain ?? "onbekend"}`);
  };

  const groups = view === "mijn_keuze" ? keuzeGroups : aanbevolenGroups;
  const domeinen = groups.filter((group) => group.domain).length;
  const schapDomain = resolveSchapDomain(priorityDomain);
  const adviceLabel = enginePriorityDomain ? PILLAR[enginePriorityDomain].label : null;

  const title = view === "mijn_keuze" ? "Wat je koos" : "Aanbevolen";
  const subtitle =
    view === "mijn_keuze"
      ? items.length === 0
        ? "Nog niets gekozen — je lijst vult zich vanuit je domeinen."
        : `${items.length} ${items.length === 1 ? "handeling" : "handelingen"}${
            domeinen > 1 ? `, over ${domeinen} domeinen` : ""
          } — bewaard op Keuze.`
      : "Eén stap per domein. Je laag komt uit je laatste meting, de stap wisselt per week.";

  return (
    <section
      aria-label="Aanbevolen en Mijn keuze"
      className="mt-5 border-t border-white/10 pt-4"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h3 className="m-0 font-serif text-[17px] leading-snug text-[#F1EFE8]">{title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#7E8C82] text-pretty">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle view={view} onChange={handleChangeView} />

          {view === "mijn_keuze" && items.length > 0 ? (
            schapDomain ? (
              <PrimaireKnop
                href={buildDashboardKeuzeHref(schapDomain, "favorieten")}
                ariaLabel="Bekijk je keuzes op Keuze"
                onClick={() => {
                  trackEvent("dashboard_kompas_keuzes_click", {
                    surface: "kompas_home",
                    view: "mijn_keuze",
                    count: items.length,
                    domains: domeinen,
                    destination: "schap",
                    element: "knop",
                  });
                  clarityTag("dashboard_kompas_home", "keuzes_naar_schap");
                }}
              >
                Bekijk je keuzes
              </PrimaireKnop>
            ) : (
              <PrimaireKnop
                ariaLabel="Bekijk je keuzes in je prioriteitsdomein"
                onClick={() => {
                  trackEvent("dashboard_kompas_keuzes_click", {
                    surface: "kompas_home",
                    view: "mijn_keuze",
                    count: items.length,
                    domains: domeinen,
                    destination: "leefstijlprofiel",
                    element: "knop",
                  });
                  clarityTag("dashboard_kompas_home", "keuzes_naar_leefstijlprofiel");
                  onOpenDomain(priorityDomain);
                }}
              >
                Bekijk je keuzes
              </PrimaireKnop>
            )
          ) : null}
        </div>
      </div>

      {view === "aanbevolen" && showEngineShiftNudge && onAcceptEngine && adviceLabel ? (
        <EngineShiftNudge
          adviceLabel={adviceLabel}
          busy={acceptEngineBusy}
          onAccept={() => {
            trackEvent("dashboard_kompas_engine_shift_accept", {
              surface: "kompas_home",
              from: priorityDomain,
              to: enginePriorityDomain ?? "onbekend",
            });
            clarityTag("dashboard_kompas_home", "engine_shift_accept");
            onAcceptEngine();
          }}
        />
      ) : null}

      {groups.length === 0 ? (
        <div className="mt-3.5 flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/12 bg-black/10 px-4 py-6 text-center">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: `${ACCENT}22`, color: "#9CC5A9" }}
          >
            <Icons.Plus s={16} />
          </span>
          <p className="m-0 max-w-[46ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
            {view === "mijn_keuze"
              ? "Open een domein en zet je eerste handeling op je lijst — hij staat hier daarna in beeld."
              : "Nog geen ladder om uit voor te lezen. Open je prioriteitsdomein."}
          </p>
          <PrimaireKnop
            ariaLabel="Open je prioriteitsdomein"
            onClick={() => {
              clarityTag("dashboard_kompas_home", `${view}_leeg_open_domein`);
              trackEvent("dashboard_kompas_keuzes_click", {
                surface: "kompas_home",
                view,
                count: 0,
                destination: "leefstijlprofiel",
                element: "lege_staat",
              });
              onOpenDomain(priorityDomain);
            }}
          >
            Open je prioriteitsdomein
          </PrimaireKnop>
        </div>
      ) : (
        <div className={`mt-3.5 grid grid-cols-1 gap-3 ${gridColumns(groups.length)}`}>
          {groups.map((group) => (
            <KeuzeGroupCard
              key={group.key}
              group={group}
              maxRows={groups.length === 1 ? MAX_ROWS_SINGLE_GROUP : MAX_ROWS_PER_GROUP}
              resolveDestination={
                view === "mijn_keuze"
                  ? (item, domain) => resolveKeuzeDestination(item, domain, moments?.momentFor ?? null)
                  : () => ({ kind: "domain" })
              }
              onOpenDomain={onOpenDomain}
              onOpenAgenda={onOpenAgenda}
              onRowNavigate={
                view === "mijn_keuze"
                  ? handleKeuzeRowNavigate
                  : (group) => handleAanbevolenRowNavigate(group)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
