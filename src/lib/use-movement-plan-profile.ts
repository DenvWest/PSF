"use client";

import { useCallback, useEffect, useState } from "react";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  parseMovementPlanProfile,
  resolveEffectivePlanProfile,
  type MovementPlanProfile,
  type MovementPlanProfilePatch,
} from "@/lib/movement-plan-profile";

export type UseMovementPlanProfileResult = {
  profile: MovementPlanProfile;
  loading: boolean;
  prefsBusy: boolean;
  saveProfilePatch: (patch: MovementPlanProfilePatch) => Promise<void>;
  toggleSport: (sportId: string) => void;
  /** Voor waarden die elders al server-side zijn opgeslagen (bv. MovementStartChoice) — geen dubbele POST. */
  applyKnownPatch: (patch: Partial<MovementPlanProfile>) => void;
};

/** Verplaatst uit MovementPlanDeepBody: fetch/save/toggle van het bewegingsprofiel, los van de (verwijderde) Stappenplan-container. */
export function useMovementPlanProfile(movStr: number | undefined): UseMovementPlanProfileResult {
  const [profile, setProfile] = useState<MovementPlanProfile>(() =>
    resolveEffectivePlanProfile(parseMovementPlanProfile({}), movStr),
  );
  const [loading, setLoading] = useState(true);
  const [prefsBusy, setPrefsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/movement-prefs", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const json = (await response.json()) as MovementPlanProfile;
        setProfile(resolveEffectivePlanProfile(json, movStr));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movStr]);

  const saveProfilePatch = useCallback(
    async (patch: MovementPlanProfilePatch) => {
      setPrefsBusy(true);
      try {
        const response = await fetch("/api/account/movement-prefs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        });
        if (!response.ok) {
          return;
        }
        const next = (await response.json()) as MovementPlanProfile & { ok: boolean };
        setProfile(resolveEffectivePlanProfile(next, movStr));
        if ("trainingLocation" in patch) {
          trackEvent("movement_location_selected", {
            location: String(patch.trainingLocation),
            surface: "plan_sheet",
          });
          emitAccountClientEvent("movement.location_selected", {
            location: String(patch.trainingLocation),
            surface: "plan_sheet",
          });
          clarityTag("movement_location", String(patch.trainingLocation));
        }
        // `trainingGuidance` hergebruikt de dial-generalisatie i.p.v. een eigen
        // event-type te registreren (CLAUDE.md meet-standaarden: hergebruik vóór nieuw).
        const targetKey = (
          ["targetMinutes", "targetDays", "targetStrength", "trainingGuidance"] as const
        ).find((key) => key in patch);
        if (targetKey) {
          trackEvent("movement_target_set", {
            dial: targetKey,
            value: String(patch[targetKey]),
            surface: "kompas_beweging",
          });
          emitAccountClientEvent("movement.target_set", {
            dial: targetKey,
            value: patch[targetKey],
            surface: "kompas_beweging",
          });
          clarityTag("movement_target", targetKey);
        }
        trackEvent("movement_plan_profile_updated", {
          surface: "dashboard_plan_configurator",
        });
      } finally {
        setPrefsBusy(false);
      }
    },
    [movStr],
  );

  const toggleSport = useCallback(
    (sportId: string) => {
      setProfile((current) => {
        const effective = resolveEffectivePlanProfile(current, movStr);
        const has = effective.sports.includes(sportId);
        const nextSports = has
          ? effective.sports.filter((id) => id !== sportId)
          : effective.sports.length >= 3
            ? effective.sports
            : [...effective.sports, sportId];
        void saveProfilePatch({ sports: nextSports });
        return { ...current, sports: nextSports };
      });
    },
    [movStr, saveProfilePatch],
  );

  const applyKnownPatch = useCallback(
    (patch: Partial<MovementPlanProfile>) => {
      setProfile((current) => resolveEffectivePlanProfile({ ...current, ...patch }, movStr));
    },
    [movStr],
  );

  return { profile, loading, prefsBusy, saveProfilePatch, toggleSport, applyKnownPatch };
}
