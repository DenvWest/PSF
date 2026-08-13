"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import ConnectionPriorityOverview from "@/components/dashboard/domain/ConnectionPriorityOverview";
import DomainCheckinLink from "@/components/dashboard/domain/DomainCheckinLink";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainHeaderCard from "@/components/dashboard/domain/DomainHeaderCard";
import DomainSectionHeader from "@/components/dashboard/domain/DomainSectionHeader";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel } from "@/types/dashboard";

export default function VerbindingScreen({ model }: { model: DashboardModel }) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.verbinding;

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_verbinding_premium_upsell", { surface: "kompas_verbinding" });
    clarityTag("dashboard_verbinding_premium", "shown");
  }, []);

  return (
    <DomainCockpitShell accent={pillar.color} ariaLabel="Verbinding-cockpit">
      <DomainHeaderCard
        pillar={pillar}
        score={model.scores.verbinding ?? 0}
        eyebrow="Relatie & ritme"
        tagline="Kleine contactmomenten, groot effect op herstel."
      />

      <DomainCheckinLink
        href="/intake?from=dashboard&kompas=verbinding"
        icon={<Icons.User s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Start leefstijlcheck (1 min)"
        onClick={() => {
          trackEvent("dashboard_verbinding_checkin_click", { surface: "kompas_verbinding" });
          clarityTag("dashboard_verbinding_checkin", "click");
        }}
        caption="Aparte verbinding-check volgt binnenkort; je start nu via de leefstijlcheck."
      />

      <section aria-label="Waar loopt het bij jou vast">
        <DomainSectionHeader eyebrow="Leefstijl eerst" title="Waar loopt het bij jou vast?" />
        <div className="flex flex-col gap-3">
          <ConnectionPriorityOverview />
          <Link
            href="/inzichten"
            onClick={() => {
              trackEvent("dashboard_verbinding_leefstijl_click", {
                surface: "kompas_verbinding",
              });
              clarityTag("dashboard_verbinding_leefstijl", "click");
            }}
            className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
          >
            Bekijk leefstijl &amp; inzichten <Icons.ChevronRight s={15} />
          </Link>
        </div>
      </section>

      <KompasBegeleidingLink surface="kompas_verbinding" />
    </DomainCockpitShell>
  );
}
