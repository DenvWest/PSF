"use client";

import { Button } from "@/components/app/primitives";
import { PILLAR, PILLARS } from "@/data/dashboard";
import { isInterventionDomain } from "@/lib/domain-role";
import type { PillarId } from "@/types/dashboard";

type AccountFocusPickerProps = {
  pillarId: PillarId | null;
  enginePillarId: PillarId | null;
  busy: boolean;
  onSelect: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

/**
 * "Terug naar advies" wist je opgeslagen keuze zodat je weer dynamisch het
 * advies volgt (ook als dat later verandert) — anders dan model.priorityIsUserChosen
 * (dashboard-model.ts:68) tonen we hem zodra er ÜBERHAUPT een eigen keuze
 * staat, niet alleen wanneer die toevallig van het huidige advies afwijkt:
 * anders is de knop nooit bereikbaar zodra je koos wat het advies toch al was.
 */
export default function AccountFocusPicker({
  pillarId,
  enginePillarId,
  busy,
  onSelect,
  onAcceptEngine,
  onReset,
}: AccountFocusPickerProps) {
  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));
  const effectivePillarId = pillarId ?? enginePillarId;
  const followsAdvice = enginePillarId == null || effectivePillarId === enginePillarId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {interventionPillars.map((pillar) => {
        const isSelected = pillar.id === effectivePillarId;
        const isEngineAdvice = enginePillarId != null && pillar.id === enginePillarId;
        return (
          <button
            key={pillar.id}
            type="button"
            disabled={busy}
            onClick={() => onSelect(pillar.id)}
            style={{
              display: "flex",
              minHeight: 44,
              width: "100%",
              cursor: busy ? "not-allowed" : "pointer",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              borderRadius: 12,
              border: `1px solid ${isSelected ? "var(--sage)" : "var(--panel-border, rgba(22,40,26,0.14))"}`,
              background: isSelected ? "rgba(90,143,106,0.10)" : "transparent",
              padding: "10px 14px",
              textAlign: "left",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden
                style={{
                  height: 8,
                  width: 8,
                  flexShrink: 0,
                  borderRadius: 999,
                  background: pillar.color,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                {pillar.label}
              </span>
            </span>
            {isEngineAdvice ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--sage)",
                }}
              >
                advies
              </span>
            ) : null}
          </button>
        );
      })}

      {enginePillarId != null && !followsAdvice ? (
        <Button variant="primary" size="sm" disabled={busy} onClick={onAcceptEngine}>
          Volg advies → {PILLAR[enginePillarId].label.toLowerCase()}
        </Button>
      ) : null}

      {pillarId != null ? (
        <button
          type="button"
          disabled={busy}
          onClick={onReset}
          style={{
            alignSelf: "flex-start",
            cursor: busy ? "not-allowed" : "pointer",
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--sage)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Terug naar advies
        </button>
      ) : null}
    </div>
  );
}
