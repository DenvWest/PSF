"use client";

import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  nutritionLogboekRegel,
  nutritionStatusRegel,
  type NutritionKompasSamenvatting,
} from "@/lib/nutrition-kompas-samenvatting";

/**
 * Voeding · Kompas — twee deuren in plaats van één dossier.
 *
 * Links **Voedingsstatus**: wat je check over je eetbasis zegt, met de deur
 * naar je voedingsbeeld op Voortgang (waar de ladder mét feitenrijen en
 * meetreeks staat). Rechts **Voedingslogboek**: wat er nog aan jou is, met de
 * deur naar het schap waar het volle logboek uitgeklapt en met zoekveld staat.
 *
 * De reden dat dit twee kaarten zijn en niet één rij knoppen: de twee vragen
 * zijn niet van dezelfde soort. De status is een uitkomst — je leest hem, je
 * verandert hem niet met een klik. Het logboek is een taak. Een telling erbij
 * maakt het verschil zichtbaar zonder dat je hoeft door te klikken om te weten
 * of het de moeite is.
 *
 * Zie {@link buildNutritionKompasSamenvatting} voor waarom de twee tellingen
 * verschillen.
 */
export default function NutritionKompasTweeluik({
  samenvatting,
  keuzesGeladen = true,
  surface,
  onGoVoortgang,
  onGoLogboek,
}: {
  samenvatting: NutritionKompasSamenvatting;
  /**
   * Of je bewaarde keuzes al binnen zijn. Zo niet, dan telt de logboek-kaart
   * nog niet: een getal dat een tel later omlaag springt leest als een fout,
   * en de deur werkt ook zonder telling.
   */
  keuzesGeladen?: boolean;
  surface: string;
  onGoVoortgang: () => void;
  onGoLogboek: () => void;
}) {
  const handle = (
    bestemming: "voedingsstatus" | "voedingslogboek",
    go: () => void,
  ) => {
    trackEvent("nutrition_kompas_tweeluik_click", {
      surface,
      destination: bestemming,
      aandacht: samenvatting.aandacht,
      open_choices: samenvatting.open,
    });
    clarityTag("nutrition_kompas_tweeluik", bestemming);
    go();
  };

  return (
    <div className="grid grid-cols-1 gap-2 @[560px]:grid-cols-2">
      <button
        type="button"
        onClick={() => handle("voedingsstatus", onGoVoortgang)}
        className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 p-3.5 text-left transition hover:border-white/25"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Voedingsstatus
          </span>
          <span className="text-[#7E8C82]">
            <Icons.ChevronRight s={14} />
          </span>
        </span>
        <span className="text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
          {nutritionStatusRegel(samenvatting)}
        </span>
        <span className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Uit je voedingscheck — je ladder, je feitenrijen en je meetreeks.
        </span>
      </button>

      <button
        type="button"
        onClick={() => handle("voedingslogboek", onGoLogboek)}
        className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 p-3.5 text-left transition hover:border-white/25"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Voedingslogboek
          </span>
          <span className="text-[#7E8C82]">
            <Icons.ChevronRight s={14} />
          </span>
        </span>
        <span className="text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
          {keuzesGeladen
            ? nutritionLogboekRegel(samenvatting)
            : "Je route per stof: eten, supplement, of allebei."}
        </span>
        <span className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {samenvatting.gateOpen
            ? "Per stof: uit je eten, uit een supplement, of allebei."
            : (samenvatting.gateReason ??
              "Eerst je eetbasis; daarna pas de vraag of aanvullen aan de orde is.")}
        </span>
      </button>
    </div>
  );
}
