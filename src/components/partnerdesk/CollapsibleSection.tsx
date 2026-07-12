"use client";

import { useState, type ReactNode } from "react";
import { DeskIcon } from "@/components/partnerdesk/DeskIcon";

export function CollapsibleSection({
  id,
  title,
  action,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]"
    >
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left"
        >
          <DeskIcon
            name="chevron"
            width={16}
            height={16}
            className={`text-[var(--ps-muted)] transition-transform ${open ? "rotate-90" : ""}`}
          />
          <h2 className="text-base font-semibold">{title}</h2>
        </button>
        {action}
      </div>
      {open && <div className="border-t border-[var(--ps-border)] px-5 py-4">{children}</div>}
    </section>
  );
}
