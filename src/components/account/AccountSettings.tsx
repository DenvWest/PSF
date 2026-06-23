"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import * as Icons from "@/components/app/icons";
import { Button, Card } from "@/components/app/primitives";
import { IDENTITY_FIELDS } from "@/data/dashboard";

type AccountSettingsProps = {
  email: string;
};

type ClaimState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "prompt"; count: number }
  | { status: "linked"; linked: number }
  | { status: "error"; message: string };

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
    <AuthShell exitHref="/dashboard">
      <header style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 30, lineHeight: 1.15 }}>Je account</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.5 }}>{email}</p>
      </header>

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

      <Card glow="#C8956C" pad={22} style={{ borderColor: "rgba(200,149,108,0.26)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 10 }}>
          <Icons.Spark s={14} /> Profiel
        </div>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 20, color: "var(--text)", lineHeight: 1.2 }}>Maak het persoonlijk</div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "8px 0 18px", textWrap: "pretty" }}>
          Geslacht, gewicht, lengte en werk berekenen je persoonlijke eiwitdoel en activiteitsniveau.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {IDENTITY_FIELDS.map((field, i) => {
            const Icon = Icons[field.icon];
            const done = Boolean(field.value);
            return (
              <div key={field.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 2px", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "rgba(90,143,106,0.16)" : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "rgba(90,143,106,0.32)" : "var(--panel-border)"}`, color: done ? "var(--sage)" : "var(--text-subtle)" }}>
                  <Icon s={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{field.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-subtle)", marginTop: 3, lineHeight: 1.4, textWrap: "pretty" }}>{field.unlocks}</div>
                </div>
                {done ? (
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>{field.value}</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--terra)", fontWeight: 500, flexShrink: 0 }}>
                    <Icons.Plus s={15} /> Invullen
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="terra" full iconRight={<Icons.ArrowRight s={18} />}>
            Vul je profiel aan
          </Button>
        </div>
      </Card>

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
