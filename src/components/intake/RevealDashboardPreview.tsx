"use client";

import Link from "next/link";
import DashboardVisualPreview from "@/components/intake/DashboardVisualPreview";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealDashboardPreviewProps = {
  model: RevealModel;
  open: boolean;
};

export default function RevealDashboardPreview({ model, open }: RevealDashboardPreviewProps) {
  if (!open) {
    return null;
  }

  return (
    <section
      id="dashboard-preview"
      aria-label={REVEAL_COPY.dashboardPreviewSummary}
      className="mb-5 scroll-mt-4 rounded-3xl border border-intake-card-border bg-intake-bg-elevated p-5"
    >
      <h2 className="mb-1 font-serif text-xl text-intake-ink">
        {REVEAL_COPY.dashboardPreviewSummary}
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-intake-ink-muted">
        {REVEAL_COPY.dashboardPreviewIntro}
      </p>

      <DashboardVisualPreview model={model} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-intake-sage">
            {REVEAL_COPY.dashboardPreviewNowTitle}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-intake-ink-muted">
            {REVEAL_COPY.dashboardPreviewNow.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-intake-sage" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
            {REVEAL_COPY.dashboardPreviewLaterTitle}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-intake-ink-muted">
            {REVEAL_COPY.dashboardPreviewLater.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-intake-ink-subtle" aria-hidden>
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-sm text-intake-ink-muted">
        <Link
          href="/hoe-werkt-dashboard"
          className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px]"
        >
          {REVEAL_COPY.dashboardPreviewLink}
        </Link>
      </p>
    </section>
  );
}
