"use client";

import { useCallback, useState } from "react";
import {
  resetDashboardPriorityFocus,
  saveDashboardPrioritySelection,
  type PrioritySelectionSurface,
} from "@/lib/dashboard-priority-selection";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

type UseFocusPickerControlOptions = {
  model: DashboardModel;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  surface: PrioritySelectionSurface;
  onPickerOpen?: () => void;
};

export function useFocusPickerControl({
  model,
  onPrefUpdated,
  surface,
  onPickerOpen,
}: UseFocusPickerControlOptions) {
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleFocus = useCallback(() => {
    setFocusExpanded((prev) => {
      const next = !prev;
      if (next) {
        onPickerOpen?.();
      }
      return next;
    });
  }, [onPickerOpen]);

  const closeFocus = useCallback(() => {
    setFocusExpanded(false);
  }, []);

  const selectPillar = useCallback(
    async (pillarId: PillarId) => {
      setBusy(true);
      try {
        await saveDashboardPrioritySelection({
          pillarId,
          source: "user_selected",
          surface,
          timeBucket: model.timeBucket ?? null,
          scheduledTime: model.scheduledTime ?? null,
          onPrefUpdated,
        });
        closeFocus();
      } finally {
        setBusy(false);
      }
    },
    [closeFocus, model.scheduledTime, model.timeBucket, onPrefUpdated, surface],
  );

  const acceptEngine = useCallback(async () => {
    setBusy(true);
    try {
      await saveDashboardPrioritySelection({
        pillarId: model.enginePriority.id,
        source: "accept_engine",
        surface,
        timeBucket: model.timeBucket ?? null,
        scheduledTime: model.scheduledTime ?? null,
        onPrefUpdated,
      });
      closeFocus();
    } finally {
      setBusy(false);
    }
  }, [
    closeFocus,
    model.enginePriority.id,
    model.scheduledTime,
    model.timeBucket,
    onPrefUpdated,
    surface,
  ]);

  const resetFocus = useCallback(async () => {
    setBusy(true);
    try {
      await resetDashboardPriorityFocus(onPrefUpdated);
      closeFocus();
    } finally {
      setBusy(false);
    }
  }, [closeFocus, onPrefUpdated]);

  return {
    focusExpanded,
    busy,
    toggleFocus,
    closeFocus,
    selectPillar,
    acceptEngine,
    resetFocus,
  };
}
