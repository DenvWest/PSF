"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bouwWeekoverzicht,
  verschuifWeek,
  weekLabel,
  weekStart,
} from "@/lib/nutrition-weekoverzicht";

/**
 * Het weekoverzicht: één week voedingsstoffen, met de tabel per stof.
 *
 * ## Wat hier bewust niet staat
 *
 * De bronapp waar deze vorm vandaan komt vult dit scherm met een
 * calorieëndoel, een macroverdeling en een inlogreeks ("log deze week elke dag
 * voor een onafgebroken reeks van 3 dagen!"). Geen van die drie staat hier, en
 * dat is geen omissie:
 *
 * - **Calorieën en macro's** — de catalogus draagt ze niet, en het besluit
 *   wijst de kcal-teller af (§2b): een kcal-teller verkoopt geen omega-3, een
 *   gat wel.
 * - **De inlogreeks** — dat beloont openen in plaats van eten, en het maakt
 *   van een gemiste dag een verlies. Het dagboek vraagt vier dagen, geen
 *   dertig.
 * - **Het rapportcijfer** — geen weekscore, om dezelfde reden als op Je
 *   patroon: het leest als een oordeel over de persoon en het gooit weg waar
 *   het om gaat.
 *
 * Wat er wél staat en daar niet: een route. Elke rij klikt door naar de
 * vergelijkingspagina van die stof — dat is waar dit hele dashboard voor
 * bestaat, en tot nu toe had het nul uitgangen.
 */

export default function WeekoverzichtScherm({
  dagen,
  vandaag,
  onTerug,
}: {
  dagen: readonly DagboekDag[];
  vandaag: string;
  onTerug: () => void;
}) {
  const [start, setStart] = useState(() => weekStart(vandaag));

  const overzicht = useMemo(() => bouwWeekoverzicht(dagen, start), [dagen, start]);
  const dezeWeek = weekStart(vandaag);
  const isHuidig = start === dezeWeek;

  const blader = (weken: number) => {
    const volgende = verschuifWeek(start, weken);
    // Nooit vooruit voorbij de lopende week: daar staat per definitie niets,
    // en een lege toekomst laten bladeren leest als kapotte data.
    if (volgende > dezeWeek) return;
    setStart(volgende);
    trackEvent("nutrition_weekoverzicht_blader", {
      richting: weken < 0 ? "terug" : "vooruit",
    });
  };

  const gemeten = overzicht.dagenGeregistreerd;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onTerug}
        className="flex cursor-pointer items-center gap-1.5 self-start text-[12px] text-[#9FB0A6] transition-colors hover:text-[#F1EFE8]"
      >
        <span aria-hidden>←</span> Terug naar je patroon
      </button>

      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => blader(-1)}
          aria-label="Vorige week"
          className="cursor-pointer rounded-lg border border-white/10 px-2.5 py-1 text-[14px] text-[#9FB0A6] transition-colors hover:border-white/30"
        >
          ‹
        </button>
        <h2 className="m-0 text-center font-serif text-[16px] font-normal text-[#F1EFE8]">
          {weekLabel(overzicht.start, overzicht.eind)}
        </h2>
        <button
          type="button"
          onClick={() => blader(1)}
          disabled={isHuidig}
          aria-label="Volgende week"
          className="cursor-pointer rounded-lg border border-white/10 px-2.5 py-1 text-[14px] text-[#9FB0A6] transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </header>

      <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-[#9FB0A6]">
        {gemeten === 0 ? (
          "In deze week staat nog niets geregistreerd. Vul een dag in je dagboek in — dan rekent dit overzicht mee."
        ) : (
          <>
            Je registreerde{" "}
            <strong className="font-bold text-[#F1EFE8]">
              {gemeten} {gemeten === 1 ? "dag" : "dagen"}
            </strong>{" "}
            in deze week. Alles hieronder is het gemiddelde over die{" "}
            {gemeten === 1 ? "dag" : "dagen"} — en een ondergrens, want wat je
            niet noemde kan er alleen bij komen.
          </>
        )}
      </p>

      <section aria-label="Voedingsstoffen deze week">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-x-2.5 border-b border-white/10 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7E8C82]">
          <span>Stof</span>
          <span className="text-right">Gem.</span>
          <span className="text-right">Referentie</span>
          <span className="text-right">Te gaan</span>
        </div>

        <ul className="m-0 list-none p-0">
          {overzicht.rijen.map((rij) => (
            <li key={rij.nutrient} className="border-b border-white/[0.06]">
              <Link
                href={rij.comparisonPath}
                onClick={() => {
                  // De enige uitgang van het dashboard naar de monetisatie.
                  // `nutrient` zegt welke vergelijkingspagina dit scherm voedt,
                  // `gedekt` of mensen ook klikken als hun dekking al bewezen is.
                  trackEvent("nutrition_week_nutrient_clicked", {
                    nutrient: rij.nutrient,
                    gedekt: rij.gedekt === true,
                    destination: rij.comparisonPath,
                  });
                  emitAccountClientEvent("nutrition.week_nutrient_clicked", {
                    nutrient: rij.nutrient,
                    covered: rij.gedekt === true,
                    days_logged: overzicht.dagenGeregistreerd,
                  });
                  clarityTag("nutrition_weekoverzicht", `stof_${rij.nutrient}`);
                }}
                className="grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-x-2.5 py-2.5 no-underline transition-colors hover:bg-white/[0.03]"
              >
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[13px] text-[#F1EFE8]">{rij.label}</span>
                  {rij.gedekt ? (
                    <span className="text-[10px] text-[#5A8F6A]">✓</span>
                  ) : null}
                  <span aria-hidden className="text-[11px] text-[#6F8177]">
                    ›
                  </span>
                </span>
                <span className="text-right font-mono text-[11.5px] tabular-nums text-[#9FB0A6]">
                  {rij.dagenMetBron === 0 ? "n.o." : rij.gemiddeld}
                </span>
                <span className="text-right font-mono text-[11.5px] tabular-nums text-[#7E8C82]">
                  {rij.referentie === null
                    ? "eigen"
                    : `${rij.referentie} ${rij.unit}`}
                </span>
                <span className="text-right font-mono text-[11.5px] tabular-nums text-[#C8956C]">
                  {rij.teGaan === null ? "—" : `${rij.teGaan} ${rij.unit}`}
                </span>
              </Link>

              {!rij.bewijsbaar ? (
                <p className="m-0 pb-2.5 text-[10px] leading-relaxed text-[#6F8177]">
                  Met een dagboek niet aan te tonen — daarom geen oordeel, alleen
                  je bronnen.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="m-0 rounded-xl border-l-2 border-[#5A8F6A] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
        <strong className="font-bold text-[#F1EFE8]">
          &ldquo;Te gaan&rdquo; is een afstand, geen tekort.
        </strong>{" "}
        Het is wat er nog tussen je registratie en de referentie zit. Dat je het
        niet registreerde betekent niet dat je het niet binnenkreeg — daarom
        staat er nooit een kruis, en bij een gehaalde referentie een ✓.
      </p>
    </div>
  );
}
