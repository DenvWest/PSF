"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, TrustLine } from "@/components/account/AuthShell";
import { ArrowRight, Lock, Mail, Refresh, Shield } from "@/components/app/icons";
import { Button, Checkbox, TextField } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

const CONTACT_EMAIL_STORAGE_KEY = "ps_contact_email";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function readStoredContactEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return sessionStorage.getItem(CONTACT_EMAIL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

type CodeEntryViewProps = {
  email: string;
  onResend: () => void;
  onChangeAddress: () => void;
};

function CodeEntryView({ email, onResend, onChangeAddress }: CodeEntryViewProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isCodeValid = /^\d{6}$/.test(code);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const restartCooldown = () => setCooldown(30);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCodeValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/account/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      if (response.status === 200) {
        router.push("/dashboard");
        return;
      }

      if (response.status === 429) {
        setErrorMessage("Te veel pogingen, probeer het zo opnieuw.");
        return;
      }

      setErrorMessage("De code klopt niet of is verlopen.");
    } catch {
      setErrorMessage("De code klopt niet of is verlopen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <article
        style={{
          border: "1px solid var(--panel-border)",
          background: "var(--panel)",
          borderRadius: 22,
          padding: "24px 22px",
          display: "grid",
          gap: 18,
        }}
      >
        <header style={{ display: "grid", gap: 8 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>
            Vul je inlogcode in
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            We mailden een 6-cijferige code naar{" "}
            <span style={{ color: "var(--text)" }}>{email}</span>.
          </p>
          {secondsLeft > 0 ? (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-subtle)" }}>
              Je code verloopt over {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--terra)" }}>
              Je code is verlopen — stuur een nieuwe.
            </p>
          )}
        </header>

        <form onSubmit={handleVerify} style={{ display: "grid", gap: 14 }}>
          <TextField
            label="Inlogcode"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            autoFocus
          />
          {errorMessage ? (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>{errorMessage}</p>
          ) : null}
          <Button type="submit" full disabled={!isCodeValid || isSubmitting} iconRight={<ArrowRight s={16} />}>
            Inloggen
          </Button>
        </form>

        <section
          style={{
            borderTop: "1px solid var(--divider)",
            paddingTop: 14,
            display: "grid",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-subtle)" }}>Geen code ontvangen?</p>
          {cooldown > 0 ? (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid var(--panel-border)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
                fontSize: 13.5,
                padding: "12px 14px",
              }}
            >
              Opnieuw over {cooldown}s
            </div>
          ) : (
            <Button
              variant="secondary"
              full
              onClick={() => {
                onResend();
                restartCooldown();
                setSecondsLeft(15 * 60);
              }}
              icon={<Refresh s={16} />}
            >
              Code opnieuw sturen
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onChangeAddress}>
            Verkeerd adres? Opnieuw invoeren
          </Button>
        </section>
      </article>
    </AuthShell>
  );
}

type LoginScreenProps = {
  fromIntake?: boolean;
};

export default function LoginScreen({ fromIntake = false }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [view, setView] = useState<"login" | "code">("login");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoSendAttemptedRef = useRef(false);
  const isEmailValid = useMemo(() => isValidEmail(email), [email]);

  const requestLoginCode = async (
    targetEmail?: string,
    options?: { consent?: boolean },
  ): Promise<boolean> => {
    const addr = targetEmail ?? email;
    const useConsent = options?.consent ?? consent;
    const response = await fetch("/api/account/request-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: addr,
        consent: useConsent,
        website,
      }),
    });

    if (response.status === 200) {
      setErrorMessage(null);
      setView("code");
      return true;
    }

    if (response.status === 429) {
      setErrorMessage("Te veel pogingen, probeer het zo opnieuw.");
      return false;
    }

    setErrorMessage("Er ging iets mis.");
    return false;
  };

  useEffect(() => {
    if (!fromIntake) {
      return;
    }

    clarityTag("login_source", "intake_result");

    const storedEmail = readStoredContactEmail();
    const hasEmail = isValidEmail(storedEmail);

    if (storedEmail) {
      setEmail(storedEmail);
      setConsent(true);
    }

    trackEvent(GA4_EVENTS.INTAKE_LOGIN_BRIDGE_VIEWED, {
      has_email: hasEmail,
      auto_sent: hasEmail,
    });

    if (!hasEmail || autoSendAttemptedRef.current) {
      return;
    }

    autoSendAttemptedRef.current = true;
    setIsAutoSending(true);

    void (async () => {
      try {
        await requestLoginCode(storedEmail, { consent: true });
      } catch {
        setErrorMessage("Er ging iets mis.");
      } finally {
        setIsAutoSending(false);
      }
    })();
  }, [fromIntake]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await requestLoginCode();
    } catch {
      setErrorMessage("Er ging iets mis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === "code") {
    return (
      <CodeEntryView
        email={email}
        onResend={() => {
          void requestLoginCode();
        }}
        onChangeAddress={() => setView("login")}
      />
    );
  }

  if (isAutoSending) {
    return (
      <AuthShell>
        <article
          style={{
            border: "1px solid var(--panel-border)",
            background: "var(--panel)",
            borderRadius: 22,
            padding: "24px 22px",
            display: "grid",
            gap: 18,
          }}
        >
          <header style={{ display: "grid", gap: 10 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>
              Bedankt voor het invullen van de Leefstijlcheck.
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
              We sturen je inlogcode naar{" "}
              <span style={{ color: "var(--text)" }}>{email}</span>…
            </p>
          </header>
        </article>
      </AuthShell>
    );
  }

  const loginTitle = fromIntake
    ? "Bedankt voor het invullen van de Leefstijlcheck."
    : "Welkom terug.";
  const loginLead = fromIntake
    ? "We sturen een inlogcode naar je mail — geen wachtwoord nodig."
    : "Vul je e-mailadres in — je krijgt een 6-cijferige inlogcode in je mail. Geen wachtwoord, geen account-gedoe; je e-mail is genoeg.";

  return (
    <AuthShell>
      <article
        style={{
          border: "1px solid var(--panel-border)",
          background: "var(--panel)",
          borderRadius: 22,
          padding: "24px 22px",
          display: "grid",
          gap: 18,
        }}
      >
        <header style={{ display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>
            {loginTitle}
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            {loginLead}
          </p>
        </header>

        <form onSubmit={handleSend} style={{ display: "grid", gap: 14 }}>
          <TextField
            label="E-mailadres"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="je@email.nl"
            autoFocus
            icon={<Mail s={17} />}
          />
          <Checkbox checked={consent} onChange={setConsent}>
            Ik wil dat mijn check-ins bewaard worden zodat mijn account onthoudt wat ik eerder invulde. Opt-in, op elk
            moment intrekbaar.
          </Checkbox>
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            name="website"
            type="text"
            style={{
              position: "absolute",
              left: "-9999px",
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
          />
          {errorMessage ? (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>{errorMessage}</p>
          ) : null}
          <Button type="submit" full disabled={!isEmailValid || isSubmitting} iconRight={<ArrowRight s={16} />}>
            Stuur inlogcode
          </Button>
        </form>

        <section style={{ borderTop: "1px solid var(--divider)", paddingTop: 14, display: "grid", gap: 10 }}>
          <TrustLine icon={<Lock s={15} />}>Geen wachtwoord. De code is veilig en 15 minuten geldig.</TrustLine>
          <TrustLine icon={<Shield s={15} />}>Geen spam. Je e-mail wordt alleen gebruikt om je in te loggen.</TrustLine>
          {!fromIntake ? (
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-subtle)" }}>
              Nieuw hier?{" "}
              <Link href="/hoe-werkt-dashboard" style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 2 }}>
                Bekijk hoe het dashboard werkt
              </Link>
              .
            </p>
          ) : null}
        </section>
      </article>
    </AuthShell>
  );
}
