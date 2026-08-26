"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

/**
 * Navigatiebalk in de sticky cockpit-header: ingeklapt één regel met waar je
 * bent, uitgeklapt alle bestemmingen onder elkaar.
 *
 * Verving de horizontale chiprijen (Voortgang, Kompas-domeinen): die duwden de
 * helft van de bestemmingen buiten beeld op telefoonbreedte, zonder dat je zag
 * dat er meer was. Onder md is dit de enige drager; vanaf md neemt de linker
 * rail het over.
 */

export type CockpitTopNavItem = {
  id: string;
  label: string;
  /** Sleutel uit `@/components/app/icons`. */
  icon?: string;
  /** Domeinstip in plaats van een icoon. */
  dotColor?: string;
  /** Rechts uitgelijnd: score, of het domein waar dit item op uitkomt. */
  trailing?: string;
  active?: boolean;
  /** Hangt onder het item erboven (bijv. domeinen onder Leefstijlprofiel). */
  indent?: boolean;
  onSelect: () => void;
};

type CockpitTopNavProps = {
  ariaLabel: string;
  /** Waar je nu bent — de ingeklapte regel. */
  title: string;
  titleIcon?: string;
  /** Accentkleur van het icoon; standaard gedempt. */
  titleColor?: string;
  items: CockpitTopNavItem[];
  /** Onderscheidt de balken in de meting: "voortgang", "kompas". */
  surface: string;
};

const PANEL_ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] border px-2.5 py-2.5 text-left text-[13.5px] font-medium transition";

const PANEL_SUB_ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left text-[13px] font-medium transition";

const ACTIVE_ITEM = "border-[#5A8F6A]/45 bg-[#5A8F6A]/12 text-[#F1EFE8]";
const IDLE_ITEM = "border-transparent text-[#9FB0A6]";

function NavIcon({ name, s, color }: { name?: string; s: number; color: string }) {
  const Icon = name ? (Icons[name as keyof typeof Icons] as IconComp | undefined) : undefined;
  return Icon ? <Icon s={s} style={{ color }} /> : null;
}

export default function CockpitTopNav({
  ariaLabel,
  title,
  titleIcon,
  titleColor,
  items,
  surface,
}: CockpitTopNavProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      trackEvent("dashboard_topnav_toggle", { surface, state: next ? "open" : "dicht" });
      clarityTag("dashboard_topnav", `${surface}_${next ? "open" : "dicht"}`);
      return next;
    });
  };

  // De bestemmings-meting hoort bij de caller, die de rail met dezelfde
  // handlers bedient — daar staat `surface` al in het event.
  const pick = (item: CockpitTopNavItem) => {
    setOpen(false);
    item.onSelect();
  };

  return (
    <div ref={rootRef} className="relative w-full sm:max-w-[440px]">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex min-h-[42px] w-full cursor-pointer items-center gap-2.5 rounded-[12px] border border-white/10 bg-white/[0.05] px-3 py-1.5 text-left transition"
      >
        <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center">
          <NavIcon name={titleIcon} s={15} color={titleColor ?? "#7E8C82"} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[#F1EFE8]">
          {title}
        </span>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7E8C82]">
          {open ? "Sluit" : "Wissel"}
        </span>
        <Icons.ChevronDown
          s={15}
          style={{
            color: "#9FB0A6",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : undefined,
          }}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          aria-label={ariaLabel}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-[min(62vh,460px)] overflow-y-auto rounded-[16px] border border-white/10 bg-[#101a1b] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.5)]"
        >
          {items.map((item) => {
            const button = (
              <button
                type="button"
                role="menuitem"
                onClick={() => pick(item)}
                className={`${item.indent ? PANEL_SUB_ITEM : PANEL_ITEM} ${
                  item.active ? ACTIVE_ITEM : IDLE_ITEM
                }`}
              >
                {item.dotColor ? (
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: item.dotColor }}
                  />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    <NavIcon
                      name={item.icon}
                      s={16}
                      color={item.active ? "#5A8F6A" : "rgba(159,176,166,0.85)"}
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.trailing ? (
                  <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-[#7E8C82]">
                    {item.trailing}
                  </span>
                ) : null}
              </button>
            );

            // De ingesprongen items krijgen een doorlopende geleidelijn: de
            // rand van de wrapper, niet die van de knop — die is al in gebruik
            // voor de actieve staat.
            return item.indent ? (
              <div key={item.id} className="ml-3 border-l border-white/10 pl-2">
                {button}
              </div>
            ) : (
              <div key={item.id}>{button}</div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
