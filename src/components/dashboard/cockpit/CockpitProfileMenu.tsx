"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";

type CockpitProfileMenuProps = {
  firstName?: string | null;
  onOpenSettings: () => void;
  onLogout: () => void | Promise<void>;
};

const MENU_ITEM =
  "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13.5px] text-[#CDD7D0] no-underline transition hover:bg-white/[0.06] hover:text-[#F1EFE8]";

/**
 * Profielmenu in de cockpit-header (slice 1, Q3): het logo linkt naar de
 * app-home, de uitgang naar de publieke site verhuist hierheen — niet als
 * per ongeluk-klik op het logo. Future-proof slot voor coach/logboek later.
 */
export default function CockpitProfileMenu({
  firstName,
  onOpenSettings,
  onLogout,
}: CockpitProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = firstName?.trim() || "Je profiel";

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profiel en instellingen"
        className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/[0.04] py-1 pl-1 pr-1.5 text-[#9FB0A6] transition hover:text-[#F1EFE8] sm:pr-2"
      >
        <span
          aria-hidden
          className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
        />
        <span className="hidden max-w-[12ch] truncate text-[13px] font-medium text-[#F1EFE8] sm:inline">
          {name}
        </span>
        <Icons.ChevronDown s={14} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-[14px] border border-white/10 bg-[#101a1b] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        >
          <div className="truncate px-2.5 pb-2 pt-1.5 font-serif text-[14px] text-[#F1EFE8]">
            {name}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
            className={MENU_ITEM}
          >
            <Icons.Settings s={16} /> Instellingen
          </button>
          <Link
            role="menuitem"
            href="/"
            onClick={() => {
              setOpen(false);
              clarityTag("dashboard_profile_menu", "exit_website");
            }}
            className={MENU_ITEM}
          >
            <Icons.Compass s={16} /> Naar perfectsupplement.nl
          </Link>
          <div className="my-1 h-px bg-white/10" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            className={MENU_ITEM}
          >
            <Icons.LogOut s={16} /> Uitloggen
          </button>
        </div>
      ) : null}
    </div>
  );
}
