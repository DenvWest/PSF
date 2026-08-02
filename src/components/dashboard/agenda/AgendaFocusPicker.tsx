"use client";

import FocusPickerCore from "@/components/dashboard/focus/FocusPickerCore";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type AgendaFocusPickerProps = {
  model: DashboardModel;
  busy: boolean;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

export default function AgendaFocusPicker(props: AgendaFocusPickerProps) {
  return <FocusPickerCore {...props} />;
}
