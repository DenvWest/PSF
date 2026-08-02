"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import {
  getMovementAnchorOption,
  MOVEMENT_ANCHOR_OPTIONS,
  type MovementAnchor,
  type MovementPrefs,
} from "@/lib/movement-prefs";

const SURFACE = "kompas_beweging";

type MovementAnchorRechooseProps = {
  currentAnchor: MovementAnchor;
  onSaved: (prefs: MovementPrefs) => void;
  compact?: boolean;
};

/**
 * Stille escape hatch (§Future You): anker opnieuw kiezen zonder het tot
 * dagelijkse keuze te maken. Alleen zichtbaar wanneer er al een anker staat.
 */
export default function MovementAnchorRechoose({
  currentAnchor,
  onSaved,
  compact = false,
}: MovementAnchorRechooseProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOption = getMovementAnchorOption(currentAnchor);

  const save = async (anchor: MovementAnchor) => {
    if (busy || anchor === currentAnchor) {
      setOpen(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/movement-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ anchor }),
      });
      if (!response.ok) {
        setError("Opslaan lukte niet — probeer het zo nog eens.");
        return;
      }
      const prefs = (await response.json()) as MovementPrefs & { ok: boolean };

      emitIntakeClientEvent("plan.week_category_selected", {
        source: "kompas_beweging_anchor_rechoose",
        category: prefs.startPattern ?? "none",
        anchor,
        previous_anchor: currentAnchor,
      });
      trackEvent("movement_week_category", {
        category: prefs.startPattern ?? "none",
        anchor,
        previous_anchor: currentAnchor,
        surface: SURFACE,
        source: "anchor_rechoose",
      });
      clarityTag("movement_anchor", anchor);

      onSaved({ startPattern: prefs.startPattern, anchor: prefs.anchor });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className={compact ? "mt-2" : "mt-3"}>
        {currentOption ? (
          <p
            className={`leading-relaxed text-[#7E8C82] text-pretty ${compact ? "text-[11px]" : "text-[11.5px]"}`}
          >
            Gekozen: {currentOption.label}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`mt-1.5 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-medium text-[#9FB0A6] transition hover:text-[#C8956C] ${compact ? "text-[11.5px]" : "text-[12px]"}`}
        >
          Dit is niet (meer) wat ik wil
          <Icons.ChevronRight s={12} />
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? "mt-2.5" : "mt-3"}>
      <p
        className={`font-medium text-[#CDD7D0] text-pretty ${compact ? "text-[11.5px]" : "text-[12px]"}`}
      >
        Wat moet bewegen over tien jaar voor je geregeld hebben?
      </p>
      <div className={`flex flex-col ${compact ? "mt-2 gap-1.5" : "mt-2.5 gap-2"}`}>
        {MOVEMENT_ANCHOR_OPTIONS.map((option) => {
          const selected = option.id === currentAnchor;
          return (
            <button
              key={option.id}
              type="button"
              disabled={busy}
              onClick={() => void save(option.id)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition disabled:opacity-60 ${
                selected
                  ? "border-[#5A8F6A]/50 bg-[#5A8F6A]/10"
                  : "border-white/10 bg-black/20 hover:border-white/20"
              }`}
            >
              <span
                className={`min-w-0 flex-1 leading-snug text-pretty ${compact ? "text-[11.5px]" : "text-[12px]"} ${selected ? "text-[#E7EDE8]" : "text-[#CDD7D0]"}`}
              >
                {option.label}
              </span>
              {selected ? (
                <span className="shrink-0 text-[#5A8F6A]">
                  <Icons.Check s={14} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className={`mt-2 text-[#E8A08A] ${compact ? "text-[11px]" : "text-[12px]"}`}>
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className={`mt-2 cursor-pointer border-none bg-transparent p-0 font-medium text-[#9FB0A6] disabled:opacity-60 ${compact ? "text-[11px]" : "text-[12px]"}`}
      >
        Annuleren
      </button>
    </div>
  );
}
