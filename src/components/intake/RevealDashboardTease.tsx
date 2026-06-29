"use client";

import type { CSSProperties } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { getVitalityBand } from "@/lib/vitality-gauge";
import { REVEAL_COPY, REVEAL_DASHBOARD_TEASE_TABS } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealDashboardTeaseProps = {
  model: RevealModel;
};

export default function RevealDashboardTease({ model }: RevealDashboardTeaseProps) {
  const band = getVitalityBand(model.vitality);
  const focusScore = model.scores[model.priority.id];

  return (
    <div className="reveal-path-dashboard">
      <p className="reveal-path-dashboard__lead">{REVEAL_COPY.dashboardTeaseLead}</p>

      <div className="reveal-path-dashboard__preview" aria-hidden>
        <div className="reveal-path-dashboard__mini">
          <div className="reveal-path-dashboard__mini-gauge">
            <VitalityGauge
              value={model.vitality}
              size={88}
              stroke={9}
              variant="hero"
              theme="dark"
              tone="dark"
              showBandLabel={false}
            />
          </div>
          <div className="reveal-path-dashboard__mini-copy">
            <span
              className="reveal-path-dashboard__mini-band"
              style={{ "--tease-band-color": band.color } as CSSProperties}
            >
              {band.label}
            </span>
            <p className="reveal-path-dashboard__mini-focus">
              Start bij {model.priority.label.toLowerCase()} · {focusScore}
            </p>
          </div>
        </div>

        <ul className="reveal-path-dashboard__tabs">
          {REVEAL_DASHBOARD_TEASE_TABS.map((tab, index) => (
            <li
              key={tab.label}
              className={`reveal-path-dashboard__tab${index === 0 ? " reveal-path-dashboard__tab--active" : ""}`}
            >
              <span className="reveal-path-dashboard__tab-label">{tab.label}</span>
              <span className="reveal-path-dashboard__tab-desc">{tab.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
