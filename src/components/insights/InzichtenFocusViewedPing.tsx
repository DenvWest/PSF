"use client";

import { useEffect, useRef } from "react";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import type { PillarId } from "@/types/dashboard";

type InzichtenFocusViewedPingProps = {
  priorityPillarId: PillarId;
  hasPlan: boolean;
};

export default function InzichtenFocusViewedPing({
  priorityPillarId,
  hasPlan,
}: InzichtenFocusViewedPingProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    emitAccountClientEvent("focus.viewed", {
      pillar: priorityPillarId,
      has_plan: hasPlan,
    });
  }, [priorityPillarId, hasPlan]);

  return null;
}
