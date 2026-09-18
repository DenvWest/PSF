"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VoedingThemaKnop } from "@/components/dashboard/patroon/VoedingThema";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
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
 * voor een onafgebroken reeks van 3 dagen!"). Geen van die drie staat hier:
 *
 * - **Calorieën en macro's** — de catalogus draagt ze niet, en het besluit
 *   wijst de kcal-teller af (§2b): een kcal-teller verkoopt geen omega-3, een
 *   gat wel.
 * - **De inlogreeks** — dat beloont openen in plaats van eten, en het maakt
 *   van een gemiste dag een verlies. Het dagboek vraagt vier dagen, geen
 *   dertig.
 * - **Het rapportcijfer** — geen weekscore: het leest als een oordeel over de
 *   persoon en het gooit weg waar het om gaat.
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
    <div className="vd-paneel">
      <div className="vd-kop">
        <button type="button" onClick={onTerug} className="vd-terug">
          <span aria-hidden>←</span> Je patroon
        </button>
        <VoedingThemaKnop />
      </div>

      <div className="vd-weekbalk">
        <button
          type="button"
          onClick={() => blader(-1)}
          aria-label="Vorige week"
          className="vd-blader"
        >
          ‹
        </button>
        <h2 className="vd-weektitel">
          {weekLabel(overzicht.start, overzicht.eind)}
        </h2>
        <button
          type="button"
          onClick={() => blader(1)}
          disabled={isHuidig}
          aria-label="Volgende week"
          className="vd-blader"
        >
          ›
        </button>
      </div>

      <p className="vd-note">
        {gemeten === 0 ? (
          "In deze week staat nog niets geregistreerd. Vul een dag in je dagboek in — dan rekent dit overzicht mee."
        ) : (
          <>
            Je registreerde{" "}
            <strong>
              {gemeten} {gemeten === 1 ? "dag" : "dagen"}
            </strong>{" "}
            in deze week. Alles hieronder is het gemiddelde over die{" "}
            {gemeten === 1 ? "dag" : "dagen"} — en een ondergrens, want wat je
            niet noemde kan er alleen bij komen.
          </>
        )}
      </p>

      <div className="vd-tabel vd-tabel--los">
        <div className="vd-tabel-kop vd-week-kop">
          <span>Stof</span>
          <span>Gem.</span>
          <span>Referentie</span>
          <span>Te gaan</span>
        </div>

        {overzicht.rijen.map((rij) => (
          <Link
            key={rij.nutrient}
            href={rij.comparisonPath}
            onClick={() => {
              // De enige uitgang van het dashboard naar de monetisatie.
              // `nutrient` zegt welke vergelijkingspagina dit scherm voedt,
              // `covered` of mensen ook klikken als hun dekking al bewezen is.
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
            className="vd-tabel-rij vd-week-rij"
          >
            <span className="vd-naam">
              <span className="vd-naam-kop">
                {rij.label}
                {rij.gedekt ? (
                  <span className="vd-pil" data-toon="sage">
                    gedekt
                  </span>
                ) : null}
              </span>
              <i>
                {rij.bewijsbaar
                  ? `bron op ${rij.dagenMetBron} van ${overzicht.dagenGeregistreerd} dagen`
                  : "met een dagboek niet aan te tonen"}
              </i>
            </span>

            <span className="vd-getal">
              {rij.dagenMetBron === 0 ? "n.o." : hoeveelheid(rij.gemiddeld)}
            </span>
            <span className="vd-getal" data-toon="stil">
              {rij.referentie === null ? "eigen" : `${rij.referentie} ${rij.unit}`}
            </span>
            <span className="vd-getal" data-toon="terra">
              {rij.teGaan === null
                ? "—"
                : `${hoeveelheid(rij.teGaan)} ${rij.unit}`}
            </span>
          </Link>
        ))}
      </div>

      <p className="vd-note">
        <strong>&ldquo;Te gaan&rdquo; is een afstand, geen tekort.</strong> Het is
        wat er nog tussen je registratie en de referentie zit. Dat je het niet
        registreerde betekent niet dat je het niet binnenkreeg — daarom staat er
        nooit een kruis, en bij een gehaalde referentie &ldquo;gedekt&rdquo;.
      </p>
    </div>
  );
}
