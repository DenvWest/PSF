"use client";

import { useEffect, useState } from "react";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { macroPortieVoor } from "@/lib/catalogus-macro-portie";
import { bedragVanSupermarktveld, SUPERMARKT_MACRO_VELDEN } from "@/lib/nutrition-supermarkt-items";
import { haalNevoProductViaApi } from "@/lib/supermarkt-producten-client";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Calorieën en macro's uit NEVO naast de kernstoffen-bijdrage, voor een
 * catalogusregel die aan NEVO gekoppeld is. Informatief: telt niet mee in de
 * dekking. Een benaderingskoppeling zegt dat hardop. Rendert niets zolang er
 * niets te tonen is (geen koppeling, nog laden, ophalen mislukt).
 */
export default function NevoMacroBlok({ entry, grams }: { entry: CatalogEntry; grams: number }) {
  const doel = macroPortieVoor(entry);
  const code = doel?.nevoCode ?? null;
  const [geladen, setGeladen] = useState<{ code: string; product: SupermarktProduct | null } | null>(null);

  useEffect(() => {
    if (!code) return;
    let afgebroken = false;
    void haalNevoProductViaApi(code).then((product) => {
      if (!afgebroken) setGeladen({ code, product });
    });
    return () => {
      afgebroken = true;
    };
  }, [code]);

  const product = geladen && geladen.code === code ? geladen.product : null;
  if (!doel || !product) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
        {doel.benadering ? "Calorieën en macro's · benadering" : "Calorieën en macro's"}
      </p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {SUPERMARKT_MACRO_VELDEN.map((veld) => {
          const bedrag = bedragVanSupermarktveld(product, veld.veld, grams);
          return (
            <li
              key={veld.veld}
              className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
            >
              <span>{veld.label}</span>
              <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                {bedrag === null ? "n.o." : `${Math.round(bedrag * 10) / 10} ${veld.unit}`}
              </span>
            </li>
          );
        })}
      </ul>
      {doel.benadering ? (
        <p className="m-0 mt-1.5 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
          Gebaseerd op een vergelijkbaar voedingsmiddel ({product.naam}).
        </p>
      ) : null}
      <div className="mt-1.5">
        <SupermarktBronRegel producten={[product]} berekend />
      </div>
    </div>
  );
}
