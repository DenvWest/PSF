"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";

type VoortgangFavorietenFooterProps = {
  onOpenLeefstijlprofiel?: (domain?: string) => void;
};

function kindLabel(kind: VoortgangFavoriteItem["kind"]): string {
  if (kind === "activiteit") {
    return "Activiteit";
  }
  if (kind === "dienst") {
    return "Dienst";
  }
  return "Supplement";
}

export default function VoortgangFavorietenFooter({
  onOpenLeefstijlprofiel,
}: VoortgangFavorietenFooterProps) {
  const { items, remove } = useVoortgangFavorites();
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      trackEvent("dashboard_favorieten_footer_open", { count: items.length });
      clarityTag("dashboard_favorieten_footer", "open");
    }
  };

  const handleItemClick = (item: VoortgangFavoriteItem) => {
    trackEvent("dashboard_favorieten_footer_item_click", {
      item_id: item.id,
      kind: item.kind,
    });
    clarityTag("dashboard_favorieten_footer", item.id);
    onOpenLeefstijlprofiel?.(item.domain);
  };

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-[var(--divider-strong)] bg-[var(--bg)]/95 backdrop-blur-sm"
      aria-label="Favorieten"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
      >
        <Icons.Heart s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
        <span className="flex-1">
          <span className="block text-[14px] font-semibold text-[var(--text)]">Favorieten</span>
          <span className="block text-[12px] text-[var(--text-subtle)]">
            {items.length} opgeslagen
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
        <ul className="m-0 max-h-[40vh] list-none overflow-y-auto border-t border-[var(--divider)] px-2 pb-3">
          {items.map((item) => (
            <li key={item.id} className="border-t border-[var(--divider)] first:border-t-0">
              <div className="flex items-center gap-2 px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
                >
                  <span className="block truncate text-[13.5px] font-medium text-[var(--text)]">
                    {item.title}
                  </span>
                  <span className="block text-[11px] text-[var(--text-subtle)]">
                    {kindLabel(item.kind)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Verwijder ${item.title} uit favorieten`}
                  className="shrink-0 cursor-pointer rounded-lg border border-[var(--divider)] bg-transparent p-1.5 text-[var(--text-subtle)]"
                >
                  <Icons.Plus s={14} style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
