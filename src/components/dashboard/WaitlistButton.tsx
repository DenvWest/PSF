"use client";

import { useState } from "react";
import { Button } from "@/components/app/primitives";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type WaitlistFeature =
  | "inzichten"
  | "statistieken"
  | "lichaamssamenstelling"
  | "beweging-coach"
  | "stress-coach"
  | "slaap-coach";

type WaitlistButtonProps = {
  feature: WaitlistFeature;
  surface?: string;
  label: string;
};

type State = "idle" | "loading" | "joined" | "error";

export default function WaitlistButton({
  feature,
  surface = "voortgang",
  label,
}: WaitlistButtonProps) {
  const [state, setState] = useState<State>("idle");

  const join = async () => {
    if (state === "loading" || state === "joined") return;
    setState("loading");
    try {
      const res = await fetch("/api/account/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ feature, surface }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("joined");
      trackEvent("premium_waitlist_join", { feature, surface });
      clarityTag("premium_waitlist", feature);
    } catch {
      setState("error");
    }
  };

  if (state === "joined") {
    return (
      <div
        role="status"
        style={{
          textAlign: "center",
          padding: "13px 16px",
          borderRadius: 12,
          border: "1px solid rgba(90,143,106,0.4)",
          background: "rgba(90,143,106,0.12)",
          color: "var(--text)",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Je staat op de wachtlijst — we laten het weten zodra het er is.
      </div>
    );
  }

  return (
    <>
      <Button
        variant="terra"
        full
        size="lg"
        icon={<Icons.Lock s={18} />}
        disabled={state === "loading"}
        onClick={join}
      >
        {state === "loading" ? "Bezig…" : label}
      </Button>
      {state === "error" ? (
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--terra, #C8956C)" }}>
          Er ging iets mis. Probeer het zo opnieuw.
        </p>
      ) : null}
    </>
  );
}
