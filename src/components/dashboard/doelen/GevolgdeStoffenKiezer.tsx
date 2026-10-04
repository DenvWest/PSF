"use client";

import { useState } from "react";
import { VOLGBARE_VELDEN } from "@/lib/account-gevolgde-stoffen";
import { trackEvent } from "@/lib/ga4";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";

/**
 * De ene kiezer voor "welke stoffen volg ik", op elke plek waar je dat kunt
 * kiezen (Je doelen, de "+" in Je patroon). Zelfde component en zelfde
 * opslag, zodat de plekken niet uit elkaar lopen
 * (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`, "Herziening").
 *
 * Kleuren komen uit `currentColor`, zodat hij zowel in het donkere
 * account-thema als in het patroon-thema leesbaar is.
 */
export default function GevolgdeStoffenKiezer({ surface }: { surface: "doelen" | "patroon" }) {
  const { stoffen, geladen, zetGevolgd } = useGevolgdeStoffen();
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState<SupermarktVeld | null>(null);

  async function wissel(veld: SupermarktVeld, aan: boolean) {
    setFout(null);
    setBezig(veld);
    try {
      await zetGevolgd(veld, aan);
      trackEvent("voedingsdoel_aangepast", {
        setting: aan ? "gevolgde_stof_aan" : "gevolgde_stof_uit",
        stof: veld,
        surface,
      });
    } catch (error: unknown) {
      setFout(error instanceof Error ? error.message : "Kon je gevolgde stoffen niet opslaan.");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="grid gap-2">
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Stoffen om te volgen">
        {VOLGBARE_VELDEN.map((veld) => {
          const aan = stoffen.includes(veld.veld);
          return (
            <li key={veld.veld}>
              <button
                type="button"
                aria-pressed={aan}
                disabled={!geladen || bezig !== null}
                onClick={() => void wissel(veld.veld, !aan)}
                className="cursor-pointer rounded-full border border-current/25 bg-transparent px-3 py-1 text-[12.5px] text-inherit opacity-80 transition hover:opacity-100 disabled:cursor-wait aria-pressed:border-current/60 aria-pressed:bg-current/10 aria-pressed:font-semibold aria-pressed:opacity-100"
              >
                {aan ? "✓ " : "+ "}
                {veld.label.charAt(0).toUpperCase() + veld.label.slice(1)}
              </button>
            </li>
          );
        })}
      </ul>
      {fout ? (
        <p role="alert" className="m-0 text-[12.5px] text-[var(--terra,#b4543a)]">
          {fout}
        </p>
      ) : null}
    </div>
  );
}
