"use client";

import { useMemo } from "react";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { buildDoelStand, type DoelStand } from "@/lib/kompas-winst-dagboek";
import { useDagboekDagen } from "@/lib/use-dagboek-dagen";
import { useEiwitDoel, useGewoneMaaltijden, useKernstofNormen, useVoedingsrichting } from "@/lib/use-kernstof-normen";

/** De stand van je doel op voeding, uit je dagboek; null zolang er geen dagboek is. */
export function useDoelStand(): DoelStand | null {
  const normen = useKernstofNormen();
  const richting = useVoedingsrichting();
  const eiwitDoelG = useEiwitDoel();
  const gewone = useGewoneMaaltijden();
  const dagen = useDagboekDagen();
  const vandaag = todayInAgendaTimezone();

  return useMemo(
    () => (dagen ? buildDoelStand(dagen, vandaag, normen, { gewone, richting, eiwitDoelG }) : null),
    [dagen, vandaag, normen, gewone, richting, eiwitDoelG],
  );
}
