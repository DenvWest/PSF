"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  MOVEMENT_LOG_MODALITIES,
  type MovementModalityId,
} from "@/data/movement/log-modalities";
import type { MovementWeekSummary } from "@/lib/movement-session-log";

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
    <CockpitTile eyebrow="Wat je noteerde" ariaLabel="Bewegingslog">
      <p className="mt-2 font-serif text-[19px] text-[#F1EFE8]">Jouw beweeglog</p>

      {hasVolume ? (
        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="font-serif text-[24px] tabular-nums text-[#F1EFE8]">
            {summary?.totalMinutes} min
          </span>
          <span className="text-[13px] text-[#9FB0A6]">
            deze week · {summary?.sessionCount}{" "}
            {summary?.sessionCount === 1 ? "sessie" : "sessies"}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {loaded
            ? "Nog niets genoteerd deze week. Kies een vorm en log je eerste sessie — 2 minuten."
            : "Je beweeglog wordt geladen…"}
        </p>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-[13.5px] ${
                active
                  ? "border-[#5A8F6A] bg-[#5A8F6A]/15 font-semibold text-[#5A8F6A]"
                  : "border-white/10 bg-black/25 font-medium text-[#F1EFE8]"
              }`}
            >
              <span aria-hidden className="text-[16px]">
                {modality.icon}
              </span>
              {modality.label}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {MINUTE_PRESETS.map((preset) => {
              const active = minutes === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMinutes(preset)}
                  className={`cursor-pointer rounded-xl border px-3.5 py-2 text-[13.5px] tabular-nums ${
                    active
                      ? "border-[#5A8F6A] bg-[#5A8F6A]/15 font-semibold text-[#5A8F6A]"
                      : "border-white/10 bg-black/25 font-medium text-[#F1EFE8]"
                  }`}
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
              className="w-[72px] rounded-xl border border-white/10 bg-black/25 px-2.5 py-2 text-[13.5px] tabular-nums text-[#F1EFE8] placeholder:text-[#7E8C82]"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!minutes || saving}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#5A8F6A] px-4 text-[14.5px] font-semibold text-[#0f1c10] disabled:cursor-default disabled:opacity-50"
          >
            {saving ? "Opslaan…" : "Sessie loggen"}
          </button>
          <p className="text-[11.5px] leading-snug text-[#7E8C82]">
            Op basis van wat jij noteert — dit voedt je lijn, geen score.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2.5 text-[12.5px] text-[#f87171]">{error}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <Icons.BookOpen s={13} style={{ color: "#5A8F6A", flexShrink: 0 }} />
        <span className="text-[12px] leading-snug text-[#9FB0A6]">
          Meer over de vormen?{" "}
          <Link
            href="/onderbouwing#MOV_CARD"
            className="font-semibold text-[#5A8F6A] no-underline"
          >
            Lees de onderbouwing
          </Link>
        </span>
      </div>
    </CockpitTile>
  );
}
