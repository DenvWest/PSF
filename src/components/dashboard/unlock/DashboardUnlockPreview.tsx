"use client";

import Link from "next/link";
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

const MOBILE_LADDER_COUNT = 3;

export default function DashboardUnlockPreview() {
  const mobileLadder = previewLadder.slice(0, MOBILE_LADDER_COUNT);
  const focusPillar = previewLadder[0];

  return (
    <section aria-labelledby="dashboard-unlock-preview-heading">
      <h2 id="dashboard-unlock-preview-heading" className="sr-only">
        Dashboard preview
      </h2>
      <article
        className="overflow-hidden rounded-2xl border border-[rgba(90,143,106,0.28)] bg-[var(--panel)] sm:rounded-3xl"
        style={{ boxShadow: REVEAL_CARD_SHADOW }}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Jouw dashboard
          </p>
          <p
            className="mt-0.5 text-base text-[var(--text)] sm:text-lg"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            Zo blijft je overzicht bewaard
          </p>
        </div>

        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:p-5">
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-[rgba(90,143,106,0.22)] bg-[rgba(255,255,255,0.03)] px-3 py-3.5 sm:gap-3 sm:px-4 sm:py-5">
            <div className="sm:hidden">
              <VitalityRing
                value={DASHBOARD_UNLOCK_PREVIEW.vitality}
                size={100}
                stroke={10}
              />
            </div>
            <div className="hidden sm:block">
              <VitalityRing
                value={DASHBOARD_UNLOCK_PREVIEW.vitality}
                size={120}
                stroke={11}
              />
            </div>
            <p
              className="text-center text-sm leading-snug text-[var(--text)] sm:text-[15px]"
              style={{ textWrap: "pretty" }}
            >
              {DASHBOARD_UNLOCK_PREVIEW.focusLine}
            </p>
            <Link
              href={DASHBOARD_UNLOCK_PREVIEW.focusPillarHref}
              className="inline-flex items-center rounded-full border border-[rgba(90,143,106,0.32)] bg-[rgba(90,143,106,0.16)] px-3 py-1 text-base text-[var(--text)] no-underline sm:px-3.5 sm:py-1.5 sm:text-lg"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              Lees over {DASHBOARD_UNLOCK_PREVIEW.focusPillarLabel.toLowerCase()} →
            </Link>
            <p className="text-center text-xs leading-snug text-[var(--text-subtle)] sm:text-[13px]">
              {DASHBOARD_UNLOCK_PREVIEW.firstStepTitle} —{" "}
              {DASHBOARD_UNLOCK_PREVIEW.firstStepDetail}
            </p>
          </div>

          {/* Mobiel: één actieve tab */}
          <div className="md:hidden">
            <span className="inline-flex rounded-lg bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium text-[var(--text)]">
              {DASHBOARD_TABS[0]?.label}
            </span>
            <span className="ml-2 text-[11px] text-[var(--text-subtle)]">
              + {DASHBOARD_TABS.length - 1} tabbladen na login
            </span>
          </div>

          {/* Desktop: tab strip */}
          <div className="hidden overflow-x-auto pb-1 md:block">
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
            className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-1.5 sm:p-2"
            style={{ boxShadow: REVEAL_CARD_SHADOW }}
          >
            <header className="flex flex-col gap-0.5 px-2 pb-1 pt-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:px-3 sm:pt-2">
              <h3
                className="m-0 text-base text-[var(--text)] sm:text-xl"
                style={{ fontFamily: "var(--f-serif)", fontWeight: 400 }}
              >
                Waar je begint
              </h3>
              <span className="text-[11px] text-[var(--text-subtle)]">
                {focusPillar ? (
                  <>
                    Focus:{" "}
                    <span style={{ color: focusPillar.color }}>
                      {focusPillar.label}
                    </span>
                  </>
                ) : (
                  "Zwakste pijler bovenaan"
                )}
              </span>
            </header>

            {/* Mobiel: top 3 pijlers */}
            <div
              className="md:hidden"
              style={{ height: mobileLadder.length * LADDER_ROW_H }}
            >
              <PriorityLadder
                ladder={mobileLadder}
                scores={DASHBOARD_UNLOCK_PREVIEW.scores}
                focusRowHref="/account/login"
                focusRowAriaLabel="Bewaar dit en volg je voortgang"
              />
            </div>
            <p className="px-2 pb-1 text-[11px] text-[var(--text-subtle)] md:hidden">
              + {previewLadder.length - MOBILE_LADDER_COUNT} pijlers in je
              volledige ladder
            </p>

            {/* Desktop: volledige ladder */}
            <div
              className="hidden md:block"
              style={{ height: previewLadder.length * LADDER_ROW_H }}
            >
              <PriorityLadder
                ladder={previewLadder}
                scores={DASHBOARD_UNLOCK_PREVIEW.scores}
                focusRowHref="/account/login"
                focusRowAriaLabel="Bewaar dit en volg je voortgang"
              />
            </div>
          </div>

          {/* Mobiel: compacte lock-samenvatting */}
          <p className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-[var(--text-subtle)] md:hidden">
            <span className="mt-0.5 shrink-0 text-[var(--terra)]" aria-hidden>
              <Lock s={14} />
            </span>
            <span>
              Na login: voortgang, check-ins en hermeting — alles op één plek.
            </span>
          </p>

          {/* Desktop: lock-rijen */}
          <ul className="hidden space-y-2 md:block" aria-label="Vergrendelde functies">
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
