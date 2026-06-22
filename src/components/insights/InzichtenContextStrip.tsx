"use client";

import Link from "next/link";
import { useEffect } from "react";
import Container from "@/components/layout/Container";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type InzichtenContextStripProps = {
  priorityPillarId: PillarId;
  priorityLabel: string;
  variant?: "hub" | "feed";
};

export default function InzichtenContextStrip({
  priorityPillarId,
  priorityLabel,
  variant = "hub",
}: InzichtenContextStripProps) {
  useEffect(() => {
    clarityTag("inzichten_layer", "context");
  }, []);

  if (variant === "feed") {
    return (
      <div className="border-b border-[#E7E5E4] bg-[#EEF3EF]/60">
        <Container className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 text-sm">
          <span className="text-stone-600">
            Jouw prioriteit:{" "}
            <span className="font-semibold text-stone-900">{priorityLabel}</span>
          </span>
          <span className="text-stone-300" aria-hidden>
            ·
          </span>
          <Link
            href="/dashboard"
            onClick={() =>
              trackEvent("inzichten_context_strip_click", {
                destination: "dashboard",
                pillar: priorityPillarId,
              })
            }
            className="font-semibold text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]"
          >
            Dashboard →
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <section aria-label="Jouw context" className="pb-4 md:pb-6">
      <Container>
        <div className="rounded-[18px] border border-[#E7E5E4] bg-[#EEF3EF] px-5 py-5 md:px-6 md:py-6">
          <p className="font-display text-lg text-stone-900 md:text-xl">
            Je laagste domein is{" "}
            <span className="text-[#5A8F6A]">{priorityLabel.toLowerCase()}</span>
            {" — "}begin hier
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Op basis van je laatste check-in. Meer detail in je dashboard.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/inzichten?pijler=${priorityPillarId}`}
              onClick={() =>
                trackEvent("inzichten_context_strip_click", {
                  destination: "feed",
                  pillar: priorityPillarId,
                })
              }
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-5 py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
            >
              Bekijk {priorityLabel.toLowerCase()}-inzichten →
            </Link>
            <Link
              href="/dashboard"
              onClick={() =>
                trackEvent("inzichten_context_strip_click", {
                  destination: "dashboard",
                  pillar: priorityPillarId,
                })
              }
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#E7E5E4] bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Open dashboard →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
