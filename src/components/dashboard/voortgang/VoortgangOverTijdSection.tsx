"use client";

import { useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import LeefstijllijnSection from "@/components/dashboard/LeefstijllijnSection";
import type { DashboardModel } from "@/types/dashboard";

type VoortgangOverTijdSectionProps = {
  model: DashboardModel;
  children?: ReactNode;
};

export default function VoortgangOverTijdSection({
  model,
  children,
}: VoortgangOverTijdSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section id="voortgang-over-tijd" aria-labelledby="voortgang-over-tijd-title" className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-left"
      >
        <Icons.BarChart s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
        <span className="min-w-0 flex-1">
          <span
            id="voortgang-over-tijd-title"
            className="block font-serif text-[16px] text-[var(--text)]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            Over tijd
          </span>
          <span className="block text-[12.5px] text-[var(--text-subtle)]">
            Je leefstijllijn en eerdere metingen
          </span>
        </span>
        <Icons.ChevronDown
          s={18}
          style={{
            color: "var(--text-subtle)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {open ? (
        <div className="mt-3 flex flex-col gap-4">
          <LeefstijllijnSection
            model={model}
            surface="voortgang"
            focusPillarId={model.priority.id}
          />
          {children}
        </div>
      ) : null}
    </section>
  );
}
