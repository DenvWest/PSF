"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import type { VoedingWeekoverzicht } from "@/lib/nutrition-voeding-weekoverzicht";
import type { WeekRij } from "@/lib/nutrition-weekoverzicht";

/**
 * Bovenaan Samenvatting: wat haal je deze week van je doelen, en hoeveel komt
 * uit supplementen.
 *
 * Drie regels, drie leeswijzen:
 * - **Macro's** tegen je eigen doel, als neutraal restgetal ("nog 300 kcal").
 *   Geen percentage en geen kleur: het macro-besluit (§1 Laag B) verbiedt een
 *   weekscore op macro's, en het doel is van jou, niet van het systeem.
 * - **Kernstoffen** tegen je norm: hoeveel van de meetbare stoffen gemiddeld
 *   gehaald zijn. Zink en vitamine D tellen niet mee in de noemer; een dagboek
 *   kan ze niet aantonen.
 * - **Supplementen**: op hoeveel dagen, en welk deel van elke kernstof eruit
 *   kwam. Een supplement dekt een tekort net zo goed als voeding; dit maakt
 *   alleen zichtbaar waar je dekking vandaan komt.
 */

export type SupplementWeek = {
  dagenMetSupplement: number;
  dagenGeregistreerd: number;
  /** Per kernstof het deel van de weektotale ondergrens dat uit supplementen kwam. */
  aandeelPerStof: { nutrient: string; label: string; aandeel: number }[];
};

export default function PatroonDoelenKaart({
  macro,
  kernstoffen,
  supplementen,
}: {
  macro: VoedingWeekoverzicht;
  kernstoffen: readonly WeekRij[];
  supplementen: SupplementWeek;
}) {
  const meetbaar = kernstoffen.filter((rij) => rij.bewijsbaar && rij.referentie !== null);
  const gehaald = meetbaar.filter((rij) => rij.gedekt === true);
  const heeftMacroDoel = macro.rijen.some((rij) => rij.doel !== null);
  const leeg = macro.dagenGeregistreerd === 0;

  return (
    <section
      aria-label="Je doelen deze week"
      className="mb-4 rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] p-3"
    >
      <div className="vd-kop" style={{ marginBottom: "0.5rem" }}>
        <p className="vd-eyebrow" style={{ margin: 0 }}>
          Je doelen deze week
        </p>
        <span className="vd-tag">gemiddeld per geregistreerde dag</span>
      </div>

      {leeg ? (
        <p className="vd-note" style={{ margin: 0 }}>
          Deze week staat nog niets geregistreerd.
        </p>
      ) : (
        <>
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
            {macro.rijen.map((rij) => (
              <li key={rij.veld} className="rounded-lg bg-[var(--vd-surface-2)] px-2 py-2">
                <span className="block text-[0.625rem] text-[var(--vd-ink-3)]">{rij.label}</span>
                <b className="block font-mono text-[0.875rem] text-[var(--vd-ink)]">
                  {hoeveelheid(rij.gemiddeld)} {rij.unit}
                </b>
                <span className="block text-[0.625rem] text-[var(--vd-ink-3)]">
                  {rij.doel === null
                    ? "geen doel"
                    : rij.over === null
                      ? `doel ${rij.doel} ${rij.unit} gehaald`
                      : `nog ${hoeveelheid(rij.over)} tot ${rij.doel}`}
                </span>
              </li>
            ))}
          </ul>
          {!heeftMacroDoel ? (
            <p className="vd-note" style={{ marginBottom: 0 }}>
              Je hebt nog geen calorie- of macrodoel.{" "}
              <Link
                href="/dashboard/doelen"
                onClick={() => trackEvent("nutrition_patroon_doel_instellen_click", { bron: "samenvatting" })}
              >
                Stel er een in →
              </Link>
            </p>
          ) : null}

          <div className="mt-3 border-t border-[var(--vd-line)] pt-3">
            <p className="m-0 text-[0.8125rem] text-[var(--vd-ink)]">
              <b>
                {gehaald.length} van {meetbaar.length}
              </b>{" "}
              meetbare kernstoffen gemiddeld op je norm
              {gehaald.length > 0 ? ` (${gehaald.map((rij) => rij.label.toLowerCase()).join(", ")})` : ""}.
            </p>
            <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {meetbaar.map((rij) => (
                <li key={rij.nutrient} className="vd-pil" data-toon={rij.gedekt ? "sage" : "terra"}>
                  {rij.label} {rij.dagenMetBron === 0 ? "n.o." : percentageADH(rij.aandeel)}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 border-t border-[var(--vd-line)] pt-3">
            <p className="m-0 text-[0.8125rem] text-[var(--vd-ink)]">
              {supplementen.dagenMetSupplement === 0 ? (
                "Geen supplementen geregistreerd deze week — alles hierboven komt uit voeding."
              ) : (
                <>
                  Supplementen op{" "}
                  <b>
                    {supplementen.dagenMetSupplement} van {supplementen.dagenGeregistreerd}
                  </b>{" "}
                  {supplementen.dagenGeregistreerd === 1 ? "dag" : "dagen"}.
                </>
              )}
            </p>
            {supplementen.aandeelPerStof.length > 0 ? (
              <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
                {supplementen.aandeelPerStof.map((stof) => (
                  <li key={stof.nutrient} className="vd-pil">
                    {stof.label}: {Math.round(stof.aandeel * 100)}% uit supplement
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
