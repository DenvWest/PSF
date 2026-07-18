"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/app/primitives";
import * as Icons from "@/components/app/icons";
import { PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT } from "@/lib/consent-texts";
import PremiumValuePropsList from "@/components/dashboard/PremiumValuePropsList";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type PremiumWaitlistCardProps = {
  surface?: string;
};

type State = "idle" | "loading" | "joined" | "error";

export default function PremiumWaitlistCard({
  surface = "voortgang",
}: PremiumWaitlistCardProps) {
  const [state, setState] = useState<State>("idle");
  const [launchEmailOptIn, setLaunchEmailOptIn] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("premium_waitlist_shown", { surface });
    clarityTag("premium_waitlist", "shown");
    clarityTag("premium_value_props", surface);
  }, [surface]);

  const join = async () => {
    if (state === "loading" || state === "joined") {
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/account/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          feature: "premium-coaching",
          surface,
          launchEmailOptIn,
        }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("joined");
      trackEvent("premium_waitlist_join", {
        feature: "premium-coaching",
        surface,
        launch_email_opt_in: launchEmailOptIn,
      });
      clarityTag("premium_waitlist", "premium-coaching");
    } catch {
      setState("error");
    }
  };

  if (state === "joined") {
    return (
      <div id="premium-begeleiding">
        <Card pad={20}>
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
        </Card>
      </div>
    );
  }

  return (
    <div id="premium-begeleiding">
      <Card pad={20}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-subtle)",
                marginBottom: 10,
              }}
            >
              <Icons.Lock s={14} /> Premium · begeleiding
            </div>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 21,
                color: "var(--text)",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              Elke week kijkt er iemand met je mee — onafhankelijk, zonder merkverkoop.
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Gratis meet je waar je staat; premium is wekelijkse persoonlijke terugkoppeling op je
              eigen cijfers.
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-subtle)",
                lineHeight: 1.5,
                margin: "10px 0 0",
                textWrap: "pretty",
              }}
            >
              Rond de prijs van een abonnement — we laten het weten bij launch.
            </p>
          </div>

          <PremiumValuePropsList variant="hub" />

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.5,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={launchEmailOptIn}
              onChange={(event) => setLaunchEmailOptIn(event.target.checked)}
              disabled={state === "loading"}
              style={{ marginTop: 3 }}
            />
            <span>{PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT.premium_launch_email}</span>
          </label>

          <Button
            variant="terra"
            full
            size="lg"
            icon={<Icons.Lock s={18} />}
            disabled={state === "loading"}
            onClick={join}
          >
            {state === "loading" ? "Bezig…" : "Zet me op de wachtlijst"}
          </Button>

          {state === "error" ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--terra, #C8956C)" }}>
              Er ging iets mis. Probeer het zo opnieuw.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
