"use client";

import { useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { SELECTABLE_AGENDA_CATEGORIES } from "@/data/agenda/categories";
import { isValidLocalTime } from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { AgendaCategoryId } from "@/types/agenda";

type AgendaAddBlockSheetProps = {
  date: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
};

export default function AgendaAddBlockSheet({
  date,
  busy = false,
  onClose,
  onSubmit,
}: AgendaAddBlockSheetProps) {
  const [categoryId, setCategoryId] = useState<AgendaCategoryId>("persoonlijke_routine");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:30");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Geef je moment een titel.");
      return;
    }
    if (!isValidLocalTime(startTime) || !isValidLocalTime(endTime)) {
      setError("Kies een geldig tijdvenster.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    if (startH * 60 + startM >= endH * 60 + endM) {
      setError("Eindtijd moet na starttijd liggen.");
      return;
    }

    setError(null);
    await onSubmit({
      date,
      categoryId,
      title: trimmedTitle,
      startTime,
      endTime,
    });
    trackEvent("agenda_block_created", {
      category_id: categoryId,
      surface: "agenda_add_sheet",
    });
    clarityTag("agenda_block", "created");
    onClose();
  };

  return (
    <div className="mt-4 rounded-[18px] border border-[#e4e0da] bg-[#faf9f7] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="m-0 text-[13px] font-semibold text-[#1c1917]">Nieuw leefstijlmoment</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 cursor-pointer items-center border-none bg-transparent px-2 text-[12px] font-medium text-[#78716c]"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Sluit
        </button>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
        Categorie
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {SELECTABLE_AGENDA_CATEGORIES.map((category) => {
          const Icon = Icons[category.icon as keyof typeof Icons] as ComponentType<{
            s?: number;
            style?: CSSProperties;
          }>;
          const selected = category.id === categoryId;
          return (
            <button
              key={category.id}
              type="button"
              disabled={busy}
              onClick={() => setCategoryId(category.id)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors disabled:opacity-60"
              style={{
                borderColor: selected ? category.color : "#e4e0da",
                background: selected ? `${category.color}14` : "white",
                color: selected ? "#1c1917" : "#78716c",
                fontFamily: "var(--f-sans)",
              }}
            >
              <Icon s={13} style={{ color: category.color }} />
              {category.label}
            </button>
          );
        })}
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
          Titel
        </span>
        <input
          type="text"
          value={title}
          disabled={busy}
          maxLength={120}
          placeholder="Bijv. wandelen na het eten"
          onChange={(event) => setTitle(event.target.value)}
          className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] text-[#1c1917] disabled:opacity-60"
          style={{ fontFamily: "var(--f-sans)" }}
        />
      </label>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label>
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
            Start
          </span>
          <input
            type="time"
            value={startTime}
            disabled={busy}
            onChange={(event) => setStartTime(event.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] tabular-nums text-[#1c1917] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          />
        </label>
        <label>
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
            Eind
          </span>
          <input
            type="time"
            value={endTime}
            disabled={busy}
            onChange={(event) => setEndTime(event.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] tabular-nums text-[#1c1917] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          />
        </label>
      </div>

      {error ? <p className="mb-3 text-[13px] text-[#b45309]">{error}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSubmit()}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none text-[15px] font-semibold disabled:opacity-60"
        style={{
          background: "var(--sage)",
          color: "#0f1c10",
          fontFamily: "var(--f-sans)",
        }}
      >
        <Icons.Plus s={16} />
        Toevoegen
      </button>
    </div>
  );
}
