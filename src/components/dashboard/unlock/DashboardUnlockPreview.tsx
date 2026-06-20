"use client";

import PriorityLadder, { LADDER_ROW_H } from "@/components/app/PriorityLadder";
import VitalityRing from "@/components/app/VitalityRing";
import { Lock } from "@/components/app/icons";
import {
  DASHBOARD_UNLOCK_LOCKED_FEATURES,
  DASHBOARD_UNLOCK_PREVIEW,
} from "@/data/dashboard-unlock";
import { DASHBOARD_TABS, PILLARS } from "@/data/dashboard";
import { REVEAL_CARD_SHADOW } from "@/lib/results-reveal-copy";

const previewLadder = [...PILLARS].sort(
  (a, b) =>
    DASHBOARD_UNLOCK_PREVIEW.scores[a.id] -
    DASHBOARD_UNLOCK_PREVIEW.scores[b.id],
);

export default function DashboardUnlockPreview() {
  return (
    <section aria-labelledby="dashboard-unlock-preview-heading">
      <h2 id="dashboard-unlock-preview-heading" className="sr-only">
        Dashboard preview
      </h2>
      <article
        className="overflow-hidden rounded-3xl border border-[rgba(90,143,106,0.28)] bg-[var(--panel)]"
        style={{ boxShadow: REVEAL_CARD_SHADOW }}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Jouw dashboard
          </p>
          <p
            className="mt-0.5 text-lg text-[var(--text)]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            Zo blijft je overzicht bewaard
          </p>
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[rgba(90,143,106,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-5">
            <VitalityRing
              value={DASHBOARD_UNLOCK_PREVIEW.vitality}
              size={140}
              stroke={12}
            />
            <span
              className="inline-flex items-center rounded-full border border-[rgba(90,143,106,0.32)] bg-[rgba(90,143,106,0.16)] px-3.5 py-1.5 text-lg text-[var(--text)]"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              {DASHBOARD_UNLOCK_PREVIEW.profileName}
            </span>
            <p className="text-center text-[13px] leading-snug text-[var(--text-subtle)]">
              {DASHBOARD_UNLOCK_PREVIEW.firstStepTitle} —{" "}
              {DASHBOARD_UNLOCK_PREVIEW.firstStepDetail}
            </p>
          </div>

          <div className="overflow-x-auto pb-1">
            <nav
              aria-label="Dashboard tabbladen"
              className="flex min-w-max gap-1"
            >
              {DASHBOARD_TABS.map((tab, index) => (
                <span
                  key={tab.id}
                  className={`rounded-t-lg px-3 py-2 text-xs font-medium ${
                    index === 0
                      ? "bg-[rgba(255,255,255,0.08)] text-[var(--text)]"
                      : "text-[var(--text-subtle)]"
                  }`}
                >
                  {tab.label}
                </span>
              ))}
            </nav>
          </div>

          <div
            className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-2"
            style={{ boxShadow: REVEAL_CARD_SHADOW }}
          >
            <header className="flex items-end justify-between gap-3 px-3 pb-1 pt-2">
              <h3
                className="m-0 text-xl text-[var(--text)]"
                style={{ fontFamily: "var(--f-serif)", fontWeight: 400 }}
              >
                Waar je begint
              </h3>
              <span className="text-xs text-[var(--text-subtle)]">
                Zwakste pijler bovenaan
              </span>
            </header>
            <div style={{ height: previewLadder.length * LADDER_ROW_H }}>
              <PriorityLadder
                ladder={previewLadder}
                scores={DASHBOARD_UNLOCK_PREVIEW.scores}
                focusRowHref="/account/login"
                focusRowAriaLabel="Bewaar dit en volg je voortgang"
              />
            </div>
          </div>

          <ul className="space-y-2" aria-label="Vergrendelde functies">
            {DASHBOARD_UNLOCK_LOCKED_FEATURES.map((feature) => (
              <li
                key={feature.tab}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5"
              >
                <span className="mt-0.5 text-[var(--terra)]" aria-hidden>
                  <Lock s={14} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--sage)]">
                    {feature.tab}
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
                    {feature.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
