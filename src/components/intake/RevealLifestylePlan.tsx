"use client";

import { Leaf } from "@/components/app/icons";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealLifestyleItem } from "@/lib/reveal-model";

type RevealLifestylePlanProps = {
  items: RevealLifestyleItem[];
};

const ROLE_LABEL: Record<RevealLifestyleItem["role"], string> = {
  prioriteit: REVEAL_COPY.lifestyleRolePrioriteit,
  kracht: REVEAL_COPY.lifestyleRoleKracht,
};

export default function RevealLifestylePlan({ items }: RevealLifestylePlanProps) {
  return (
    <section aria-label="Je leefstijlplan">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
            {REVEAL_COPY.planEyebrow}
          </p>
          <h2 className="mt-1 font-serif text-xl text-intake-ink">{REVEAL_COPY.planTitle}</h2>
        </div>
      </header>
      <article
        className="rounded-3xl border p-5 lg:p-6"
        style={{
          background: "var(--panel, rgba(255,255,255,0.05))",
          borderColor: "rgba(90,143,106,0.26)",
          boxShadow: "0 0 0 1px rgba(90,143,106,0.06)",
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-intake-sage/30 bg-intake-sage/15 text-intake-sage">
              <Leaf s={17} />
            </span>
            <span className="text-[13px] font-semibold text-intake-ink">
              {REVEAL_COPY.lifestyleTrack}
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-intake-ink-subtle">
            {REVEAL_COPY.lifestyleWinLabel}
          </span>
        </div>
        <ul className="divide-y divide-intake-divider">
          {items.map((item) => (
            <li key={item.pillar.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
              <span
                className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-intake-divider text-[10px] font-semibold text-intake-ink-subtle"
                aria-hidden
              >
                ·
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-intake-ink">{item.win.title}</h3>
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                    style={{
                      color: item.pillar.color,
                      background: `${item.pillar.color}1f`,
                      borderColor: `${item.pillar.color}33`,
                    }}
                  >
                    {item.pillar.label}
                  </span>
                  <span className="text-[11px] text-intake-ink-subtle">
                    {ROLE_LABEL[item.role]}
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-intake-ink-muted">
                  {item.win.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
