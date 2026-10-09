"use client";

import { useMemo } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { buildDagboekZoekHref, gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { buildDagStatus, buildDagboekWinstRegel } from "@/lib/kompas-winst-dagboek";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { useDagboekDagen } from "@/lib/use-dagboek-dagen";
import { useEiwitDoel, useGewoneMaaltijden, useKernstofNormen, useVoedingsrichting } from "@/lib/use-kernstof-normen";

const DAGBOEK_HREF = "/dashboard?tab=vandaag";
const PATROON_HREF = "/dashboard?tab=voortgang&sectie=stof&periode=7";

const KNOP_KLASSE =
  "mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-[var(--sage)] px-3.5 text-[12.5px] font-semibold text-[#0f1c10] no-underline";

function opsomming(momenten: readonly EetmomentId[]): string {
  if (momenten.length <= 1) return momenten.join("");
  return `${momenten.slice(0, -1).join(", ")} en ${momenten[momenten.length - 1]}`;
}

/**
 * De handeling onder de winst-stap van voeding, afhankelijk van waar je staat.
 *
 * - **Op het Dagboek** (`domainScreenOpen` false) wijst "Log je maaltijd" naar
 *   de pagina waar je al bent. Daar staat de dagstatus en opent de knop de
 *   volgende open maaltijd.
 * - **Op een domeinscherm** gaat de knop naar het dagboek, of naar Je patroon
 *   zodra er vijf volle dagen zijn.
 *
 * Besluit: `BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md` §5.
 */
export default function KompasWinstKnop({ domainScreenOpen }: { domainScreenOpen: boolean }) {
  const normen = useKernstofNormen();
  const richting = useVoedingsrichting();
  const eiwitDoelG = useEiwitDoel();
  const gewone = useGewoneMaaltijden();
  const dagen = useDagboekDagen();
  const vandaag = todayInAgendaTimezone();

  const heeftPatroon = useMemo(() => {
    if (!dagen) return false;
    const regel = buildDagboekWinstRegel(dagen, vandaag, normen, { gewone, richting, eiwitDoelG });
    return regel !== null && regel.kind !== "te_weinig";
  }, [dagen, vandaag, normen, gewone, richting, eiwitDoelG]);

  const status = useMemo(
    () => (dagen ? buildDagStatus(dagen, vandaag, gewone) : null),
    [dagen, vandaag, gewone],
  );

  const patroonKnop = (
    <Link
      href={PATROON_HREF}
      onClick={(event) => {
        event.preventDefault();
        trackEvent("dashboard_kompas_context_click", { zone: "winst_stap", domain: "voeding", doel: "patroon" });
        clarityTag("dashboard_kompas_context", "winst_stap_patroon");
        gaNaarDashboard(PATROON_HREF);
      }}
      className={KNOP_KLASSE}
    >
      Bekijk je patroon <Icons.ArrowRight s={13} />
    </Link>
  );

  if (domainScreenOpen) {
    if (heeftPatroon) return patroonKnop;
    return (
      <button
        type="button"
        onClick={() => {
          trackEvent("dashboard_kompas_context_click", { zone: "winst_stap", domain: "voeding", doel: "dagboek" });
          clarityTag("dashboard_kompas_context", "winst_stap_voeding");
          gaNaarDashboard(DAGBOEK_HREF);
        }}
        className={KNOP_KLASSE}
      >
        Log je maaltijd van vandaag <Icons.ArrowRight s={13} />
      </button>
    );
  }

  if (!status) return null;

  const volgende = status.open[0];
  const dagLijn = status.compleet
    ? "Vandaag staat alles erop."
    : status.gelogd.length > 0
      ? `Vandaag gelogd: ${opsomming(status.gelogd)}. Nog open: ${opsomming(status.open)}.`
      : `Vandaag nog niets gelogd. Open: ${opsomming(status.open)}.`;

  return (
    <div data-testid="kompas-dagstatus">
      <p className="m-0 mt-2.5 text-[11.5px] leading-snug text-[#C9D4CC] text-pretty">{dagLijn}</p>
      {volgende ? (
        <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_kompas_context_click", { zone: "dagstatus_voeg_toe", domain: "voeding", moment: volgende });
            clarityTag("dashboard_kompas_context", "dagstatus_voeg_toe");
            gaNaarDashboard(buildDagboekZoekHref("alle", volgende));
          }}
          className={KNOP_KLASSE}
        >
          Voeg toe bij {volgende} <Icons.ArrowRight s={13} />
        </button>
      ) : heeftPatroon ? (
        patroonKnop
      ) : null}
    </div>
  );
}
