"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/app/primitives";
import * as Icons from "@/components/app/icons";
import { PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT } from "@/lib/consent-texts";
import PremiumValuePropsList from "@/components/dashboard/PremiumValuePropsList";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

const PRICE_BANDS = [
  { value: "lt_10", label: "Minder dan €10" },
  { value: "10_20", label: "€10–20" },
  { value: "20_35", label: "€20–35" },
  { value: "gt_35", label: "Meer dan €35" },
  { value: "unknown", label: "Weet ik nog niet" },
] as const;

type PriceBand = (typeof PRICE_BANDS)[number]["value"];

type PremiumWaitlistCardProps = {
  surface?: string;
};

type State = "idle" | "loading" | "joined" | "error";

export default function PremiumWaitlistCard({
  surface = "voortgang",
}: PremiumWaitlistCardProps) {
  const [state, setState] = useState<State>("idle");
  const [priceBand, setPriceBand] = useState<PriceBand | "">("");
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
          ...(priceBand ? { priceIndication: priceBand } : {}),
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
        price_band: priceBand || "none",
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
        </div>

        <PremiumValuePropsList />

        <fieldset
          style={{
            border: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <legend
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 4,
            }}
          >
            Wat zou je per maand redelijk vinden?{" "}
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optioneel)</span>
          </legend>
          {PRICE_BANDS.map((band) => (
            <label
              key={band.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="premium_price_band"
                value={band.value}
                checked={priceBand === band.value}
                onChange={() => setPriceBand(band.value)}
                disabled={state === "loading"}
              />
              {band.label}
            </label>
          ))}
        </fieldset>

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
