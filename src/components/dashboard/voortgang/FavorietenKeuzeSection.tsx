"use client";

import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import { PILLAR } from "@/data/dashboard";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type FavorietenKeuzeSectionProps = {
  model: DashboardModel;
  data?: DashboardData;
  onWijzigFocus?: () => void;
};

export default function FavorietenKeuzeSection({
  model,
  data,
  onWijzigFocus,
}: FavorietenKeuzeSectionProps) {
  const userChosen =
    model.priorityIsUserChosen || data?.priorityPref?.source === "user_selected";
  const focusPillar = model.priority;
  const suggestedPillar = model.enginePriority;

  return (
    <section aria-label="Jouw keuze" style={{ marginBottom: 24 }}>
      <VoortgangSectionHeader eyebrow="Jouw keuze" title="Waar jij nu aan werkt" />

      {userChosen ? (
        <Card pad={16}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }} aria-hidden>
              {pillarEmoji(focusPillar.id)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 18,
                  color: "var(--text)",
                  lineHeight: 1.25,
                }}
              >
                {focusPillar.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 3,
                  lineHeight: 1.45,
                  textWrap: "pretty",
                }}
              >
                Zelf gekozen als focus
              </div>
            </div>
            {onWijzigFocus ? (
              <button
                type="button"
                onClick={onWijzigFocus}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--sage)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Wijzig
                <Icons.ChevronRight s={14} />
              </button>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card pad={16}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            Je hebt nog geen focus gekozen. Het Kompas stelt{" "}
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>
              {PILLAR[suggestedPillar.id]?.label ?? suggestedPillar.label}
            </strong>{" "}
            voor.
          </p>
        </Card>
      )}
    </section>
  );
}

function pillarEmoji(pillarId: string): string {
  switch (pillarId) {
    case "slaap":
      return "🌙";
    case "stress":
      return "🌬️";
    case "voeding":
      return "🥗";
    case "beweging":
      return "🏃";
    case "verbinding":
      return "🤝";
    case "energie":
      return "⚡";
    case "herstel":
      return "🔄";
    default:
      return "🎯";
  }
}
