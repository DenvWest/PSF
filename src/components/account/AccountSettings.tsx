"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { Button, Card } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  fetchPriorityPref,
  postSetPlanStepsHidden,
  type PriorityPrefResponse,
} from "@/lib/priority-pref-client";
import type { AccountPriorityPrefData, PillarId } from "@/types/dashboard";

type AccountSettingsProps = {
  email: string;
};

const SETTINGS_SURFACE = "account_settings";

type ClaimState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "prompt"; count: number }
  | { status: "linked"; linked: number }
  | { status: "error"; message: string };

type SettingsPref = {
  pillarId: PillarId | null;
  enginePriorityId: PillarId | null;
  scheduledTime: string | null;
  planStepsHidden: boolean;
};

type SettingsState =
  | { status: "loading" }
  | ({ status: "ready" } & SettingsPref)
  | { status: "error"; message: string };

/** GET geeft altijd enginePriorityId mee; dat is de enige plek waar we hem lezen. */
function toSettingsPref(response: PriorityPrefResponse): SettingsPref {
  return {
    pillarId: response.pillarId,
    enginePriorityId: response.enginePriorityId,
    scheduledTime: "scheduledTime" in response ? (response.scheduledTime ?? null) : null,
    planStepsHidden: "planStepsHidden" in response ? response.planStepsHidden : false,
  };
}

/** Mutatie-endpoints geven geen enginePriorityId terug — die blijft ongewijzigd staan. */
function mergeMutatedPref(current: SettingsPref, next: AccountPriorityPrefData): SettingsPref {
  return {
    pillarId: next.pillarId,
    enginePriorityId: current.enginePriorityId,
    scheduledTime: next.scheduledTime ?? null,
    planStepsHidden: next.planStepsHidden,
  };
}

const FIELD_LABEL_STYLE = {
  margin: "0 0 10px",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--text)",
};

function ToggleSwitch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        height: 26,
        width: 46,
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        alignItems: "center",
        borderRadius: 999,
        border: `1px solid ${checked ? "var(--sage)" : "var(--panel-border, rgba(22,40,26,0.16))"}`,
        background: checked ? "rgba(90,143,106,0.28)" : "rgba(22,40,26,0.05)",
        opacity: disabled ? 0.6 : 1,
        transition: "background 140ms ease, border-color 140ms ease",
      }}
    >
      <span
        aria-hidden
        style={{
          height: 18,
          width: 18,
          borderRadius: 999,
          background: checked ? "var(--sage)" : "#8b8577",
          transform: checked ? "translateX(23px)" : "translateX(3px)",
          transition: "transform 140ms ease, background 140ms ease",
        }}
      />
    </button>
  );
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
      return data.error;
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export default function AccountSettings({ email }: AccountSettingsProps) {
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimState>({ status: "loading" });
  const [claiming, setClaiming] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsState>({ status: "loading" });
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetchPriorityPref();
        if (!cancelled) {
          setSettings({ status: "ready", ...toSettingsPref(response) });
        }
      } catch (error) {
        if (!cancelled) {
          setSettings({
            status: "error",
            message: error instanceof Error ? error.message : "Kon instellingen niet laden.",
          });
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const runSettingsMutation = async (
    setting: string,
    value: string,
    mutate: () => Promise<AccountPriorityPrefData>,
    fallbackMessage: string,
  ) => {
    if (settings.status !== "ready" || settingsBusy) {
      return;
    }
    const current = settings;
    setSettingsBusy(true);
    setSettingsError(null);
    try {
      const next = await mutate();
      setSettings({ status: "ready", ...mergeMutatedPref(current, next) });
      trackEvent("account_setting_changed", { setting, value, surface: SETTINGS_SURFACE });
      clarityTag("account_settings", setting);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setSettingsBusy(false);
    }
  };

  const handlePlanStepsHiddenChange = (hidden: boolean) =>
    runSettingsMutation(
      "plan_steps_visible",
      hidden ? "uit" : "aan",
      () => postSetPlanStepsHidden({ hidden, surface: SETTINGS_SURFACE }),
      hidden ? "Kon dagstappen niet verbergen." : "Kon dagstappen niet weer tonen.",
    );

  useEffect(() => {
    let cancelled = false;

    async function loadClaimable() {
      try {
        const response = await fetch("/api/account/claim-sessions");
        if (!response.ok) {
          if (!cancelled) {
            setClaim({
              status: "error",
              message: await readErrorMessage(response, "Kon eerdere checks niet ophalen."),
            });
          }
          return;
        }

        const data: unknown = await response.json();
        const count =
          data && typeof data === "object" && "count" in data && typeof data.count === "number"
            ? data.count
            : 0;

        if (!cancelled) {
          setClaim(count > 0 ? { status: "prompt", count } : { status: "idle" });
        }
      } catch {
        if (!cancelled) {
          setClaim({ status: "error", message: "Kon eerdere checks niet ophalen." });
        }
      }
    }

    void loadClaimable();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async () => {
    if (claim.status !== "prompt" || claiming) {
      return;
    }

    setClaiming(true);
    setActionError(null);

    try {
      const response = await fetch("/api/account/claim-sessions", { method: "POST" });
      if (!response.ok) {
        setActionError(await readErrorMessage(response, "Kon eerdere checks niet koppelen."));
        return;
      }

      const data: unknown = await response.json();
      const linked =
        data && typeof data === "object" && "linked" in data && typeof data.linked === "number"
          ? data.linked
          : 0;

      setClaim({ status: "linked", linked });
    } catch {
      setActionError("Kon eerdere checks niet koppelen.");
    } finally {
      setClaiming(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawConfirm) {
      setWithdrawConfirm(true);
      setDeleteConfirm(false);
      setActionError(null);
      return;
    }

    if (withdrawing) {
      return;
    }

    setWithdrawing(true);
    setActionError(null);

    try {
      const response = await fetch("/api/account/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });

      if (!response.ok) {
        setActionError(await readErrorMessage(response, "Kon toestemming niet intrekken."));
        setWithdrawConfirm(false);
        return;
      }

      router.push("/");
    } catch {
      setActionError("Kon toestemming niet intrekken.");
      setWithdrawConfirm(false);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setWithdrawConfirm(false);
      setActionError(null);
      return;
    }

    if (deleting) {
      return;
    }

    setDeleting(true);
    setActionError(null);

    try {
      const response = await fetch("/api/account/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });

      if (!response.ok) {
        setActionError(await readErrorMessage(response, "Kon account niet verwijderen."));
        setDeleteConfirm(false);
        return;
      }

      router.push("/");
    } catch {
      setActionError("Kon account niet verwijderen.");
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AuthShell exitHref="/dashboard" maxWidth="min(94vw, 640px)">
      <header style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 30, lineHeight: 1.15 }}>Instellingen</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.5 }}>{email}</p>
      </header>

      {settings.status === "ready" && (
        <Card pad={20}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <p style={{ ...FIELD_LABEL_STYLE, margin: 0 }}>Dagstappen tonen</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Uit betekent: alleen je eigen momenten in de agenda. Je plan blijft bestaan.
              </p>
            </div>
            <ToggleSwitch
              checked={!settings.planStepsHidden}
              disabled={settingsBusy}
              label="Dagstappen tonen"
              onChange={(next) => handlePlanStepsHiddenChange(!next)}
            />
          </div>
        </Card>
      )}

      {settingsError && (
        <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--terra)", lineHeight: 1.5 }}>
          {settingsError}
        </p>
      )}

      {settings.status === "error" && (
        <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--terra)", lineHeight: 1.5 }}>
          {settings.message}
        </p>
      )}

      {claim.status === "prompt" && (
        <Card pad={20}>
          <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
            We vonden {claim.count} eerdere check{claim.count === 1 ? "" : "s"} onder dit e-mailadres. Koppelen aan je
            account?
          </p>
          <Button onClick={handleClaim} disabled={claiming} full>
            {claiming ? "Bezig met koppelen…" : "Koppel mijn checks"}
          </Button>
        </Card>
      )}

      {claim.status === "linked" && (
        <Card pad={20}>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--sage)", lineHeight: 1.55 }}>
            {claim.linked} gekoppeld ✓
          </p>
        </Card>
      )}

      {claim.status === "error" && (
        <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--terra)", lineHeight: 1.5 }}>
          {claim.message}
        </p>
      )}

      <Card pad={20}>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>
          Je anonieme gegevens blijven bewaard; je account wordt losgekoppeld. Je kunt later met dezelfde e-mail
          opnieuw inloggen.
        </p>
        <Button variant="secondary" onClick={handleWithdraw} disabled={withdrawing} full>
          {withdrawConfirm ? "Weet je het zeker?" : "Toestemming intrekken"}
        </Button>
      </Card>

      <Card pad={20} glow="#C8956C" style={{ borderColor: "rgba(200,149,108,0.28)" }}>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>
          Dit verwijdert je account én alle gekoppelde checks definitief. Dit kan niet ongedaan worden.
        </p>
        <Button variant="terra" onClick={handleDelete} disabled={deleting} full>
          {deleteConfirm ? "Ja, definitief verwijderen" : "Account en gegevens verwijderen"}
        </Button>
      </Card>

      {actionError && (
        <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--terra)", lineHeight: 1.5 }}>
          {actionError}
        </p>
      )}
    </AuthShell>
  );
}
