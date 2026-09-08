"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bouwDagboekSamenvatting,
  samenvattingRegel,
  type StofPatroon,
} from "@/lib/nutrition-dagboek-samenvatting";

/**
 * Het voedingsdagboek op Voortgang — samengevat, niet in te vullen.
 *
 * ## Wat hier verdween en waarom
 *
 * Hier stond het dagboek zelf: vier plekken, een invoerformulier per
 * eetmoment, een kalibratieblok. Dat is per 8 september verhuisd naar Kompas.
 * De reden is niet dat het hier lelijk stond maar dat de twee schermen een
 * andere vraag dragen: Kompas is *waar sta ik en wat pak ik nu*, Voortgang is
 * *hoe ging het*. Invullen wat je vanmiddag at hoort bij de eerste vraag.
 *
 * Twee plekken waar je dezelfde dag kunt bewerken is bovendien een garantie op
 * verschil: wie hier iets invult terwijl Kompas nog de oude stand toont, ziet
 * twee schermen die elkaar tegenspreken over dezelfde ochtend.
 *
 * Wat overblijft is de terugblik: hoeveel dagen, en welke stoffen kwamen er
 * structureel wel en niet langs. Met één deur terug naar de plek waar je iets
 * kunt doen.
 */

function PatroonRij({ patroon }: { patroon: StofPatroon }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-1.5 last:border-b-0">
      <span className="min-w-0 truncate text-[12.5px] text-[#CDD7D0]">
        {patroon.stof.label}
      </span>
      <span className="shrink-0 text-[11.5px] tabular-nums text-[#9FB0A6]">
        {patroon.dagen} van {patroon.vanDagen} {patroon.vanDagen === 1 ? "dag" : "dagen"}
      </span>
    </li>
  );
}

export default function NutritionDagboekSamenvatting({
  surface,
  onGoKompas,
}: {
  surface: string;
  /** Naar Kompas › Voeding, waar het dagboek staat. */
  onGoKompas?: () => void;
}) {
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    let afgebroken = false;
    fetch("/api/account/nutrition-daybook", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (afgebroken) return;
        setDagen(Array.isArray(payload?.days) ? payload.days : []);
        setGeladen(true);
      })
      .catch(() => {
        if (!afgebroken) setGeladen(true);
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  const samenvatting = useMemo(() => bouwDagboekSamenvatting(dagen), [dagen]);

  const deur = onGoKompas ? (
    <button
      type="button"
      onClick={() => {
        trackEvent("nutrition_dagboek_naar_kompas_click", {
          surface,
          dagen: samenvatting.ingevuldeDagen,
        });
        clarityTag("nutrition_dagboek_naar_kompas", "click");
        onGoKompas();
      }}
      className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-none bg-[#5A8F6A] px-4 text-[13px] font-semibold text-[#0E1810]"
    >
      Vul je dag in op Kompas <Icons.ChevronRight s={14} />
    </button>
  ) : null;

  return (
    <section
      aria-label="Je voedingsdagboek"
      className="rounded-2xl border border-white/10 bg-black/20 p-3.5"
    >
      <p className="m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Je voedingsdagboek
      </p>

      <p className="m-0 mt-2 text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
        {geladen ? samenvattingRegel(samenvatting) : "Je dagboek laden…"}
      </p>

      {samenvatting.ingevuldeDagen > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-3 @[560px]:grid-cols-2">
          <div>
            <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              Kwam er meestal wel in
            </p>
            <ul className="m-0 flex list-none flex-col p-0">
              {samenvatting.sterkste.map((patroon) => (
                <PatroonRij key={patroon.stof.id} patroon={patroon} />
              ))}
            </ul>
          </div>
          <div>
            <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              Kwam er zelden in
            </p>
            <ul className="m-0 flex list-none flex-col p-0">
              {samenvatting.zwakste.map((patroon) => (
                <PatroonRij key={patroon.stof.id} patroon={patroon} />
              ))}
            </ul>
          </div>
        </div>
      ) : geladen ? (
        <p className="m-0 mt-1.5 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Zodra je een dag invult, staat hier welke stoffen er structureel wel en niet in
          voorkwamen. Eén dag zegt weinig; een handvol dagen laat je patroon zien.
        </p>
      ) : null}

      <p className="m-0 mt-2.5 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Een terugblik, geen invoer: je dag vul je in op Kompas. Op hoeveel dagen een stof
        langskwam — geen milligrammen, want porties en gehaltes zijn schattingen.
      </p>

      {deur}
    </section>
  );
}
