"use client";

import { useId, useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
import { clarityTag } from "@/lib/clarity";
import {
  buildDagboekZoekHref,
  gaNaarDashboard,
  type DagboekZoekStart,
} from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { EETMOMENTEN, eetmomentVoorUur, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De ＋ helemaal rechts in de onderbalk: iets toevoegen aan je dagboek, vanaf
 * elk tabblad. Alle drie de ingangen openen het bestaande zoekscherm van het
 * dagboek — er is maar één invoerflow. Zie BESLUIT_ONDERBALK_PLUS_2026-10.md.
 */

type PlusItem = "maaltijd" | "voedingsproduct" | "supplement";

const RIJ =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-[13.5px] text-[#F1EFE8] transition hover:bg-white/[0.06]";

export default function CockpitPlusMenu() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const ga = (item: PlusItem, start: DagboekZoekStart, moment: EetmomentId) => {
    trackEvent("dashboard_plus_item_click", { item, moment });
    setOpen(false);
    gaNaarDashboard(buildDagboekZoekHref(start, moment));
  };

  const nuMoment = () => eetmomentVoorUur(new Date().getHours());

  return (
    <div className="relative flex flex-1 items-center justify-center">
      <button
        type="button"
        onClick={() => {
          if (!open) clarityTag("dashboard_plus_menu", "open");
          setOpen((prev) => !prev);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Toevoegen aan je dagboek"
        title="Toevoegen"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#5A8F6A] text-[#0C1315] shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition active:scale-95"
      >
        <Icons.Plus s={22} sw={2.4} />
      </button>

      {open ? (
        <AgendaSheetFrame titleId={titleId} title="Toevoegen" onClose={() => setOpen(false)}>
          <section aria-labelledby={`${titleId}-maaltijd`} className="flex flex-col gap-2 px-2.5 pb-2">
            <p
              id={`${titleId}-maaltijd`}
              className="m-0 flex items-center gap-2 font-sans text-[13.5px] font-medium text-[#F1EFE8]"
            >
              <Icons.Utensils s={15} style={{ color: "#9FB0A6" }} />
              Maaltijd
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EETMOMENTEN.map((moment) => (
                <button
                  key={moment.id}
                  type="button"
                  onClick={() => ga("maaltijd", "alle", moment.id)}
                  className="cursor-pointer rounded-[10px] border border-white/12 px-3 py-2 text-left text-[13px] text-[#F1EFE8] transition hover:bg-white/[0.06]"
                >
                  {moment.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-2">
            <button type="button" onClick={() => ga("voedingsproduct", "alle", nuMoment())} className={RIJ}>
              <Icons.Leaf s={15} style={{ color: "#9FB0A6" }} />
              Voedingsproduct toevoegen
            </button>
            <button type="button" onClick={() => ga("supplement", "supplementen", nuMoment())} className={RIJ}>
              <Icons.Pill s={15} style={{ color: "#9FB0A6" }} />
              Supplement toevoegen
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent("dashboard_plus_item_click", { item: "kiezen" });
                setOpen(false);
                gaNaarDashboard("/dashboard?tab=keuze");
              }}
              className="cursor-pointer self-start px-2.5 py-1.5 text-[12.5px] text-[#9FB0A6] underline decoration-white/20 underline-offset-2 transition hover:text-[#F1EFE8]"
            >
              Voeding of supplement kiezen
            </button>
          </div>
        </AgendaSheetFrame>
      ) : null}
    </div>
  );
}
