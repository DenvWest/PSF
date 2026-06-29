"use client";

import type { CSSProperties } from "react";
import VitalityRing from "@/components/app/VitalityRing";
import { DASHBOARD_TABS } from "@/data/dashboard";
import { getVitalityBand } from "@/lib/vitality-gauge";
import {
  REVEAL_COPY,
  REVEAL_DASHBOARD_WINS,
} from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

const PREVIEW_TAB_IDS = new Set(["vandaag", "voortgang", "hermeting"]);

type RevealDashboardTeaseProps = {
  model: RevealModel;
};

export default function RevealDashboardTease({ model }: RevealDashboardTeaseProps) {
  const band = getVitalityBand(model.vitality);
  const previewTabs = DASHBOARD_TABS.filter((tab) => PREVIEW_TAB_IDS.has(tab.id));

  return (
    <div className="reveal-path-dashboard">
      <p className="reveal-path-dashboard__lead">{REVEAL_COPY.dashboardTeaseLead}</p>

      <article
        className="reveal-dashboard-mock"
        aria-label="Voorbeeld van je dashboard"
      >
        <header className="reveal-dashboard-mock__chrome">
          <p className="reveal-dashboard-mock__chrome-label">{REVEAL_COPY.dashboardMockLabel}</p>
        </header>

        <nav className="reveal-dashboard-mock__tabs" aria-label="Dashboard tabbladen">
          {previewTabs.map((tab, index) => (
            <span
              key={tab.id}
              className={`reveal-dashboard-mock__tab${index === 0 ? " reveal-dashboard-mock__tab--active" : ""}`}
            >
              {tab.label}
            </span>
          ))}
        </nav>

        <div className="reveal-dashboard-mock__body">
          <div className="reveal-dashboard-mock__ring-zone">
            <div className="reveal-dashboard-mock__ring-glow" aria-hidden />
            <VitalityRing value={model.vitality} size={120} stroke={10} />
            <div className="reveal-dashboard-mock__ring-meta">
              <span
                className="reveal-dashboard-mock__band"
                style={{ "--mock-band-color": band.color } as CSSProperties}
              >
                {band.label}
              </span>
              <span className="reveal-dashboard-mock__score-total">
                {Math.round(model.vitality)}/100
              </span>
            </div>
          </div>

          <ul className="reveal-dashboard-mock__scores" aria-label="Prioriteiten in je dashboard">
            {model.topLadder.map((pillar, index) => {
              const score = model.scores[pillar.id];
              return (
                <li
                  key={pillar.id}
                  className={`reveal-dashboard-mock__score-row${index === 0 ? " reveal-dashboard-mock__score-row--start" : ""}`}
                >
                  <div className="reveal-dashboard-mock__score-head">
                    <span className="reveal-dashboard-mock__score-label">{pillar.label}</span>
                    {index === 0 ? (
                      <span className="reveal-dashboard-mock__score-hint">
                        {REVEAL_COPY.dashboardScoreStartHint}
                      </span>
                    ) : null}
                    <span className="reveal-dashboard-mock__score-value">{score}</span>
                  </div>
                  <div className="reveal-dashboard-mock__score-track" aria-hidden>
                    <span
                      className="reveal-dashboard-mock__score-fill"
                      style={
                        {
                          width: `${Math.max(4, Math.min(100, score))}%`,
                          "--score-fill-color": pillar.color,
                        } as CSSProperties
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <ul className="reveal-dashboard-mock__wins" aria-label="Wat je wint met je dashboard">
            {REVEAL_DASHBOARD_WINS.map((win) => (
              <li key={win} className="reveal-dashboard-mock__win">
                <span className="reveal-dashboard-mock__win-mark" aria-hidden>
                  ✓
                </span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
