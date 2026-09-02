"use client";

import { useState } from "react";
import KwaliteitEetwijzer from "@/components/nutrition/KwaliteitEetwijzer";
import VerhoudingTabel from "@/components/nutrition/VerhoudingTabel";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { NutritionFactRow } from "@/lib/nutrition-ladder";

type KwaliteitMode = "ranglijst" | "check";

const MODE_KNOP = {
  uit: "border-white/15 bg-transparent text-[#9FB0A6]",
  aan: "border-[#9CC5A9] bg-[#9CC5A9]/20 text-[#E7EDE8]",
} as const;

/**
 * P2 Voedingskwaliteit — twee ingangen op dezelfde laag.
 *
 * Ranglijst is productkennis (PAN, gelijk voor iedereen). Jouw check is de
 * laatste voedingslog: alleen de feitenrijen van laag 2. Die twee tellen
 * nooit op; de check vraagt niet welke groente je eet, dus de ranglijst
 * krijgt geen persoonlijke kleur.
 */
export default function VoedingskwaliteitLaag({
  rijen,
  checkDatum,
}: {
  /** Feitenrijen van de laatste check; leeg zonder log. */
  rijen: readonly NutritionFactRow[];
  checkDatum: string | null;
}) {
  const laag2 = rijen.filter((rij) => rij.layer === 2);
  const heeftCheck = laag2.length > 0;
  const [mode, setMode] = useState<KwaliteitMode>(heeftCheck ? "check" : "ranglijst");

  function handleMode(next: KwaliteitMode) {
    if (next === mode) return;
    setMode(next);
    trackEvent("nutrition_kwaliteit_mode", { surface: "dashboard", mode: next });
    clarityTag("nutrition_kwaliteit_mode", next);
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Weergave van voedingskwaliteit">
        <button
          type="button"
          aria-pressed={mode === "ranglijst"}
          onClick={() => handleMode("ranglijst")}
          className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition ${
            mode === "ranglijst" ? MODE_KNOP.aan : MODE_KNOP.uit
          }`}
        >
          Ranglijst
        </button>
        <button
          type="button"
          aria-pressed={mode === "check"}
          onClick={() => handleMode("check")}
          className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition ${
            mode === "check" ? MODE_KNOP.aan : MODE_KNOP.uit
          }`}
        >
          Jouw check
        </button>
      </div>

      {mode === "ranglijst" ? (
        <KwaliteitEetwijzer surface="dashboard" />
      ) : heeftCheck ? (
        <VerhoudingTabel
          rijen={laag2}
          surface="dashboard"
          checkDatum={checkDatum}
          titel="Wat je check over kwaliteit zegt"
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5">
          <p className="m-0 text-[13.5px] font-medium leading-snug text-[#E7EDE8] text-pretty">
            Dit komt uit je voedingscheck.
          </p>
          <p className="mt-1.5 m-0 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Zonder check kunnen we hier niets van jóuw kwaliteit laten zien — alleen
            de ranglijst, en die is voor iedereen gelijk.
          </p>
          <a
            href="/intake/voeding?from=dashboard"
            onClick={() => {
              trackEvent("nutrition_kwaliteit_check_cta", { surface: "dashboard" });
              clarityTag("nutrition_kwaliteit_check_cta", "dashboard");
            }}
            className="mt-2.5 inline-flex text-[13px] font-semibold text-[#9CC5A9] no-underline"
          >
            Doe de voedingscheck ›
          </a>
        </div>
      )}
    </div>
  );
}
