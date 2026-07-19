"use client";

import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { emitGuideSleepAnalysisEvent } from "@/lib/guide-sleep-analysis-events";
import type { SleepActionableKey } from "@/data/sleep-checkin";

type SleepDashboardCtaProps = {
  focusLabel: string | null;
  focusDimension: SleepActionableKey | null;
  source: "sleep_checkin" | "sleep_analysis";
  loginHref?: string;
  eventMode?: "intake" | "guide";
};

export default function SleepDashboardCta({
  focusLabel,
  focusDimension,
  source,
  loginHref = "/account/login?from=intake",
  eventMode = "intake",
}: SleepDashboardCtaProps) {
  function handleClick() {
    const payload = {
      source,
      focus_pillar: focusDimension ?? "maintenance",
    };
    trackEvent("dashboard_cta_clicked", payload);
    clarityTag("sleep_dashboard_cta", source);
    if (eventMode === "guide") {
      emitGuideSleepAnalysisEvent("dashboard.cta.clicked", payload);
    } else {
      emitIntakeClientEvent("dashboard.cta.clicked", payload);
    }
  }

  return (
    <section
      className="mt-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10 px-5 py-5"
      aria-labelledby="sleep-dashboard-cta-heading"
    >
      <h2
        id="sleep-dashboard-cta-heading"
        className="font-serif text-xl font-normal text-intake-ink"
      >
        {focusLabel
          ? `Je belangrijkste verbeterpunt: ${focusLabel}`
          : "Houd je slaapwinst vast"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-intake-ink-muted">
        Maak gratis je dashboard aan om je voortgang zelf bij te houden, wekelijks te meten en
        persoonlijke acties te ontvangen — zodat je zelf de regie houdt over je slaap.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-intake-ink-muted">
        <li>Persoonlijk slaapprofiel (Inslapen, Doorslapen, Regelmaat, Uitgerust wakker)</li>
        <li>Slaapscore en trend over weken</li>
        <li>Actief slaapplan met vinkbare stappen</li>
        <li>Koppeling met stress, voeding en beweging (Leefstijlcheck)</li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-intake-ink-muted">
        Zo houd je zelf de regie — en breid je dashboard later uit met diepere, gekoppelde inzichten.
      </p>
      <Link
        href={loginHref}
        onClick={handleClick}
        className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-intake-terra px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-intake-terra/90"
      >
        Maak gratis je dashboard aan →
      </Link>
    </section>
  );
}
