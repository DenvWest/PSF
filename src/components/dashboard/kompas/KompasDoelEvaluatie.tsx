"use client";

import { useEffect, useState } from "react";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { dagenTussen, datumLabel, evaluatieDue } from "@/lib/doel-evaluatie";
import { trackEvent } from "@/lib/ga4";
import { RICHTINGEN } from "@/lib/nutrition-voedingsrichting";
import { postBevestig, useDoelEvaluatie } from "@/lib/use-doel-evaluatie";
import { useDoelStand } from "@/lib/use-doel-stand";
import { useVoedingsrichting } from "@/lib/use-kernstof-normen";

type Props = {
  /** Je ijkpunt toen en nu (eerste en laatste score), of null bij minder dan twee scores. */
  ijkpunt: { toen: number; nu: number } | null;
  onVeranderen: () => void;
};

/**
 * De evaluatie van je doel op voeding: 30 dagen na je keuze (of je laatste
 * "Houden") een terugblik met twee aparte regels, en de vraag of dit je doel
 * blijft. Ijkpunt en stofstand worden nooit samengevoegd, en een daling krijgt
 * dezelfde neutrale zin als een stijging. De evaluatie verandert de richting
 * nooit zelf (`BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md` §3).
 */
export default function KompasDoelEvaluatie({ ijkpunt, onVeranderen }: Props) {
  const richting = useVoedingsrichting();
  const evaluatie = useDoelEvaluatie();
  const stand = useDoelStand();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const stof = stand?.kind === "stof" && stand.richtingKort ? stand : null;
  const start = stof && evaluatie ? evaluatie.startstand[stof.nutrient] : null;
  const zichtbaar = Boolean(
    richting && evaluatie && stof && start && evaluatieDue(evaluatie, stof.nutrient, new Date()),
  );

  const nutrient = stof?.nutrient ?? null;
  useEffect(() => {
    if (!zichtbaar || !nutrient || !start) return;
    emitAccountClientEvent("doel.evaluatie_getoond", { stof: nutrient, dagen_tussen: dagenTussen(start.datum, new Date()) });
    trackEvent("dashboard_kompas_context_view", { zone: "doel_evaluatie", staat: "getoond", nutrient });
  }, [zichtbaar, nutrient, start]);

  if (!zichtbaar || !richting || !evaluatie?.gekozenOp || !stof || !start) return null;

  async function houden() {
    setBezig(true);
    setFout(null);
    try {
      await postBevestig();
      emitAccountClientEvent("doel.evaluatie_keuze", { keuze: "houden" });
      trackEvent("dashboard_kompas_context_click", { zone: "doel_evaluatie", keuze: "houden", domain: "voeding" });
      clarityTag("dashboard_kompas_context", "doel_evaluatie_houden");
    } catch {
      setFout("Opslaan lukte niet. Probeer het zo nog eens.");
    } finally {
      setBezig(false);
    }
  }

  function veranderen() {
    emitAccountClientEvent("doel.evaluatie_keuze", { keuze: "veranderen" });
    trackEvent("dashboard_kompas_context_click", { zone: "doel_evaluatie", keuze: "veranderen", domain: "voeding" });
    clarityTag("dashboard_kompas_context", "doel_evaluatie_veranderen");
    onVeranderen();
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-2.5" data-testid="kompas-doel-evaluatie">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">Je doel na een tijd</span>
      <p className="m-0 mt-1 text-[12px] leading-snug text-[#C9D4CC] text-pretty">
        Je koos &ldquo;{RICHTINGEN[richting].kort}&rdquo; op {datumLabel(evaluatie.gekozenOp)}.
      </p>
      {ijkpunt ? (
        <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">
          Hoe makkelijk gaat het: {ijkpunt.toen} → {ijkpunt.nu} van 10.
        </p>
      ) : null}
      <p className="m-0 mt-1 text-[11.5px] leading-snug text-[#9FB0A6] text-pretty">
        Je {stof.label.toLowerCase()}: minstens {start.aandeelPct}% → {stof.benaderd ? "≈ " : ""}
        {stof.aandeelPct}% van {stof.doelLabel}.
      </p>
      <p className="m-0 mt-2 text-[12px] font-semibold text-[#E7EDE8]">Blijft dit je doel?</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={bezig}
          onClick={() => void houden()}
          className="min-h-9 cursor-pointer rounded-[10px] border-none bg-[var(--sage)] px-3.5 text-[12.5px] font-semibold text-[#0f1c10] disabled:opacity-60"
        >
          Houden
        </button>
        <button
          type="button"
          disabled={bezig}
          onClick={veranderen}
          className="min-h-9 cursor-pointer rounded-[10px] border border-white/20 bg-transparent px-3.5 text-[12.5px] font-semibold text-[#CDD7D0] disabled:opacity-60"
        >
          Veranderen
        </button>
      </div>
      {fout ? <p className="m-0 mt-2 text-[12px] text-[#C8956C]">{fout}</p> : null}
    </div>
  );
}
