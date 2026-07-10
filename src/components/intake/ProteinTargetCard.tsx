"use client";

import { useState } from "react";
import Link from "next/link";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { BODY_METRICS_CONSENT_TEXT } from "@/lib/consent-texts";
import type { ProteinTarget } from "@/lib/protein-target";

type ProteinTargetCardProps = {
  /** Trainingsbelasting 1–4 uit de intake (max van MOV_STR/MOV_CARD). */
  trainingLoad?: number;
  /** Eiwitrijke eetmomenten op een gewone dag (NutritionSelfReport.proteinMealsPerDay) — voor de gat-brug. */
  proteinMealsYesterday?: number;
  surface?: "intake" | "light";
};

export default function ProteinTargetCard({
  trainingLoad,
  proteinMealsYesterday,
  surface = "intake",
}: ProteinTargetCardProps) {
  const isLight = surface === "light";
  const proteinMealsLine =
    typeof proteinMealsYesterday !== "number"
      ? null
      : proteinMealsYesterday <= 0
        ? "Op een gewone dag eet je geen eiwitrijke eetmomenten."
        : proteinMealsYesterday === 1
          ? "Op een gewone dag eet je 1 eiwitrijk eetmoment."
          : proteinMealsYesterday >= 3
            ? "Op een gewone dag eet je 3 of meer eiwitrijke eetmomenten."
            : `Op een gewone dag eet je ${proteinMealsYesterday} eiwitrijke eetmomenten.`;
  const showProteinNudge =
    typeof proteinMealsYesterday === "number" && proteinMealsYesterday < 3;
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

  const shellClass = isLight
    ? "px-1 py-1"
    : "rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40 px-5 py-5";
  const headingClass = isLight
    ? "text-sm font-semibold text-[#1c1917]"
    : "text-sm font-semibold text-intake-ink";
  const bodyClass = isLight
    ? "mt-1 text-sm leading-relaxed text-[#57534e]"
    : "mt-1 text-sm leading-relaxed text-intake-ink-muted";
  const resultBoxClass = isLight
    ? "mt-4 rounded-xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/10 px-4 py-4"
    : "mt-4 rounded-xl border border-intake-sage/30 bg-intake-sage/10 px-4 py-4";
  const resultTextClass = isLight
    ? "text-sm text-[#1c1917]"
    : "text-sm text-intake-ink";
  const subtleClass = isLight
    ? "text-xs text-[#78716c]"
    : "text-xs text-intake-ink-subtle";
  const labelClass = isLight
    ? "mb-1.5 block text-[13px] font-medium text-[#57534e]"
    : "mb-1.5 block text-[13px] font-medium text-intake-ink-muted";
  const inputClass = isLight
    ? "box-border w-full rounded-[12px] border border-[#ebe7e2] bg-white px-4 py-3 text-[15px] text-[#1c1917] outline-none focus:border-[#C8956C]/50"
    : "box-border w-full rounded-[12px] border border-intake-card-border bg-intake-bg px-4 py-3 text-[15px] text-intake-ink outline-none focus:border-intake-terra/50";
  const consentBoxClass = isLight
    ? "flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#ebe7e2] bg-white px-4 py-3"
    : "flex cursor-pointer items-start gap-3 rounded-[14px] border border-intake-card-border bg-intake-bg px-4 py-3";
  const consentTextClass = isLight
    ? "text-[13px] leading-relaxed text-[#57534e]"
    : "text-[13px] leading-relaxed text-intake-ink-muted";
  const linkClass = isLight
    ? "block text-sm font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] hover:decoration-[#5A8F6A]"
    : "block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage";
  const dividerClass = isLight
    ? "mt-4 border-t border-[#ebe7e2] pt-4"
    : "mt-4 border-t border-intake-divider pt-4";
  const errorClass = isLight
    ? "text-[13px] text-red-600"
    : "text-[13px] text-red-300";

  return (
    <section className={shellClass}>
      {!isLight ? (
        <>
          <h3 className={headingClass}>Bereken je precieze eiwitdoel</h3>
          <p className={bodyClass}>
            Op basis van je gewicht en hoe actief je bent. Een richtlijn — geen medisch advies.
          </p>
        </>
      ) : null}

      {result ? (
        <div className={resultBoxClass}>
          <p className={resultTextClass}>
            Streef naar ongeveer{" "}
            <strong className="font-semibold">
              {result.gramsLow}–{result.gramsHigh} g eiwit per dag
            </strong>
            .
          </p>
          <p className={`mt-1 ${subtleClass}`}>
            ≈ {result.perKgLow}–{result.perKgHigh} g per kg lichaamsgewicht.
          </p>
          <p className={`mt-3 leading-relaxed ${subtleClass}`}>
            Dat haal je doorgaans met 3–4 eiwitrijke eetmomenten over de dag verdeeld.
          </p>
          {proteinMealsLine ? (
            <p className={`mt-1 leading-relaxed ${subtleClass}`}>
              {proteinMealsLine}
              {showProteinNudge
                ? " Eén extra eiwitbron per maaltijd brengt je dichter bij je doel."
                : ""}
            </p>
          ) : null}
          {supplement ? (
            <div className={dividerClass}>
              <Link
                href={supplement.comparisonPath}
                onClick={() =>
                  emitIntakeClientEvent("measurement.protein_cta_clicked", {
                    comparison_path: supplement.comparisonPath,
                  })
                }
                className={linkClass}
              >
                Vergelijk eiwitpoeders →
              </Link>
              <p className={`mt-1 leading-relaxed ${subtleClass}`}>
                {supplement.claimText}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={isLight ? "space-y-4" : "mt-4 space-y-4"}>
          <div>
            <label htmlFor="protein-weight" className={labelClass}>
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
              className={inputClass}
            />
          </div>

          <label className={consentBoxClass}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#C8956C]"
            />
            <span className={consentTextClass}>
              {BODY_METRICS_CONSENT_TEXT.body_metrics}
            </span>
          </label>

          {error ? (
            <p className={errorClass} role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-[44px] w-full cursor-pointer rounded-[12px] bg-[#C8956C] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          >
            {submitting ? "Bezig…" : "Bereken mijn eiwitdoel →"}
          </button>
        </div>
      )}
    </section>
  );
}
