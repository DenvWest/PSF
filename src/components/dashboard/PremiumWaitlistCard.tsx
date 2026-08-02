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
    trackEvent("premium_waitlist_shown", { surface, offer: "begeleiding" });
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
        offer: "begeleiding",
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
            Je staat op de lijst. We laten het weten zodra het er is — en niet vaker dan dat.
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
              <Icons.Heart s={14} /> Premium · Begeleiding
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
              Gratis meet je waar je staat. Premium kijkt er elke week iemand met je mee.
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
              Je scores, trends en hermeting blijven gratis. Waar we aan werken is de
              wekelijkse coach-review: wat zag ik in jouw week, waar stokt het, en hoe lezen
              we je delta bij de hermeting? Dat bestaat nog niet — wil je erbij zijn als het er is?
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
              We weten nog niet wat het gaat kosten. Wat we wel weten: je zit nergens aan vast en
              we vragen nu niets.
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
            disabled={state === "loading"}
            onClick={join}
          >
            {state === "loading" ? "Bezig…" : "Zet me op de wachtlijst voor begeleiding"}
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
