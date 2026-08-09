"use client";

import { useEffect, useId, useRef } from "react";
import * as Icons from "@/components/app/icons";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import type { BewegingHelpBridge, HelpBridgeStatus } from "@/lib/beweging-help-bridge";

const STATUS_LABEL: Record<HelpBridgeStatus, string> = {
  done: "gedaan",
  wacht: "wacht op basis",
  now: "nu",
  toekomstig: "nog niet",
};

const STATUS_STYLE: Record<HelpBridgeStatus, string> = {
  done: "border-[#5A8F6A]/40 bg-[#5A8F6A]/15 text-[#8FBF9E]",
  now: "border-[#C8956C]/40 bg-[#C8956C]/15 text-[#C8956C]",
  wacht: "border-white/15 bg-white/[0.04] text-[#9FB0A6]",
  toekomstig: "border-white/10 bg-transparent text-[#7E8C82]",
};

export default function MeerHulpBridgeSheet({
  open,
  bridge,
  onClose,
  onOpenVoortgang,
}: {
  open: boolean;
  bridge: BewegingHelpBridge;
  onClose: () => void;
  onOpenVoortgang: () => void;
}) {
  const titleId = useId();
  const shownRef = useRef(false);

  useEffect(() => {
    if (!open || shownRef.current) {
      return;
    }
    shownRef.current = true;
    emitAccountClientEvent("choice.shelf_opened", {
      domain: "beweging",
      from_state: "agenda_meer_hulp",
    });
    clarityTag("dashboard_agenda", "meer_hulp_brug_shown");
  }, [open]);

  if (!open) {
    return null;
  }

  const handleOpenVoortgang = () => {
    trackEvent("dashboard_beweging_voortgang_click", {
      surface: "meer_hulp_brug",
      state: "open",
    });
    clarityTag("dashboard_agenda", "meer_hulp_open_voortgang");
    onOpenVoortgang();
  };

  return (
    <AgendaSheetFrame titleId={titleId} title="Zet er iets naast" onClose={onClose}>
      <p className="mb-5 text-[13px] leading-normal text-[#CDD7D0] text-pretty">
        Iets ernaast zetten kies je in Voortgang, waar je oordeel en je hertest
        samenkomen — niet hier los.
      </p>

      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
        <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
          Je basis · primair pad
        </p>
        <p
          className="m-0 text-[15px] font-medium text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {bridge.stepTitle ?? "Nog geen stap ingesteld"}
        </p>
        {bridge.programLabel ? (
          <p className="mt-0.5 text-[12px] text-[#9FB0A6]">{bridge.programLabel}</p>
        ) : null}
      </div>

      <ul className="mb-5 flex list-none flex-col gap-2 p-0">
        {bridge.points.map((point) => (
          <li
            key={point.id}
            className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-2 first:border-t-0 first:pt-0"
          >
            <span className="text-[13.5px] text-[#CDD7D0]">{point.label}</span>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[point.status]}`}
            >
              {STATUS_LABEL[point.status]}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleOpenVoortgang}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none text-[15px] font-semibold"
        style={{ background: "var(--sage)", color: "#0f1c10", fontFamily: "var(--f-sans)" }}
      >
        Open Voortgang <Icons.ChevronRight s={16} />
      </button>
    </AgendaSheetFrame>
  );
}
