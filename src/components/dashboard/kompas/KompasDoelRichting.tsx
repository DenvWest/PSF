"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  KLACHTEN_DOORVERWIJZING,
  RICHTINGEN,
  VOEDINGSRICHTINGEN,
  type Voedingsrichting,
} from "@/lib/nutrition-voedingsrichting";
import { postVoedingsdoelen } from "@/lib/voedingsdoelen-client";
import { herlaadDoelEvaluatie } from "@/lib/use-doel-evaluatie";
import { useVoedingsrichting, zetKernstofWeergave } from "@/lib/use-kernstof-normen";

/**
 * "Waar loop je tegenaan": de richting (`NUT_DOEL`) als eerste laag van de
 * doel-zone op voeding. Zelfde opslag en zelfde gedeelde toestand als Je
 * doelen, dus een keuze hier staat meteen in Je patroon en omgekeerd. Kadert,
 * meet niet (`BESLUIT_VOEDINGSRICHTING_2026-10.md`).
 */
type Props = {
  kiezen: boolean;
  onKiezenChange: (open: boolean) => void;
};

export default function KompasDoelRichting({ kiezen, onKiezenChange: setKiezen }: Props) {
  const richting = useVoedingsrichting();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function kies(volgende: Voedingsrichting | null) {
    setBezig(true);
    setFout(null);
    try {
      const bijgewerkt = await postVoedingsdoelen({ voedingsrichting: volgende });
      zetKernstofWeergave(bijgewerkt);
      void herlaadDoelEvaluatie();
      emitAccountClientEvent("nutrition.voedingsrichting_gekozen", {
        richting: volgende ?? "geen",
        surface: "kompas_context",
      });
      trackEvent("voedingsdoel_aangepast", { setting: "voedingsrichting", surface: "kompas_context" });
      trackEvent("dashboard_kompas_context_click", { zone: "doel_richting", domain: "voeding" });
      clarityTag("dashboard_kompas_context", "doel_richting");
      setKiezen(false);
    } catch {
      setFout("Opslaan lukte niet. Probeer het zo nog eens.");
    } finally {
      setBezig(false);
    }
  }

  if (kiezen) {
    return (
      <div className="mt-2.5" data-testid="kompas-doel-richting">
        <p className="m-0 text-[12px] font-semibold text-[#E7EDE8]">Waar loop je het meest tegenaan?</p>
        <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
          {VOEDINGSRICHTINGEN.map((id) => (
            <li key={id}>
              <button
                type="button"
                disabled={bezig}
                aria-pressed={richting === id}
                onClick={() => void kies(id)}
                className={`w-full cursor-pointer rounded-[10px] border px-3 py-2 text-left text-[12px] leading-snug transition disabled:opacity-60 ${
                  richting === id
                    ? "border-[var(--sage)] bg-[var(--sage)] text-[#0f1c10]"
                    : "border-white/12 bg-black/25 text-[#CDD7D0] hover:border-white/25"
                }`}
              >
                {RICHTINGEN[id].label}
              </button>
            </li>
          ))}
        </ul>
        {fout ? <p className="m-0 mt-2 text-[12px] text-[#C8956C]">{fout}</p> : null}
        <button
          type="button"
          disabled={bezig}
          onClick={() => setKiezen(false)}
          className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[#9FB0A6] underline-offset-2 hover:text-[#E7EDE8] hover:underline"
        >
          Annuleren
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2.5" data-testid="kompas-doel-richting">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
        Waar je tegenaan loopt
      </span>
      <p className="m-0 mt-1 text-[12.5px] leading-snug text-[#E7EDE8] text-pretty">
        {richting ? RICHTINGEN[richting].label : "Nog niet gekozen"}
      </p>
      <button
        type="button"
        onClick={() => setKiezen(true)}
        className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[12.5px] font-semibold text-[var(--sage)]"
      >
        {richting ? "Wijzig" : "Kies"}
        <Icons.ArrowRight s={13} />
      </button>
      {richting === "klachten" ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">{KLACHTEN_DOORVERWIJZING}</p>
      ) : null}
    </div>
  );
}
