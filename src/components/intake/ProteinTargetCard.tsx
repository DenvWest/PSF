"use client";

import { useState } from "react";
import Link from "next/link";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { BODY_METRICS_CONSENT_TEXT } from "@/lib/consent-texts";
import type { ProteinTarget } from "@/lib/protein-target";

type ProteinTargetCardProps = {
  /** Trainingsbelasting 1–4 uit de intake (max van MOV_STR/MOV_CARD). */
  trainingLoad?: number;
};

export default function ProteinTargetCard({ trainingLoad }: ProteinTargetCardProps) {
  const [weightInput, setWeightInput] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ProteinTarget | null>(null);
  const [supplement, setSupplement] = useState<{
    comparisonPath: string;
    claimText: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weightKg = Number.parseInt(weightInput, 10);
  const weightValid = Number.isFinite(weightKg) && weightKg >= 40 && weightKg <= 250;
  const canSubmit = weightValid && consentChecked && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/protein-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ weightKg, trainingLoad, consent: true }),
      });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Doe eerst de Leefstijlcheck om je eiwitdoel te berekenen."
            : "Er ging iets mis. Probeer het opnieuw.",
        );
        return;
      }
      const data = (await res.json()) as {
        target: ProteinTarget | null;
        supplement: { comparisonPath: string; claimText: string } | null;
      };
      if (!data.target) {
        setError("Vul een geldig gewicht in (40–250 kg).");
        return;
      }
      setResult(data.target);
      setSupplement(data.supplement);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40 px-5 py-5">
      <h3 className="text-sm font-semibold text-intake-ink">
        Bereken je precieze eiwitdoel
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-intake-ink-muted">
        Op basis van je gewicht en hoe actief je bent. Een richtlijn — geen medisch advies.
      </p>

      {result ? (
        <div className="mt-4 rounded-xl border border-intake-sage/30 bg-intake-sage/10 px-4 py-4">
          <p className="text-sm text-intake-ink">
            Streef naar ongeveer{" "}
            <strong className="font-semibold">
              {result.gramsLow}–{result.gramsHigh} g eiwit per dag
            </strong>
            .
          </p>
          <p className="mt-1 text-xs text-intake-ink-subtle">
            ≈ {result.perKgLow}–{result.perKgHigh} g per kg lichaamsgewicht.
          </p>
          {supplement ? (
            <div className="mt-4 border-t border-intake-divider pt-4">
              <Link
                href={supplement.comparisonPath}
                onClick={() =>
                  emitIntakeClientEvent("measurement.protein_cta_clicked", {
                    comparison_path: supplement.comparisonPath,
                  })
                }
                className="block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                Vergelijk eiwitpoeders →
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-intake-ink-subtle">
                {supplement.claimText}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="protein-weight"
              className="mb-1.5 block text-[13px] font-medium text-intake-ink-muted"
            >
              Je gewicht (kg)
            </label>
            <input
              id="protein-weight"
              type="number"
              inputMode="numeric"
              min={40}
              max={250}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="bv. 85"
              className="box-border w-full rounded-[12px] border border-intake-card-border bg-intake-bg px-4 py-3 text-[15px] text-intake-ink outline-none focus:border-intake-terra/50"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-intake-card-border bg-intake-bg px-4 py-3">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-intake-terra"
            />
            <span className="text-[13px] leading-relaxed text-intake-ink-muted">
              {BODY_METRICS_CONSENT_TEXT.body_metrics}
            </span>
          </label>

          {error ? (
            <p className="text-[13px] text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-[44px] w-full cursor-pointer rounded-[12px] bg-intake-terra px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          >
            {submitting ? "Bezig…" : "Bereken mijn eiwitdoel →"}
          </button>
        </div>
      )}
    </section>
  );
}
