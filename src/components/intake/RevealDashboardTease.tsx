"use client";

import RevealPriorityBars from "@/components/intake/RevealPriorityBars";
import RevealVitalityInstrument from "@/components/intake/RevealVitalityInstrument";
import { DASHBOARD_TABS } from "@/data/dashboard";
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

        <div className="reveal-dashboard-mock__tabs-scroll">
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
        </div>

        <div className="reveal-dashboard-mock__body">
          <div className="reveal-dashboard-mock__gauge-zone">
            <RevealVitalityInstrument value={model.vitality} variant="compact" />
          </div>

          <RevealPriorityBars
            ladder={model.topLadder}
            scores={model.scores}
            startHint={REVEAL_COPY.dashboardScoreStartHint}
            ariaLabel="Prioriteiten in je dashboard"
            compact
          />

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
