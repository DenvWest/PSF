"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { buildDashboardSchapHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { resolveSchapDomain } from "@/lib/schap-availability";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";
import type { PillarId } from "@/types/dashboard";

const ACCENT = "#5A8F6A";
const MAX_ROWS_PER_GROUP = 5;
const MAX_ROWS_SINGLE_GROUP = 8;

type KompasKeuzeSectieProps = {
  priorityDomain: PillarId;
  onOpenDomain: (domain: PillarId) => void;
};

type KeuzeGroup = {
  key: string;
  domain: PillarId | null;
  label: string;
  color: string;
  items: VoortgangFavoriteItem[];
};

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
    parts.push(`Laag ${laag} · ${laagNaam}`);
  }
  if (item.kind === "supplement") {
    parts.push("Supplement");
  } else if (item.kind === "dienst") {
    parts.push("Dienst");
  }
  return parts.length > 0 ? parts.join(" · ") : null;
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
  const order = [
    priorityDomain,
    ...KOMPAS_RAIL_PILLAR_IDS.filter((id) => id !== priorityDomain),
  ];

  const groups: KeuzeGroup[] = [];
  for (const domain of order) {
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

function GroupBody({
  group,
  interactive,
  maxRows,
}: {
  group: KeuzeGroup;
  interactive: boolean;
  maxRows: number;
}) {
  const shown = group.items.slice(0, maxRows);
  const rest = group.items.length - shown.length;

  return (
    <>
      <span className="flex items-center gap-2 border-b border-white/8 px-3.5 py-2.5">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: group.color }}
        />
        <span className="min-w-0 flex-1 truncate font-serif text-[14.5px] text-[#F1EFE8]">
          {group.label}
        </span>
        <span className="shrink-0 rounded-md border border-white/10 bg-black/25 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-[#9FB0A6]">
          {group.items.length}
        </span>
        {interactive ? (
          <span
            aria-hidden
            className="shrink-0 text-[#7E8C82] transition-colors group-hover:text-[#9CC5A9]"
          >
            <Icons.ChevronRight s={14} />
          </span>
        ) : null}
      </span>

      <span className="block">
        {shown.map((item) => {
          const meta = metaLine(item);
          return (
            <span
              key={item.id}
              className="flex items-start gap-2.5 border-t border-white/[0.05] px-3.5 py-2.5 first:border-t-0"
            >
              <span
                aria-hidden
                className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ background: `${group.color}24`, color: group.color }}
              >
                {kindIcon(item.kind)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-snug text-[#F1EFE8] text-pretty">
                  {item.title}
                </span>
                {meta ? (
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#7E8C82]">
                    {meta}
                  </span>
                ) : null}
              </span>
            </span>
          );
        })}

        {rest > 0 ? (
          <span className="block border-t border-white/[0.05] px-3.5 py-2 text-[11.5px] text-[#7E8C82]">
            +{rest} meer op je schap
          </span>
        ) : null}
      </span>
    </>
  );
}

function KeuzeGroupCard({
  group,
  maxRows,
  onOpenDomain,
}: {
  group: KeuzeGroup;
  maxRows: number;
  onOpenDomain: (domain: PillarId) => void;
}) {
  const cardClass =
    "group block overflow-hidden rounded-xl border border-white/8 bg-black/15 text-left no-underline transition hover:border-[color:var(--ac)]/45 hover:bg-black/25";
  const style = { "--ac": group.color, fontFamily: "var(--f-sans)" } as CSSProperties;

  if (!group.domain) {
    return (
      <div
        className="overflow-hidden rounded-xl border border-white/8 bg-black/15"
        style={style}
      >
        <GroupBody group={group} interactive={false} maxRows={maxRows} />
      </div>
    );
  }

  const domain = group.domain;
  const schapDomain = resolveSchapDomain(domain);

  const track = (destination: "schap" | "leefstijlprofiel") => {
    trackEvent("dashboard_kompas_keuzes_click", {
      surface: "kompas_home",
      count: group.items.length,
      domain,
      destination,
      element: "domeinkaart",
    });
    clarityTag("dashboard_kompas_home", `keuzes_kaart_${domain}`);
  };

  if (schapDomain) {
    return (
      <Link
        href={buildDashboardSchapHref(schapDomain, "favorieten")}
        aria-label={`Bekijk je keuzes voor ${group.label}`}
        onClick={() => track("schap")}
        className={cardClass}
        style={style}
      >
        <GroupBody group={group} interactive maxRows={maxRows} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Bekijk je keuzes voor ${group.label}`}
      onClick={() => {
        track("leefstijlprofiel");
        onOpenDomain(domain);
      }}
      className={`${cardClass} w-full cursor-pointer p-0`}
      style={style}
    >
      <GroupBody group={group} interactive maxRows={maxRows} />
    </button>
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
      <Link
        href={href}
        aria-label={ariaLabel}
        onClick={onClick}
        className={className}
        style={style}
      >
        {children}
        <Icons.ArrowRight s={14} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
      <Icons.ArrowRight s={14} />
    </button>
  );
}

/**
 * Wat je koos, onder de data — de handelingen zelf in beeld, gegroepeerd per
 * domein, met één knop naar het schap waar je ze beheert.
 *
 * Opvolger van de losse regel die hier op 22 augustus 2026 kort stond: die
 * droeg alleen een telling ("Je koos 5 handelingen"), waardoor de home nooit
 * liet zien wát je koos. De beheerplek blijft het schap
 * (Favorieten-tab) — deze sectie is een leesbare spiegel, geen tweede plek om
 * te bewaren of af te vinken. Afvinken hoort op Mijn Dag (agenda_blocks /
 * daily_action_log), zoals `MijnKeuzeTile` dat ook vasthield.
 *
 * Elke domeinkaart is zelf de deur naar het schap van dát domein via
 * `resolveSchapDomain` — dezelfde functie als elke andere deur naar dit
 * archief. Heeft een domein geen schap (stress, verbinding), dan opent de
 * kaart het domeinscherm.
 */
export default function KompasKeuzeSectie({
  priorityDomain,
  onOpenDomain,
}: KompasKeuzeSectieProps) {
  const { items, hydrated } = useVoortgangFavorites();
  const groups = useMemo(
    () => buildKeuzeGroups(items, priorityDomain),
    [items, priorityDomain],
  );

  // Vóór hydratie weten we niet of er niets is of nog niets geladen; dan liever
  // niets tonen dan een lege staat die meteen weer omklapt.
  if (!hydrated) {
    return null;
  }

  const domeinen = groups.filter((group) => group.domain).length;
  const schapDomain = resolveSchapDomain(priorityDomain);

  return (
    <section
      aria-label="Wat je koos"
      className="mt-5 border-t border-white/10 pt-4"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h3 className="m-0 font-serif text-[17px] leading-snug text-[#F1EFE8]">
            Wat je koos
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#7E8C82] text-pretty">
            {items.length === 0
              ? "Nog niets gekozen — je lijst vult zich vanuit je domeinen."
              : `${items.length} ${items.length === 1 ? "handeling" : "handelingen"}${
                  domeinen > 1 ? `, over ${domeinen} domeinen` : ""
                } — bewaard op je schap.`}
          </p>
        </div>

        {items.length > 0 ? (
          schapDomain ? (
            <PrimaireKnop
              href={buildDashboardSchapHref(schapDomain, "favorieten")}
              ariaLabel="Bekijk je keuzes op je schap"
              onClick={() => {
                trackEvent("dashboard_kompas_keuzes_click", {
                  surface: "kompas_home",
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

      {items.length === 0 ? (
        <div className="mt-3.5 flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/12 bg-black/10 px-4 py-6 text-center">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: `${ACCENT}22`, color: "#9CC5A9" }}
          >
            <Icons.Plus s={16} />
          </span>
          <p className="m-0 max-w-[46ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
            Open een domein en zet je eerste handeling op je lijst — hij staat
            hier daarna in beeld.
          </p>
          <PrimaireKnop
            ariaLabel="Open je prioriteitsdomein"
            onClick={() => {
              clarityTag("dashboard_kompas_home", "keuzes_leeg_open_domein");
              trackEvent("dashboard_kompas_keuzes_click", {
                surface: "kompas_home",
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
              onOpenDomain={onOpenDomain}
            />
          ))}
        </div>
      )}
    </section>
  );
}
