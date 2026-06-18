"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import VitalityRing from "@/components/app/VitalityRing";
import { Lock } from "@/components/app/icons";
import * as Icons from "@/components/app/icons";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type DashboardVisualPreviewProps = {
  model: RevealModel;
};

export default function DashboardVisualPreview({ model }: DashboardVisualPreviewProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--panel, rgba(255,255,255,0.05))",
        borderColor: "rgba(90,143,106,0.22)",
        boxShadow: "0 0 0 1px rgba(90,143,106,0.06)",
      }}
    >
      <div className="flex items-center justify-between border-b border-intake-divider px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
          {REVEAL_COPY.dashboardFrameTitle}
        </span>
        <span className="rounded-full border border-intake-divider px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-intake-ink-subtle">
          Preview
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <VitalityRing value={model.vitality} size={92} stroke={9} />
          <div className="min-w-0">
            <p className="font-serif text-lg text-intake-ink">{model.profileName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-intake-ink-subtle">
              <Lock s={12} />
              {REVEAL_COPY.dashboardPreviewLockedLabel}
            </p>
          </div>
        </div>

        <div className="relative">
          <ul className="space-y-2">
            {model.ladder.map((pillar, idx) => {
              const Icon = Icons[pillar.icon as keyof typeof Icons] as ComponentType<{ s?: number }>;
              const score = model.scores[pillar.id];
              const focus = idx === 0;
              const locked = idx >= 3;

              return (
                <li
                  key={pillar.id}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-2"
                  style={{
                    background: focus ? `${pillar.color}1a` : "transparent",
                    opacity: locked ? 0.55 : 1,
                  }}
                >
                  <span
                    className="w-5 text-center font-serif text-sm tabular-nums"
                    style={{ color: focus ? pillar.color : "var(--text-subtle)" }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `${pillar.color}1f`,
                      color: pillar.color,
                      border: `1px solid ${pillar.color}33`,
                    }}
                  >
                    {Icon ? <Icon s={14} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ fontWeight: focus ? 600 : 500, color: "var(--text)" }}
                      >
                        {pillar.label}
                      </span>
                      {focus ? (
                        <span className="text-[10px] font-semibold" style={{ color: pillar.color }}>
                          ← start
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-sm bg-white/10">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${score}%`,
                          background: pillar.color,
                          opacity: focus ? 1 : 0.5,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right font-serif text-base tabular-nums text-intake-ink-muted">
                    {score}
                  </span>
                </li>
              );
            })}
          </ul>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(to top, var(--panel, rgba(26,46,26,0.95)) 0%, transparent 100%)",
            }}
            aria-hidden
          />
        </div>

        <div className="rounded-xl border border-intake-sage/25 bg-intake-sage/10 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-intake-sage">
            {REVEAL_COPY.lifestyleTrack}
          </p>
          <p className="mt-1 text-sm font-medium text-intake-ink">
            {model.lifestyle[0].win.title}
          </p>
        </div>
      </div>
    </div>
  );
}
