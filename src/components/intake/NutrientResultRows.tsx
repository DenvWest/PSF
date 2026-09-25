"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import NutritionEvidenceDisclosure from "@/components/evidence/NutritionEvidenceDisclosure";
import { evidenceForGap } from "@/data/nutrition/nutrient-evidence-map";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { ROUTE_STATUS_COLOR, ROUTE_STATUS_LABEL } from "@/lib/nutrition-route-choice";
import type {
  NutrientResultHistory,
  NutrientResultRow,
} from "@/lib/nutrition-result-rows";

function formatShortDate(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function historyText(history: NutrientResultHistory): string {
  if (history.kind === "first") {
    const date = formatShortDate(history.loggedAt);
    return date ? `Eerste meting · ${date}` : "Eerste meting";
  }
  const since = formatShortDate(history.since);
  const suffix = since ? ` sinds ${since}` : " sinds je vorige check";
  switch (history.direction) {
    case "improved":
      return `↑ Vooruit${suffix}`;
    case "worsened":
      return `↓ Iets terug${suffix}`;
    case "unchanged":
      return `= Gelijk${suffix}`;
  }
}

/** Vandaag-tab draagt het dagboek sinds de 17-sep-herindeling. */
const DAGBOEK_HREF = "/dashboard?tab=vandaag";

function historyColor(history: NutrientResultHistory): string {
  if (history.kind === "change" && history.direction === "improved") {
    return "text-[#9CC5A9]";
  }
  if (history.kind === "change" && history.direction === "worsened") {
    return "text-[#C8956C]";
  }
  return "text-[#7E8C82]";
}

export default function NutrientResultRows({
  rows,
  gateNote = null,
  evidenceFrom,
  extraFor,
}: {
  rows: readonly NutrientResultRow[];
  /** Waarom de supplementdeur voor alle stoffen dicht is — een dichte deur zonder reden leest als storing. */
  gateNote?: string | null;
  evidenceFrom: "dashboard" | "direct";
  extraFor?: (nutrient: NutrientId) => ReactNode;
}) {
  if (rows.length === 0) {
    return null;
  }

  const firstRow = rows[0];
  const allFirst = rows.every((row) => row.history.kind === "first");
  const firstMeasurementNote =
    allFirst && firstRow.history.kind === "first"
      ? `${historyText(firstRow.history)} — bij je volgende check zie je hier per stof of je vooruitgaat.`
      : null;

  function handleSummaryClick(
    event: MouseEvent<HTMLElement>,
    row: NutrientResultRow,
  ) {
    const details = event.currentTarget.parentElement;
    if (details instanceof HTMLDetailsElement && !details.open) {
      trackEvent("nutrition_result_row_open", {
        nutrient: row.nutrient,
        is_focus: row.isFocus,
        status: row.status,
      });
    }
  }

  function handleSupplementClick(row: NutrientResultRow) {
    trackEvent("nutrition_supplement_vergelijk_click", {
      surface: "check_rij",
      nutrient: row.nutrient,
    });
    clarityTag("nutrition_supplement_vergelijk", row.nutrient);
  }

  function handleJijNuClick(row: NutrientResultRow) {
    trackEvent("nutrition_supplement_vergelijk_click", {
      surface: "check_rij_jij_nu",
      nutrient: row.nutrient,
    });
    clarityTag("nutrition_supplement_vergelijk", row.nutrient);
  }

  function handleRichtlijnClick(row: NutrientResultRow) {
    trackEvent("nutrition_result_dagboek_click", {
      surface: "check_rij_richtlijn",
      nutrient: row.nutrient,
    });
    clarityTag("nutrition_result_dagboek", row.nutrient);
  }

  return (
    <section aria-labelledby="per-stof-heading" className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2
          id="per-stof-heading"
          className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[#7E8C82]"
        >
          Per stof — wat je nu kunt doen
        </h2>
        <p className="m-0 text-[11px] text-[#7E8C82]">Eerst je bord, dan pas een potje</p>
      </div>

      {firstMeasurementNote ? (
        <p className="m-0 px-1 text-[12px] leading-relaxed text-[#9FB0A6]">
          {firstMeasurementNote}
        </p>
      ) : null}

      {gateNote ? (
        <p className="m-0 px-1 text-[12px] leading-relaxed text-[#C8956C] text-pretty">
          {gateNote}
        </p>
      ) : null}

      <ul className="m-0 grid list-none gap-2 p-0" role="list">
        {rows.map((row) => {
          const evidence = evidenceForGap(row.nutrient);
          const extra = extraFor?.(row.nutrient) ?? null;
          return (
            <li key={row.nutrient} id={`stof-${row.nutrient}`} className="scroll-mt-24">
              <details
                open={row.isFocus}
                className={`group rounded-2xl border ${
                  row.isFocus
                    ? "border-[#C8956C]/35 bg-[#C8956C]/[0.06]"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <summary
                  onClick={(event) => handleSummaryClick(event, row)}
                  className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 sm:px-5 [&::-webkit-details-marker]:hidden"
                >
                  <span className="text-[15px] font-semibold text-[#F1EFE8]">
                    {row.label}
                  </span>
                  {row.isFocus ? (
                    <span className="rounded-full border border-[#C8956C]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C8956C]">
                      Begin hier
                    </span>
                  ) : null}
                  <span
                    className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: ROUTE_STATUS_COLOR[row.status] }}
                  >
                    {ROUTE_STATUS_LABEL[row.status]}
                  </span>
                  {allFirst ? null : (
                    <span className={`text-[11.5px] ${historyColor(row.history)}`}>
                      {historyText(row.history)}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="ml-auto text-[#7E8C82] transition-transform group-open:rotate-90"
                  >
                    ›
                  </span>
                </summary>

                <div className="grid gap-4 border-t border-white/10 px-4 pb-4 pt-4 sm:px-5">
                  <dl className="m-0 grid gap-2 text-[13px] sm:grid-cols-2">
                    {row.doorOpen ? (
                      <Link
                        href={row.supplementHref}
                        onClick={() => handleJijNuClick(row)}
                        className="group/tegel block rounded-xl bg-black/25 px-3.5 py-2.5 no-underline transition-colors hover:bg-[#C8956C]/10"
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82] transition-colors group-hover/tegel:text-[#C8956C]">
                          <span className="group-hover/tegel:hidden">Jij nu</span>
                          <span className="hidden group-hover/tegel:inline">
                            Bekijk {row.label.toLowerCase()}-supplementen →
                          </span>
                        </dt>
                        <dd className="m-0 mt-0.5 text-[#F1EFE8]">{row.answerLabel ?? "—"}</dd>
                      </Link>
                    ) : (
                      <div className="rounded-xl bg-black/25 px-3.5 py-2.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
                          Jij nu
                        </dt>
                        <dd className="m-0 mt-0.5 text-[#F1EFE8]">{row.answerLabel ?? "—"}</dd>
                      </div>
                    )}
                    <Link
                      href={DAGBOEK_HREF}
                      onClick={() => handleRichtlijnClick(row)}
                      className="group/tegel block rounded-xl bg-black/25 px-3.5 py-2.5 no-underline transition-colors hover:bg-[#9CC5A9]/10"
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82] transition-colors group-hover/tegel:text-[#9CC5A9]">
                        <span className="group-hover/tegel:hidden">Richtlijn</span>
                        <span className="hidden group-hover/tegel:inline">Naar je dagboek →</span>
                      </dt>
                      <dd className="m-0 mt-0.5 text-[#C6D1C9]">{row.thresholdNl}</dd>
                    </Link>
                  </dl>

                  <div>
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CC5A9]">
                      Wat je doet
                    </p>
                    <p className="m-0 mt-1 text-sm leading-relaxed text-[#F1EFE8] text-pretty">
                      {row.action}
                    </p>
                    {row.sourceLabels.length > 0 ? (
                      <p className="m-0 mt-1.5 text-[12px] leading-relaxed text-[#9FB0A6]">
                        Goede bronnen: {row.sourceLabels.join(" · ")}
                      </p>
                    ) : null}
                    <NutritionEvidenceDisclosure
                      evidence={evidence.primary}
                      secondaryQuestionIds={evidence.secondaryIds}
                      surface="result"
                      contextId={row.nutrient}
                      from={evidenceFrom}
                    />
                  </div>

                  {extra}

                  <div className="border-t border-white/[0.07] pt-3">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
                      Supplement
                    </p>
                    <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                      {row.doorReasonNl}
                    </p>
                    {row.doorOpen ? (
                      <Link
                        href={row.supplementHref}
                        onClick={() => handleSupplementClick(row)}
                        className="mt-2 inline-flex min-h-[44px] items-center rounded-xl border border-[#C8956C]/35 bg-[#C8956C]/10 px-4 text-sm font-semibold text-[#C8956C] no-underline transition-colors hover:bg-[#C8956C]/20"
                      >
                        Bekijk {row.label.toLowerCase()}-supplementen →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
