"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { DASHBOARD_MORE_ITEMS } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

/**
 * Het "Meer"-menu naast de vier tabs.
 *
 * ## Waarom dit naast de tabs staat en niet erin
 *
 * De vier tabs zijn één lus — Dagboek meet, Je patroon weegt, Keuze dicht,
 * Mijn Dag plant. Wat hier onder valt zit niet ín die lus: je doelen zijn de
 * meetlat waar alle vier tegen aflezen. Een vijfde tab zou dat gelijkstellen
 * aan een vijfde stap, en de vier labels delen nu al krap de breedte.
 *
 * ## Waarom één component voor twee navigaties
 *
 * De onderbalk (mobiel) en de header (vanaf sm) tonen dezelfde lijst. Eén
 * component met een `variant` houdt die twee synchroon: een item toevoegen
 * aan `DASHBOARD_MORE_ITEMS` laat het op beide plekken verschijnen, zonder
 * dat iemand de tweede vergeet.
 */

type Variant = "header" | "bottom";

const MENU_ITEM =
  "flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-left no-underline transition hover:bg-white/[0.06]";

export default function CockpitMoreMenu({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const knop =
    variant === "bottom"
      ? `flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition ${
          open ? "text-[#F1EFE8]" : "text-[#9FB0A6]"
        }`
      : `relative flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[13px] font-medium transition md:justify-start lg:gap-2 lg:px-3 lg:text-[13.5px] ${
          open
            ? "text-[#F1EFE8]"
            : "text-[#9FB0A6] hover:bg-white/[0.05] hover:text-[#F1EFE8]"
        }`;

  return (
    <div
      ref={rootRef}
      className={variant === "bottom" ? "relative flex flex-1" : "relative"}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) clarityTag("dashboard_more_menu", "open");
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Meer"
        title="Meer"
        className={knop}
      >
        {variant === "bottom" ? (
          <>
            <Icons.MoreHorizontal
              s={20}
              style={{ color: open ? "#5A8F6A" : "rgba(159,176,166,0.85)" }}
            />
            Meer
          </>
        ) : (
          <>
            <span className="flex h-[15px] w-[15px] items-center justify-center">
              <Icons.MoreHorizontal
                s={15}
                style={{ color: open ? "#5A8F6A" : "rgba(159,176,166,0.85)" }}
              />
            </span>
            <span className="hidden md:inline">Meer</span>
          </>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Meer"
          /*
            Op de onderbalk klapt het menu omhoog en op de header omlaag — in
            beide gevallen vanaf de knop, zodat de lijst niet over de
            navigatie heen valt waar hij vandaan komt.
          */
          className={`absolute z-30 w-[248px] rounded-[14px] border border-white/10 bg-[rgba(16,24,26,0.98)] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${
            variant === "bottom"
              ? "bottom-[calc(100%+6px)] right-1"
              : "right-0 top-[calc(100%+6px)]"
          }`}
        >
          {DASHBOARD_MORE_ITEMS.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{
              s?: number;
            }>;
            return (
              <Link
                key={item.id}
                role="menuitem"
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent("dashboard_more_item_click", { item: item.id });
                }}
                className={MENU_ITEM}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[#9FB0A6]">
                  <Icon s={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] text-[#F1EFE8]">
                    {item.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-[#9FB0A6]">
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
