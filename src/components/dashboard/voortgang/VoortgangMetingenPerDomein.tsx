"use client";

import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { getSituationLabel, isDomainGoalDomain, type DomainGoalDomain } from "@/lib/domain-goal";
import type { DomainGoalMap } from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildDomainCheckHref,
  CHECK_NAME,
  DOMAIN_CHECK_PILLAR_IDS,
} from "@/lib/kompas-domain-check";
import {
  buildMeetreeks,
  resolvePlotRow,
  SCORE_ROW_KEY,
  type MeetreeksRow,
} from "@/lib/voortgang-meetreeks";
import type { DashboardData, DomainMeasurement, PillarId } from "@/types/dashboard";

type VoortgangMetingenPerDomeinProps = {
  data?: DashboardData;
  selectedDomain: PillarId;
  onSelectDomain: (domain: PillarId) => void;
  /** undefined = doelen nog niet geladen, null-waarde = geladen zonder doel. */
  goals: DomainGoalMap | null;
  onOpenGoal: (domain: DomainGoalDomain) => void;
  onOpenDomain: (domain: PillarId) => void;
};

type MeetreeksView = "tabel" | "grafiek";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

/** Eén kolombreedte voor tabel én grafiek — zo staat de datumstrip in beide gelijk. */
const COL = 104;
const LABEL_COL = 132;
const CHART_H = 148;
const AXIS_GUTTER = 46;

/**
 * De meelopende labelkolom moet ondoorzichtig zijn, anders schuiven de cellen
 * er zichtbaar onderdoor. `--panel` is doorschijnend wit en dekt dus niets af;
 * dit is de uitgerekende tegelkleur: zwart/20 over `--bg` (#1a2e1a).
 */
const STICKY_BG = "#152515";

function iconOf(name: string): IconComp | null {
  return (Icons[name as keyof typeof Icons] as IconComp | undefined) ?? null;
}

function shortDate(dateLabel: string): string {
  // "9 aug 2026" → "9 aug"; het jaar staat in de uitleesregel eronder.
  return dateLabel.replace(/\s+\d{4}$/, "");
}

function sourceLabel(source: DomainMeasurement["source"]): string {
  switch (source) {
    case "intake":
      return "Leefstijlcheck";
    case "nutrition_log":
      return "Voedingslog";
    default:
      return "Domeincheck";
  }
}

function daysAgoLabel(daysAgo: number): string {
  if (daysAgo === 0) {
    return "vandaag";
  }
  if (daysAgo === 1) {
    return "gisteren";
  }
  return `${daysAgo} dagen geleden`;
}

/**
 * Wat de as betekent. Alleen `richtlijn` mag norm-taal voeren — daar staat een
 * gebronde grens onder de indeling. Voeding is een frequentie-inschatting met
 * indicatieve drempels (zie de kop van `intake-reference.ts`) en stress is puur
 * zelfrapportage; die mogen zich geen richtlijn noemen.
 */
function scaleHint(row: MeetreeksRow): string {
  switch (row.scale) {
    case "score":
      return "Schaal 0-100, hoger is beter.";
    case "richtlijn":
      return "Schaal: onder de richtlijn → bijna → haalt 'm. De richtlijn staat per meting erbij.";
    case "vuistregel":
      return "Twee standen: aan de lage kant, of geen aandachtspunt. Een vuistregel uit je eetfrequentie — geen norm en geen bloedwaarde.";
    default:
      return `Schaal 1-${row.levelMax}: je eigen antwoord, van zwakst naar sterkst. Geen richtlijn.`;
  }
}

function gridLevels(row: MeetreeksRow): number[] {
  if (row.scale === "score") {
    return [0, 25, 50, 75, 100];
  }
  return Array.from({ length: row.levelMax }, (_, index) => index + 1);
}

function tickLabel(row: MeetreeksRow, level: number): string {
  if (row.scale === "score") {
    return String(level);
  }
  if (row.scale === "vuistregel") {
    return level === 1 ? "Laag" : "OK";
  }
  if (row.scale === "richtlijn") {
    return ["onder", "bijna", "haalt"][level - 1] ?? String(level);
  }
  return String(level);
}

function levelToY(row: MeetreeksRow, level: number): number {
  const padY = 16;
  const floor = row.scale === "score" ? 0 : 1;
  const span = Math.max(1, row.levelMax - floor);
  const ratio = (level - floor) / span;
  return CHART_H - padY - ratio * (CHART_H - padY * 2);
}

/** De waarde-as, buiten de scroll gehouden zodat hij blijft staan. */
function AxisGutter({ row }: { row: MeetreeksRow }) {
  return (
    <svg
      width={AXIS_GUTTER}
      height={CHART_H}
      viewBox={`0 0 ${AXIS_GUTTER} ${CHART_H}`}
      aria-hidden
      className="block shrink-0"
    >
      {gridLevels(row).map((level) => (
        <text
          key={level}
          x={AXIS_GUTTER - 6}
          y={levelToY(row, level) + 3}
          textAnchor="end"
          fontSize={9.5}
          fill="var(--text-subtle)"
        >
          {tickLabel(row, level)}
        </text>
      ))}
    </svg>
  );
}

/** De datumstrip. Staat onder de tabel én onder de grafiek, met dezelfde kolommaat. */
function MomentAxis({
  moments,
  activeIndex,
  onSelect,
}: {
  moments: DomainMeasurement[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex" style={{ width: moments.length * COL }}>
      {moments.map((moment, index) => (
        <button
          key={moment.id}
          type="button"
          onClick={() => onSelect(index)}
          aria-pressed={index === activeIndex}
          className="min-h-11 shrink-0 cursor-pointer border-none bg-transparent px-1 py-2 text-center"
          style={{ width: COL }}
        >
          <span
            className="block text-[12px] font-medium"
            style={{ color: index === activeIndex ? "var(--text)" : "var(--text-muted)" }}
          >
            {shortDate(moment.dateLabel)}
          </span>
          <span
            className="mx-auto mt-1 block h-[2px] rounded-full"
            style={{
              width: index === activeIndex ? 28 : 14,
              background: index === activeIndex ? "var(--sage)" : "var(--panel-border)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function LevelBar({ level, levelMax }: { level: number | null; levelMax: number }) {
  if (level == null) {
    return null;
  }
  return (
    <span
      aria-hidden
      className="mt-1 block h-[3px] rounded-full bg-white/10"
      style={{ width: 44 }}
    >
      <span
        className="block h-full rounded-full bg-[var(--sage)]"
        style={{ width: `${(level / levelMax) * 100}%` }}
      />
    </span>
  );
}

function MeetreeksTabel({
  moments,
  rows,
  activeIndex,
  onSelectMoment,
  onSelectRow,
  activeRowKey,
}: {
  moments: DomainMeasurement[];
  rows: MeetreeksRow[];
  activeIndex: number;
  onSelectMoment: (index: number) => void;
  onSelectRow: (key: string) => void;
  activeRowKey: string;
}) {
  return (
    <table
      className="border-collapse text-left"
      style={{ width: LABEL_COL + moments.length * COL }}
    >
      <caption className="sr-only">
        Je meetwaarden verticaal, je meetmomenten horizontaal — links je laatste meting.
      </caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-[var(--panel-border)]">
            <th
              scope="row"
              className="sticky left-0 z-[1] py-2 pr-3 align-top font-normal"
              style={{ width: LABEL_COL, minWidth: LABEL_COL, background: STICKY_BG }}
            >
              <button
                type="button"
                onClick={() => onSelectRow(row.key)}
                aria-pressed={row.key === activeRowKey}
                disabled={!row.plottable}
                className="cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] leading-snug disabled:cursor-default"
                style={{
                  color: row.key === activeRowKey ? "var(--text)" : "var(--text-muted)",
                  fontWeight: row.key === activeRowKey ? 600 : 400,
                }}
              >
                {row.label}
              </button>
            </th>
            {row.cells.map((cell, index) => (
              <td
                key={moments[index].id}
                className="py-2 pr-2 align-top"
                style={{
                  width: COL,
                  background: index === activeIndex ? "rgba(255,255,255,0.04)" : undefined,
                }}
              >
                {cell ? (
                  <>
                    <span className="block text-[12px] leading-snug text-[var(--text)]">
                      {cell.answerLabel}
                    </span>
                    <LevelBar level={cell.level} levelMax={row.levelMax} />
                  </>
                ) : (
                  <span className="block text-[12px] text-[var(--text-subtle)]">—</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td
            className="sticky left-0 z-[1]"
            style={{ width: LABEL_COL, minWidth: LABEL_COL, background: STICKY_BG }}
          />
          {moments.map((moment, index) => (
            <th key={moment.id} scope="col" className="p-0 align-top font-normal">
              <button
                type="button"
                onClick={() => onSelectMoment(index)}
                aria-pressed={index === activeIndex}
                className="min-h-11 w-full cursor-pointer border-none bg-transparent px-1 py-2 text-center"
                style={{ width: COL }}
              >
                <span
                  className="block text-[12px] font-medium"
                  style={{ color: index === activeIndex ? "var(--text)" : "var(--text-muted)" }}
                >
                  {shortDate(moment.dateLabel)}
                </span>
                <span
                  className="mx-auto mt-1 block h-[2px] rounded-full"
                  style={{
                    width: index === activeIndex ? 28 : 14,
                    background: index === activeIndex ? "var(--sage)" : "var(--panel-border)",
                  }}
                />
              </button>
            </th>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}

function MeetreeksGrafiek({
  row,
  moments,
  activeIndex,
  color,
}: {
  row: MeetreeksRow;
  moments: DomainMeasurement[];
  activeIndex: number;
  color: string;
}) {
  const width = moments.length * COL;
  const x = (index: number) => index * COL + COL / 2;
  const y = (level: number) => levelToY(row, level);

  // Gaten breken de lijn: een moment dat deze waarde niet mat, krijgt geen
  // doorgetrokken verbinding — dat zou een meting suggereren die er niet is.
  const segments: { index: number; level: number }[][] = [];
  let current: { index: number; level: number }[] = [];
  row.cells.forEach((cell, index) => {
    if (cell?.level == null) {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
      return;
    }
    current.push({ index, level: cell.level });
  });
  if (current.length > 0) {
    segments.push(current);
  }

  return (
    <svg
      width={width}
      height={CHART_H}
      viewBox={`0 0 ${width} ${CHART_H}`}
      role="img"
      aria-label={`${row.label} over ${moments.length} meetmomenten, links je laatste meting. ${scaleHint(row)}`}
      className="block"
    >
      {gridLevels(row).map((level) => (
        <line
          key={level}
          x1={0}
          y1={y(level)}
          x2={width}
          y2={y(level)}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
        />
      ))}

      {/* Peillijn op het gekozen moment, zodat je het punt tegen de as kunt leggen. */}
      <line
        x1={x(activeIndex)}
        y1={6}
        x2={x(activeIndex)}
        y2={CHART_H - 6}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />

      {segments.map((segment) => (
        <polyline
          key={`seg-${segment[0].index}`}
          points={segment.map((point) => `${x(point.index)},${y(point.level)}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {row.cells.map((cell, index) =>
        cell?.level == null ? null : (
          <circle
            key={moments[index].id}
            cx={x(index)}
            cy={y(cell.level)}
            r={index === activeIndex ? 6 : 4}
            fill={index === activeIndex ? color : "var(--panel)"}
            stroke={color}
            strokeWidth={2}
          />
        ),
      )}
    </svg>
  );
}

function GoalRow({
  domain,
  goals,
  onOpenGoal,
}: {
  domain: PillarId;
  goals: DomainGoalMap | null;
  onOpenGoal: (domain: DomainGoalDomain) => void;
}) {
  if (!isDomainGoalDomain(domain) || goals == null) {
    return null;
  }
  const goal = goals[domain] ?? null;
  const latestScore = goal ? (goal.scores[goal.scores.length - 1]?.score ?? null) : null;

  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("dashboard_voortgang_doel_click", {
          domain,
          entry: goal ? "rescore" : "set",
        });
        onOpenGoal(domain);
      }}
      className="mt-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--panel-border)] bg-transparent px-3 py-2.5 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          Je ijkpunt
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-[var(--text)]">
          {goal
            ? `${goal.ownWords || getSituationLabel(domain, goal.situationId)}${
                latestScore != null ? ` · nu ${latestScore}` : ""
              }`
            : "Nog geen eigen doel gezet"}
        </span>
      </span>
      <span className="shrink-0 text-[11.5px] font-semibold text-[var(--sage)]">
        {goal ? "Bijwerken" : "Zetten"} →
      </span>
    </button>
  );
}

export default function VoortgangMetingenPerDomein({
  data,
  selectedDomain,
  onSelectDomain,
  goals,
  onOpenGoal,
  onOpenDomain,
}: VoortgangMetingenPerDomeinProps) {
  const [view, setView] = useState<MeetreeksView>("tabel");
  const [rowKey, setRowKey] = useState<string>(SCORE_ROW_KEY);
  const [momentIndex, setMomentIndex] = useState<number | null>(null);

  const reeks = useMemo(
    () => buildMeetreeks(data?.domainMeasurements?.[selectedDomain] ?? []),
    [data?.domainMeasurements, selectedDomain],
  );

  const pillar = PILLAR[selectedDomain];
  const checkNaam = CHECK_NAME[selectedDomain] ?? "check";
  const rows = [reeks.scoreRow, ...reeks.valueRows];
  const plotRow = resolvePlotRow(reeks, rowKey);
  const heeftVuistregel = rows.some((row) => row.scale === "vuistregel");

  // De reeks staat nieuwste-eerst, dus index 0 is je laatste meting — en dat is
  // wat er zonder keuze voor staat.
  const activeIndex =
    momentIndex != null && momentIndex < reeks.moments.length ? momentIndex : 0;
  const activeMoment = reeks.moments[activeIndex] ?? null;
  const activeCell = plotRow?.cells[activeIndex] ?? null;

  const handleSelectDomain = (domain: PillarId) => {
    trackEvent("dashboard_voortgang_metingen_domein_click", { domain });
    clarityTag("dashboard_voortgang", `metingen_${domain}`);
    setRowKey(SCORE_ROW_KEY);
    setMomentIndex(null);
    onSelectDomain(domain);
  };

  const handleView = (next: MeetreeksView) => {
    setView(next);
    trackEvent("dashboard_voortgang_meetreeks_view", {
      view: next,
      domain: selectedDomain,
    });
    clarityTag("dashboard_voortgang", `meetreeks_${next}`);
  };

  const handleSelectMoment = (index: number) => {
    setMomentIndex(index);
    trackEvent("dashboard_voortgang_meetreeks_moment_click", {
      domain: selectedDomain,
      view,
    });
  };

  const handleSelectRow = (key: string) => {
    setRowKey(key);
    if (view === "tabel") {
      handleView("grafiek");
    }
  };

  return (
    <CockpitTile eyebrow="Uit je cyclus" className="mb-3.5">
      <h3
        className="m-0 mt-2 font-serif text-[18px] font-normal leading-[1.3] text-[var(--text)]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Wat je mat bij {pillar.label.toLowerCase()}
      </h3>
      <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--text-muted)] text-pretty">
        Klik een meting in je cyclus hierboven, of kies hier een domein. Je meetwaarden
        staan onder elkaar, je meetmomenten naast elkaar.
      </p>

      <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {DOMAIN_CHECK_PILLAR_IDS.map((domain) => {
          const item = PILLAR[domain];
          const Icon = iconOf(item.icon);
          const active = domain === selectedDomain;
          const count = data?.domainMeasurements?.[domain]?.length ?? 0;

          return (
            <li key={domain}>
              <button
                type="button"
                onClick={() => handleSelectDomain(domain)}
                aria-pressed={active}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-left text-[12.5px] font-medium transition"
                style={{
                  borderColor: active ? item.color : "var(--panel-border)",
                  background: active ? `${item.color}1F` : "transparent",
                  color: active ? "var(--text)" : "var(--text-muted)",
                }}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {Icon ? <Icon s={15} style={{ color: item.color }} /> : null}
                </span>
                <span>{item.label}</span>
                {count > 0 ? (
                  <span className="text-[11px] tabular-nums text-[var(--text-subtle)]">
                    {count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {reeks.moments.length === 0 ? (
        <p className="m-0 mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
          Nog geen meetmomenten voor {pillar.label.toLowerCase()}.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Weergave"
            className="mt-3.5 inline-flex rounded-full border border-[var(--panel-border)] p-0.5"
          >
            {(["tabel", "grafiek"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleView(option)}
                aria-pressed={view === option}
                className="min-h-9 cursor-pointer rounded-full border-none px-3.5 text-[12.5px] font-semibold capitalize"
                style={{
                  background: view === option ? "var(--sage)" : "transparent",
                  color: view === option ? "#0E1C10" : "var(--text-muted)",
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/*
            De tijdas loopt hier tegen de gewoonte in van nieuw naar oud. Dat
            moet er letterlijk staan, anders leest een stijgende lijn averechts.
          */}
          <p className="m-0 mt-2 text-[11.5px] text-[var(--text-subtle)]">
            Links je laatste meting, naar rechts terug in de tijd.
            {view === "tabel"
              ? " Klik een meetwaarde links voor de lijn erdoorheen, of een datum voor dat meetmoment."
              : null}
          </p>

          {view === "grafiek" ? (
            <>
              <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
                {rows.map((row) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      onClick={() => setRowKey(row.key)}
                      aria-pressed={plotRow?.key === row.key}
                      disabled={!row.plottable}
                      title={
                        row.plottable
                          ? undefined
                          : "Te weinig meetmomenten met een positie op de schaal."
                      }
                      className="min-h-9 cursor-pointer rounded-full border px-2.5 text-[11.5px] font-medium disabled:cursor-default disabled:opacity-40"
                      style={{
                        borderColor:
                          plotRow?.key === row.key ? pillar.color : "var(--panel-border)",
                        background:
                          plotRow?.key === row.key ? `${pillar.color}1F` : "transparent",
                        color: plotRow?.key === row.key ? "var(--text)" : "var(--text-muted)",
                      }}
                    >
                      {row.label}
                    </button>
                  </li>
                ))}
              </ul>
              {plotRow ? (
                <p className="m-0 mt-2 text-[11.5px] text-[var(--text-subtle)] text-pretty">
                  {scaleHint(plotRow)}
                </p>
              ) : null}
            </>
          ) : null}

          {view === "tabel" ? (
            <div className="-mx-1 mt-2 overflow-x-auto px-1">
              <MeetreeksTabel
                moments={reeks.moments}
                rows={rows}
                activeIndex={activeIndex}
                activeRowKey={plotRow?.key ?? SCORE_ROW_KEY}
                onSelectMoment={handleSelectMoment}
                onSelectRow={handleSelectRow}
              />
            </div>
          ) : plotRow ? (
            <div className="mt-2 flex items-start">
              <AxisGutter row={plotRow} />
              <div className="-mr-1 min-w-0 flex-1 overflow-x-auto pr-1">
                <div style={{ width: reeks.moments.length * COL }}>
                  <MeetreeksGrafiek
                    row={plotRow}
                    moments={reeks.moments}
                    activeIndex={activeIndex}
                    color={pillar.color}
                  />
                  <MomentAxis
                    moments={reeks.moments}
                    activeIndex={activeIndex}
                    onSelect={handleSelectMoment}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
              Nog niets om een lijn door te trekken — daarvoor moeten minstens twee
              meetmomenten dezelfde waarde dragen.
            </p>
          )}

          {activeMoment ? (
            <p
              className="m-0 mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty"
              aria-live="polite"
            >
              <span className="font-semibold text-[var(--text)]">
                {activeMoment.dateLabel}
              </span>{" "}
              · {sourceLabel(activeMoment.source)} · {daysAgoLabel(activeMoment.daysAgo)}
              {view === "grafiek" && plotRow ? (
                <>
                  {" — "}
                  {plotRow.label.toLowerCase()}
                  {": "}
                  <span className="text-[var(--text)]">
                    {activeCell?.answerLabel ?? "niet gemeten"}
                  </span>
                  {activeCell?.benchmarkLabel ? ` (${activeCell.benchmarkLabel})` : ""}
                </>
              ) : null}
            </p>
          ) : null}

          {heeftVuistregel ? (
            <p className="m-0 mt-2 text-[11.5px] leading-relaxed text-[var(--text-subtle)] text-pretty">
              Voeding is een grove inschatting op basis van hoe vaak je iets eet — een
              vuistregel, geen norm en geen bloedwaarde.
            </p>
          ) : null}
        </>
      )}

      <GoalRow domain={selectedDomain} goals={goals} onOpenGoal={onOpenGoal} />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={buildDomainCheckHref(selectedDomain)}
          onClick={() =>
            trackEvent("dashboard_voortgang_hub_click", {
              destination: "check",
              domain: selectedDomain,
            })
          }
          className="text-[12.5px] font-semibold text-[var(--sage)] no-underline"
        >
          Meet je {checkNaam} opnieuw →
        </Link>
        <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_voortgang_domein_click", { domain: selectedDomain });
            onOpenDomain(selectedDomain);
          }}
          className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] text-[var(--text-subtle)]"
        >
          Open je {pillar.label.toLowerCase()} →
        </button>
      </div>
    </CockpitTile>
  );
}
