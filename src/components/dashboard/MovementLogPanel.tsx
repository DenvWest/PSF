"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  MOVEMENT_LOG_MODALITIES,
  type MovementModalityId,
} from "@/data/movement/log-modalities";
import type { MovementWeekSummary } from "@/lib/movement-session-log";

const LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

const MINUTE_PRESETS = [15, 30, 45, 60];

export default function MovementLogPanel() {
  const [summary, setSummary] = useState<MovementWeekSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<MovementModalityId | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true;
      trackEvent("dashboard_beweging_log_shown", { surface: "kompas_beweging" });
      clarityTag("dashboard_beweging_log", "shown");
    }
    let active = true;
    void fetch("/api/account/movement-log", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setSummary(data as MovementWeekSummary);
        }
      })
      .catch(() => {
        /* niet-blokkerend */
      })
      .finally(() => {
        if (active) {
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (!selected || !minutes || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/movement-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ modalityId: selected, minutes }),
      });
      if (!res.ok) {
        setError("Opslaan lukte niet. Probeer het zo nog eens.");
        return;
      }
      const data = (await res.json()) as MovementWeekSummary;
      setSummary(data);
      setSelected(null);
      setMinutes(null);
      trackEvent("dashboard_beweging_session_logged", {
        modality_id: selected,
        surface: "kompas_beweging",
      });
      clarityTag("dashboard_beweging_session_logged", selected);
    } catch {
      setError("Opslaan lukte niet. Probeer het zo nog eens.");
    } finally {
      setSaving(false);
    }
  };

  const hasVolume = (summary?.totalMinutes ?? 0) > 0;

  return (
    <section aria-label="Bewegingslog">
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: LIGHT.subtle,
            marginBottom: 6,
          }}
        >
          Wat je noteerde
        </div>
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 19,
            color: LIGHT.text,
            lineHeight: 1.15,
          }}
        >
          Jouw beweeglog
        </div>
      </div>

      <Card pad={16} surface="light">
        {hasVolume ? (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 24,
                color: LIGHT.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {summary?.totalMinutes} min
            </span>
            <span style={{ fontSize: 13, color: LIGHT.muted }}>
              deze week · {summary?.sessionCount}{" "}
              {summary?.sessionCount === 1 ? "sessie" : "sessies"}
            </span>
          </div>
        ) : (
          <p
            style={{
              fontSize: 13.5,
              color: LIGHT.muted,
              lineHeight: 1.5,
              margin: "0 0 14px",
              textWrap: "pretty",
            }}
          >
            {loaded
              ? "Nog niets genoteerd deze week. Kies een vorm en log je eerste sessie — 2 minuten."
              : "Je beweeglog wordt geladen…"}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: selected ? 14 : 0,
            scrollbarWidth: "none",
          }}
        >
          {MOVEMENT_LOG_MODALITIES.map((modality) => {
            const active = selected === modality.id;
            return (
              <button
                key={modality.id}
                type="button"
                onClick={() => {
                  setSelected(active ? null : modality.id);
                  setError(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: `1px solid ${active ? "var(--sage)" : LIGHT.innerBorder}`,
                  background: active ? "rgba(90,143,106,0.12)" : LIGHT.innerBg,
                  color: active ? "var(--sage)" : LIGHT.text,
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <span aria-hidden style={{ fontSize: 16 }}>
                  {modality.icon}
                </span>
                {modality.label}
              </button>
            );
          })}
        </div>

        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MINUTE_PRESETS.map((preset) => {
                const active = minutes === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMinutes(preset)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 12,
                      border: `1px solid ${active ? "var(--sage)" : LIGHT.innerBorder}`,
                      background: active ? "rgba(90,143,106,0.12)" : "#fff",
                      color: active ? "var(--sage)" : LIGHT.text,
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {preset} min
                  </button>
                );
              })}
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                value={minutes ?? ""}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setMinutes(Number.isFinite(value) && value > 0 ? Math.round(value) : null);
                }}
                placeholder="min"
                aria-label="Aantal minuten"
                style={{
                  width: 72,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: `1px solid ${LIGHT.innerBorder}`,
                  background: "#fff",
                  color: LIGHT.text,
                  fontSize: 13.5,
                  fontVariantNumeric: "tabular-nums",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!minutes || saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: !minutes || saving ? "rgba(90,143,106,0.4)" : "var(--sage)",
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: !minutes || saving ? "default" : "pointer",
              }}
            >
              {saving ? "Opslaan…" : "Sessie loggen"}
            </button>
            <p
              style={{
                fontSize: 11.5,
                color: LIGHT.subtle,
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              Op basis van wat jij noteert — dit voedt je lijn, geen score.
            </p>
          </div>
        ) : null}

        {error ? (
          <p style={{ fontSize: 12.5, color: "#b91c1c", margin: "10px 0 0" }}>{error}</p>
        ) : null}
      </Card>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <Icons.BookOpen s={13} style={{ color: "var(--sage)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: LIGHT.muted, lineHeight: 1.5 }}>
          Meer over de vormen?{" "}
          <Link
            href="/onderbouwing#MOV_CARD"
            style={{ color: "var(--sage)", fontWeight: 600, textDecoration: "none" }}
          >
            Lees de onderbouwing
          </Link>
        </span>
      </div>
    </section>
  );
}
