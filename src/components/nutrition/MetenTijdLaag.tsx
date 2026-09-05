"use client";

import { useEffect } from "react";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildNutritionTijdlaag,
  type TijdlaagRichting,
} from "@/lib/nutrition-tijdlaag";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";

const RICHTING: Record<TijdlaagRichting, { teken: string; label: string; className: string }> = {
  vooruit: { teken: "↑", label: "vooruit", className: "text-[#9CC5A9]" },
  achteruit: { teken: "↓", label: "terug", className: "text-[#C8956C]" },
  gelijk: { teken: "→", label: "gelijk", className: "text-[#9FB0A6]" },
  nieuw: { teken: "·", label: "nieuw", className: "text-[#7E8C82]" },
};

const TH =
  "px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] text-[#7E8C82]";

/**
 * P5 Meten & timing — je eigen reeks als tabel: vorige naast nu.
 */
export default function MetenTijdLaag({
  meetreeks,
  surface,
}: {
  meetreeks: Meetreeks | null;
  surface: string;
}) {
  const tijdlaag = buildNutritionTijdlaag(meetreeks);
  const { momenten, rijen, laatsteDatum, vorigeDatum } = tijdlaag;

  useEffect(() => {
    trackEvent("nutrition_tijdlaag_view", {
      surface,
      moments: momenten,
      rows: rijen.length,
    });
    emitAccountClientEvent("nutrition.tijdlaag_viewed", {
      surface,
      moments: momenten,
      rows: rijen.length,
    });
    clarityTag("nutrition_tijdlaag", String(momenten));
  }, [surface, momenten, rijen.length]);

  const nuKop = laatsteDatum ? `Nu · ${laatsteDatum}` : "Nu";
  const vorigeKop = vorigeDatum ? `Vorige · ${vorigeDatum}` : "Vorige";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Meting</caption>
        <thead>
          <tr className="border-b border-white/10">
            <th className={TH}>Onderdeel</th>
            <th className={TH}>{vorigeKop}</th>
            <th className={TH}>{nuKop}</th>
            {momenten >= 2 ? <th className={TH}>Richting</th> : null}
          </tr>
        </thead>
        <tbody>
          {rijen.length === 0 ? (
            <tr>
              <td colSpan={momenten >= 2 ? 4 : 3} className="px-3.5 py-3 text-[12.5px] text-[#9FB0A6]">
                Nog geen meetmoment.
              </td>
            </tr>
          ) : (
            rijen.map((rij) => {
              const richting = RICHTING[rij.richting];
              return (
                <tr key={rij.key} className="border-b border-white/[0.06] last:border-b-0">
                  <th
                    scope="row"
                    className="px-3.5 py-2.5 text-[13px] font-semibold text-[#E7EDE8]"
                  >
                    {rij.label}
                  </th>
                  <td className="px-3.5 py-2.5 text-[12px] text-[#7E8C82]">{rij.eerder ?? "—"}</td>
                  <td className="px-3.5 py-2.5 text-[12.5px] text-[#CDD7D0]">{rij.nu}</td>
                  {momenten >= 2 ? (
                    <td className={`px-3.5 py-2.5 text-[12px] font-semibold ${richting.className}`}>
                      {richting.teken} {richting.label}
                    </td>
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
