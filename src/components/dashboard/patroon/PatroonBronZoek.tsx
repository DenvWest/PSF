"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { searchCatalog } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { searchSupplementCatalog } from "@/data/nutrition/supplement-catalog";
import type { Voedingswijze } from "@/lib/account-kernstof-profiel";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";
import { weergaveVoorStandaardPortie, type DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { pastBijVoedingswijze, rijksteBronnen } from "@/lib/nutrition-rijkste-bronnen";
import { NUTRIENT_HUB_CATEGORY } from "@/lib/nutrition-result-rows";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { toBase } from "@/lib/nutrition-units";
import { buildSupplementHubHref } from "@/lib/supplement-hub/hub-link";

/**
 * Bronnen van één stof zoeken en kiezen, in het stof-detail van Je patroon.
 *
 * Zonder zoekterm: de rijkste voedingsbronnen per portie (top 5, uit te
 * klappen tot top 20), gefilterd op je voedingswijze. Met zoekterm: voeding én
 * supplementen uit de dagboekcatalogus, met wat één portie van deze stof
 * levert.
 *
 * De ster bewaart in dezelfde dagboek-favorieten als het dagboek zelf, zodat
 * wat je hier kiest morgen bovenaan staat bij "Mijn producten" / "Mijn
 * supplementen". Een supplement linkt naar de catalogus met PS-Score van die
 * stof (`/supplementen?categorie=…`), niet direct naar `/beste/*`: voeding
 * eerst, de aanbeveling als tweede stap
 * (`docs/plan/BESLUIT_MICRO_IN_BEELD_2026-10.md` §5).
 */

const TOP_KORT = 5;
const TOP_LANG = 20;
const MAX_VOEDING = 10;
const MAX_SUPPLEMENT = 5;

type Rij = {
  bron: DagboekItemBron;
  key: string;
  naam: string;
  portie: string;
  /** Wat één portie van deze stof levert, als tekst ("120 mg", "0", "spoor", "n.o."). */
  levert: string;
  /** Aandeel van de norm per portie, of null. */
  aandeel: number | null;
  /** Bij een supplement: de catalogus met PS-Score van zijn stof. */
  hubHref: string | null;
  hubLabel: string | null;
};

function sleutel(bron: DagboekItemBron, key: string): string {
  return `${bron}:${key}`;
}

function rijVoor(
  bron: DagboekItemBron,
  key: string,
  naam: string,
  nutrient: NutrientId,
  unit: string,
  norm: number | null,
): Rij {
  const weergave = weergaveVoorStandaardPortie(bron, key, nutrient);
  let levert = "n.o.";
  let aandeel: number | null = null;
  if (weergave.soort === "waarde") {
    const inBasis = toBase(weergave.value, weergave.unit, nutrient);
    if (inBasis !== null) {
      levert = `${weergave.benadering ? "≈ " : ""}${hoeveelheid(inBasis)} ${unit}`;
      aandeel = norm ? inBasis / norm : null;
    }
  } else if (weergave.soort === "nul") {
    levert = "0";
  } else if (weergave.soort === "spoor") {
    levert = "spoor";
  }
  return { bron, key, naam, portie: "", levert, aandeel, hubHref: null, hubLabel: null };
}

export default function PatroonBronZoek({
  nutrient,
  label,
  unit,
  norm,
  voedingswijze,
}: {
  nutrient: NutrientId;
  label: string;
  unit: string;
  norm: number | null;
  voedingswijze: Voedingswijze | null;
}) {
  const [zoekterm, setZoekterm] = useState("");
  const [lang, setLang] = useState(false);
  const [favorieten, setFavorieten] = useState<ReadonlySet<string>>(new Set());
  const [bezig, setBezig] = useState<string | null>(null);

  useEffect(() => {
    let afgebroken = false;
    void fetch("/api/account/dagboek-favorieten", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { items?: DagboekFavoriet[] };
        if (afgebroken) return;
        // Samenvoegen, niet vervangen: een ster die je zette vóór deze lijst binnen was, blijft staan.
        setFavorieten((huidig) => new Set([...huidig, ...(body.items ?? []).map((f) => sleutel(f.bron, f.key))]));
      })
      .catch(() => {
        // Zonder favorieten werkt de ster nog; alleen de bestaande sterren ontbreken.
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  const term = zoekterm.trim();

  const rijkste = useMemo(
    () =>
      rijksteBronnen(nutrient, "portie", 60)
        .filter((bron) => pastBijVoedingswijze(bron.entry, voedingswijze))
        .slice(0, TOP_LANG)
        .map((bron): Rij => ({
          bron: "voeding",
          key: bron.entry.key,
          naam: bron.entry.labelNl,
          portie: bron.portieLabel,
          levert: `${hoeveelheid(bron.perPortie)} ${bron.unit}`,
          aandeel: norm ? bron.perPortie / norm : null,
          hubHref: null,
          hubLabel: null,
        })),
    [nutrient, voedingswijze, norm],
  );

  const treffers = useMemo((): Rij[] => {
    if (!term) return [];
    const voeding = searchCatalog(term, MAX_VOEDING).map((entry) => ({
      ...rijVoor("voeding", entry.key, entry.labelNl, nutrient, unit, norm),
      portie: entry.porties[0]?.labelNl ?? "",
    }));
    const supplementen = searchSupplementCatalog(term, MAX_SUPPLEMENT).map((entry) => {
      const hub = NUTRIENT_HUB_CATEGORY[entry.nutrient];
      return {
        ...rijVoor("supplement", entry.key, entry.labelNl, nutrient, unit, norm),
        portie: entry.porties[0]?.labelNl ?? "",
        hubHref: buildSupplementHubHref(hub),
        hubLabel: hub,
      };
    });
    return [...voeding, ...supplementen];
  }, [term, nutrient, unit, norm]);

  const rijen = term ? treffers : rijkste.slice(0, lang ? TOP_LANG : TOP_KORT);

  const wisselFavoriet = async (rij: Rij) => {
    const id = sleutel(rij.bron, rij.key);
    const bewaard = favorieten.has(id);
    setBezig(id);
    try {
      const response = await fetch(
        bewaard
          ? `/api/account/dagboek-favorieten?bron=${encodeURIComponent(rij.bron)}&key=${encodeURIComponent(rij.key)}`
          : "/api/account/dagboek-favorieten",
        bewaard
          ? { method: "DELETE", credentials: "include" }
          : {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bron: rij.bron, key: rij.key }),
            },
      );
      if (!response.ok) return;
      setFavorieten((huidig) => {
        const volgende = new Set(huidig);
        if (bewaard) volgende.delete(id);
        else volgende.add(id);
        return volgende;
      });
      emitAccountClientEvent(
        bewaard ? "nutrition.dagboek_favoriet_verwijderd" : "nutrition.dagboek_favoriet_toegevoegd",
        { bron: rij.bron, surface: "patroon_stof" },
      );
      trackEvent(bewaard ? "nutrition_dagboek_favoriet_verwijderd" : "nutrition_dagboek_favoriet_toegevoegd", {
        bron: rij.bron,
        surface: "patroon_stof",
        nutrient,
      });
    } finally {
      setBezig(null);
    }
  };

  return (
    <div className="vd-tabel">
      <div className="vd-tabel-kop">
        <span className="!text-left">{term ? `Zoeken · wat één portie aan ${label.toLowerCase()} levert` : "Rijkste voedingsbronnen · per portie"}</span>
      </div>

      <div className="vd-tabel-rij">
        <label className="flex w-full items-center gap-2">
          <span className="sr-only">Zoek een product of supplement</span>
          <input
            type="search"
            value={zoekterm}
            onChange={(event) => setZoekterm(event.target.value)}
            onBlur={() => {
              if (term) trackEvent("nutrition_patroon_bron_gezocht", { nutrient, treffers: treffers.length });
            }}
            placeholder="Zoek een product of supplement"
            className="w-full rounded-lg border border-[var(--vd-line)] bg-[var(--vd-surface)] px-3 py-2 text-[13px] text-[var(--vd-ink)] placeholder:text-[var(--vd-ink-4)]"
          />
        </label>
      </div>

      {!term && voedingswijze ? (
        <div className="vd-tabel-rij">
          <span className="vd-naam">
            <i>Alleen {voedingswijze}e bronnen, volgens je keuze op Je doelen.</i>
          </span>
        </div>
      ) : null}

      {term && rijen.length === 0 ? (
        <div className="vd-tabel-rij">
          <span className="vd-naam">
            <i>Niets gevonden voor &ldquo;{term}&rdquo;.</i>
          </span>
        </div>
      ) : null}

      {rijen.map((rij) => {
        const id = sleutel(rij.bron, rij.key);
        const bewaard = favorieten.has(id);
        return (
          <div key={id} className="vd-tabel-rij grid-cols-[1fr_auto_32px]">
            <span className="vd-naam">
              {rij.naam}
              <i>
                {rij.bron === "supplement" ? "supplement · " : ""}
                {rij.portie}
              </i>
              {rij.hubHref ? (
                <Link
                  href={rij.hubHref}
                  onClick={() =>
                    trackEvent("nutrition_patroon_supplement_hub_click", {
                      nutrient,
                      categorie: rij.hubLabel ?? "",
                    })
                  }
                  className="mt-0.5 block text-[11.5px] font-semibold text-[var(--vd-sage-2)]"
                >
                  Bekijk {rij.hubLabel}-supplementen met PS-Score →
                </Link>
              ) : null}
            </span>
            <span className="vd-getal">
              {rij.levert}
              {rij.aandeel !== null ? ` · ${percentageADH(rij.aandeel)}` : ""}
            </span>
            <button
              type="button"
              aria-pressed={bewaard}
              aria-label={bewaard ? `${rij.naam} uit je favorieten halen` : `${rij.naam} bewaren in je favorieten`}
              disabled={bezig === id}
              onClick={() => void wisselFavoriet(rij)}
              className={`cursor-pointer border-0 bg-transparent text-[16px] leading-none ${
                bewaard ? "text-[var(--vd-sage-2)]" : "text-[var(--vd-ink-4)]"
              }`}
            >
              {bewaard ? "★" : "☆"}
            </button>
          </div>
        );
      })}

      {!term && rijkste.length > TOP_KORT ? (
        <div className="vd-tabel-rij">
          <button
            type="button"
            onClick={() => {
              setLang((huidig) => !huidig);
              if (!lang) trackEvent("nutrition_patroon_rijkste_meer", { nutrient });
            }}
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-[12.5px] font-semibold text-[var(--vd-ink-2)]"
          >
            {lang ? "Toon top 5" : `Toon top ${Math.min(TOP_LANG, rijkste.length)}`}
          </button>
        </div>
      ) : null}

      <div className="vd-tabel-rij">
        <span className="vd-naam">
          <i>☆ bewaart in je dagboek-favorieten: dan staat het bovenaan als je een maaltijd invult.</i>
        </span>
      </div>
    </div>
  );
}
