"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type PersonalPathBridgeProps = {
  priorityLabel?: string;
  priorityPillarId?: PillarId;
};

export default function PersonalPathBridge({
  priorityLabel,
  priorityPillarId,
}: PersonalPathBridgeProps) {
  const hasContext = Boolean(priorityLabel && priorityPillarId);

  return (
    <aside
      aria-label="Persoonlijk spoor"
      className="rounded-[26px] border border-white/[0.07] bg-[#0E1A14] p-7 text-[#F7F5F0] shadow-[0_30px_60px_-30px_rgba(14,26,20,0.6)]"
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#9DB3A6]">
        Persoonlijk spoor
      </p>
      <p className="mt-5 text-[13.5px] leading-[1.55] text-[#9DB3A6]">
        {hasContext ? (
          <>
            Je prioriteit ligt bij {priorityLabel!.toLowerCase()}. Je volledige
            scores en trend zie je in je dashboard.
          </>
        ) : (
          <>
            Wil je weten waar jij staat op slaap, stress en energie? Je zes
            scores en aanbevelingen wonen in je dashboard — niet op deze pagina.
          </>
        )}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {hasContext ? (
          <>
            <Link
              href="/dashboard"
              onClick={() =>
                trackEvent("inzichten_hub_cta_click", {
                  destination: "dashboard",
                })
              }
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[rgba(90,143,106,0.4)] bg-[rgba(90,143,106,0.14)] px-4 py-2.5 text-sm font-semibold text-[#9FD0AE] transition hover:bg-[rgba(90,143,106,0.24)]"
            >
              Naar mijn dashboard →
            </Link>
            <Link
              href={`/inzichten?pijler=${priorityPillarId}`}
              onClick={() =>
                trackEvent("inzichten_hub_cta_click", { destination: "feed" })
              }
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[#C7D6CC] transition hover:border-white/20 hover:text-[#F7F5F0]"
            >
              {priorityLabel}-inzichten →
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/intake"
              onClick={() =>
                trackEvent("inzichten_hub_cta_click", { destination: "intake" })
              }
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[rgba(90,143,106,0.4)] bg-[rgba(90,143,106,0.14)] px-4 py-2.5 text-sm font-semibold text-[#9FD0AE] transition hover:bg-[rgba(90,143,106,0.24)]"
            >
              Doe de Leefstijlcheck →
            </Link>
            <Link
              href="/dashboard"
              onClick={() =>
                trackEvent("inzichten_hub_cta_click", {
                  destination: "dashboard",
                })
              }
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[#C7D6CC] transition hover:border-white/20 hover:text-[#F7F5F0]"
            >
              Naar mijn dashboard →
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
