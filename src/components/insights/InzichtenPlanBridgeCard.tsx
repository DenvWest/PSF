"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type InzichtenPlanBridgeCardProps = {
  stepTitle: string;
  planHref: string;
  priorityPillarId: PillarId;
};

export default function InzichtenPlanBridgeCard({
  stepTitle,
  planHref,
  priorityPillarId,
}: InzichtenPlanBridgeCardProps) {
  return (
    <article className="rounded-[18px] border border-[#E7E5E4] bg-white p-5 md:p-6">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
        Uit jouw check
      </p>
      <h2 className="mt-2 font-display text-[22px] font-normal text-stone-900">
        Verder met je leefstijlplan
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Volgende stap: {stepTitle}
      </p>
      <Link
        href={planHref}
        onClick={() =>
          trackEvent("focus_area_click", {
            pillar: priorityPillarId,
            destination: "inzichten_plan_bridge",
          })
        }
        className="mt-4 inline-flex text-sm font-semibold text-stone-800 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-950 hover:decoration-stone-500"
      >
        Ga naar je plan →
      </Link>
    </article>
  );
}
