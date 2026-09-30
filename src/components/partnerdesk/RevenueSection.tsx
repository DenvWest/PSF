"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  addManualConversionAction,
  deleteManualConversionAction,
  reviewConversionAction,
} from "@/lib/partnerdesk/conversion-actions";
import { formatMoney, formatNlDay } from "@/lib/partnerdesk/format";
import type { RevenueCoverage, RevenueSummary } from "@/lib/partnerdesk/revenue";
import type { PdConversion, ReportingMethod } from "@/types/partnerdesk";

const METHOD_SHORT: Record<ReportingMethod, string> = {
  postback: "postback",
  import: "import",
  manual: "handmatig",
};

const STATUS_LABEL: Record<PdConversion["status"], string> = {
  pending: "Te beoordelen",
  approved: "Goedgekeurd",
  rejected: "Afgekeurd",
};

const STATUS_CLASS: Record<PdConversion["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]",
  rejected: "bg-red-50 text-red-700",
};

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] px-3 py-2.5">
      <div className="text-xs text-[var(--ps-muted)]">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs text-[var(--ps-body)]">{sub}</div>}
    </div>
  );
}

function euroToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

function ManualForm({
  partnerId,
  slug,
  onDone,
}: {
  partnerId: string;
  slug: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"sale" | "lead">("sale");
  const [occurredOn, setOccurredOn] = useState("");
  const [revenue, setRevenue] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [externalId, setExternalId] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const revenueCents = revenue.trim() === "" ? 0 : euroToCents(revenue);
    if (revenueCents === null) {
      setError("Orderbedrag is geen geldig bedrag.");
      return;
    }
    startTransition(async () => {
      const result = await addManualConversionAction({
        partnerId,
        slug,
        type,
        occurredOn,
        revenueCents,
        orderRef: orderRef || null,
        externalId: externalId || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as "sale" | "lead")} className={inputCls}>
            <option value="sale">Verkoop</option>
            <option value="lead">Lead</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Datum</span>
          <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Orderbedrag (€)</span>
          <input
            inputMode="decimal"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className={inputCls}
            placeholder="49,95"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Orderreferentie</span>
          <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-[var(--ps-body)]">Externe ID van de partner (optioneel)</span>
          <input
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            className={inputCls}
            placeholder="voorkomt dubbel invoeren van dezelfde regel"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3.5 py-2 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-surface)]">
          Annuleren
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          {pending ? "Opslaan…" : "Conversie toevoegen"}
        </button>
      </div>
    </form>
  );
}

function ConversionRow({ conversion, slug }: { conversion: PdConversion; slug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [received, setReceived] = useState(
    conversion.commission_cents != null ? (conversion.commission_cents / 100).toFixed(2).replace(".", ",") : "",
  );

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      setReviewing(false);
      router.refresh();
    });
  }

  function approve() {
    const cents = received.trim() === "" ? null : euroToCents(received);
    if (received.trim() !== "" && cents === null) {
      setError("Ontvangen bedrag is geen geldig bedrag.");
      return;
    }
    run(() =>
      reviewConversionAction({ conversionId: conversion.id, slug, decision: "approve", receivedCents: cents }),
    );
  }

  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="w-24 text-[var(--ps-body)]">{formatNlDay(conversion.occurred_at)}</span>
        <span className="w-16">{conversion.type === "sale" ? "Verkoop" : "Lead"}</span>
        <span className="w-24 text-right tabular-nums">{formatMoney(conversion.revenue_cents)}</span>
        <span className="w-28 text-right tabular-nums">
          {conversion.commission_cents === null ? "geen regel" : formatMoney(conversion.commission_cents)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[conversion.status]}`}>
          {STATUS_LABEL[conversion.status]}
        </span>
        <span className="text-xs text-[var(--ps-muted)]">{METHOD_SHORT[conversion.ingest_method]}</span>
        <span className="ml-auto flex items-center gap-3 text-xs">
          {conversion.status === "pending" && (
            <>
              <button type="button" onClick={() => setReviewing((v) => !v)} className="text-[var(--ps-green-hover)] hover:underline">
                Beoordeel
              </button>
              {conversion.ingest_method === "manual" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm("Deze handmatige conversie verwijderen?")) {
                      run(() =>
                        deleteManualConversionAction({
                          conversionId: conversion.id,
                          partnerId: conversion.partner_id,
                          slug,
                        }),
                      );
                    }
                  }}
                  className="text-[var(--ps-muted)] hover:text-red-600"
                >
                  Verwijder
                </button>
              )}
            </>
          )}
        </span>
      </div>
      {reviewing && conversion.status === "pending" && (
        <div className="mt-2 flex flex-wrap items-end gap-3 rounded-lg bg-[var(--ps-bg)] p-3">
          <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
            Ontvangen commissie (€)
            <input
              inputMode="decimal"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className={`${inputCls} w-32`}
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={approve}
            className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
          >
            Goedkeuren
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => reviewConversionAction({ conversionId: conversion.id, slug, decision: "reject" }))}
            className="rounded-lg px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Afkeuren
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}

export function RevenueSection({
  partnerId,
  slug,
  available,
  coverage,
  summary,
  conversions,
  clicks30d,
}: {
  partnerId: string;
  slug: string;
  available: boolean;
  coverage: RevenueCoverage;
  summary: RevenueSummary;
  conversions: PdConversion[];
  clicks30d: number | null;
}) {
  const [adding, setAdding] = useState(false);
  const hasData = conversions.length > 0;
  const coverageTone =
    coverage.kind === "postback"
      ? "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]"
      : coverage.kind === "unset"
        ? "bg-amber-50 text-amber-700"
        : "bg-[var(--ps-bg)] text-[var(--ps-body)]";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--ps-muted)]">Rapportage</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${coverageTone}`}>{coverage.label}</span>
          {coverage.cadence && <span className="text-xs text-[var(--ps-body)]">{coverage.cadence}</span>}
          <span className="ml-auto text-xs text-[var(--ps-body)]">
            Laatste inname: {summary.lastIngestAt ? formatNlDay(summary.lastIngestAt) : "nog geen"}
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--ps-body)]">{coverage.note}</p>
      </div>

      {!available ? (
        <p className="rounded-lg border border-dashed border-[var(--ps-border)] px-4 py-6 text-center text-sm text-[var(--ps-body)]">
          De omzettabellen bestaan nog niet in deze database. Draai eerst de migratie
          pd_conversions (zie supabase/migrations/OPENSTAAND.md).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile
              label="Kliks (30 dgn)"
              value={clicks30d === null ? "—" : String(clicks30d)}
              sub={clicks30d === null ? "geen retailer gekoppeld" : undefined}
            />
            <Tile
              label="Te beoordelen"
              value={String(summary.pending.count)}
              sub={`${formatMoney(summary.pending.commissionCents)} verwacht`}
            />
            <Tile
              label="Goedgekeurd"
              value={formatMoney(summary.approvedCents)}
              sub={`${summary.approved.count} conversie(s)`}
            />
            <Tile
              label="Afgekeurd"
              value={String(summary.rejected.count)}
              sub={summary.rejected.count > 0 ? `${formatMoney(summary.rejected.commissionCents)} gemist` : undefined}
            />
          </div>

          {summary.mismatchCount > 0 && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              Ontvangen commissie wijkt af van verwacht op {summary.mismatchCount} regel(s):{" "}
              {formatMoney(summary.expectedCents)} verwacht, {formatMoney(summary.receivedCents)} ontvangen
              (verschil {formatMoney(summary.mismatchCents)}).
            </p>
          )}

          {!hasData && (
            <p className="text-sm text-[var(--ps-body)]">
              {coverage.automatic
                ? "Nog geen conversie binnengekomen."
                : "Nog geen conversies ingevoerd. Dit is geen €0: er is simpelweg nog niets ingenomen."}
            </p>
          )}

          {hasData && (
            <ul className="divide-y divide-[var(--ps-border)]">
              {conversions.slice(0, 25).map((c) => (
                <ConversionRow key={c.id} conversion={c} slug={slug} />
              ))}
            </ul>
          )}
          {conversions.length > 25 && (
            <p className="text-xs text-[var(--ps-muted)]">Nieuwste 25 van {conversions.length} getoond.</p>
          )}

          {adding ? (
            <ManualForm partnerId={partnerId} slug={slug} onDone={() => setAdding(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-lg border border-[var(--ps-border)] px-3.5 py-2 text-sm hover:bg-[var(--ps-bg)]"
            >
              + Conversie handmatig invoeren
            </button>
          )}
        </>
      )}
    </div>
  );
}
