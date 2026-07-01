"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, TrustLine } from "@/components/account/AuthShell";
import { ArrowRight, Lock, Mail, Refresh, Shield } from "@/components/app/icons";
import { Button, Checkbox, TextField } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent, trackOnderbouwingLinkClick } from "@/lib/ga4";
import type { AccountLoginFrom } from "@/lib/account-login-href";
import { NURTURE_DAY0_DASHBOARD_REF } from "@/lib/nurture-dashboard-url";
import { INTAKE_CTA } from "@/lib/intake-product-copy";
import { getLastSession } from "@/lib/intake-storage";
import {
  resolveLoginPrimaryAction,
  type LoginPrimaryAction,
} from "@/lib/login-primary-action";

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
  loginFrom?: AccountLoginFrom | "default";
  nurtureRef?: string | null;
};

export default function LoginScreen({
  loginFrom = "default",
  nurtureRef = null,
}: LoginScreenProps) {
  const router = useRouter();
  const fromIntake = loginFrom === "intake";
  const fromVoortgang = loginFrom === "voortgang";
  const [email, setEmail] = useState(() =>
    fromIntake ? readStoredContactEmail() : "",
  );
  const [consent, setConsent] = useState(() => {
    if (!fromIntake) {
      return true;
    }
    return Boolean(readStoredContactEmail());
  });
  const [hasIntakeSession, setHasIntakeSession] = useState(fromIntake);
  const [fetchedEligibility, setFetchedEligibility] = useState<{
    email: string;
    eligible: boolean;
  } | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [view, setView] = useState<"login" | "code">("login");
  const [forceLogin, setForceLogin] = useState(false);
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoSendAttemptedRef = useRef(false);
  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const shouldCheckEligibility = !fromIntake && !hasIntakeSession && isEmailValid;
  const emailEligibleForLogin = useMemo(() => {
    if (!shouldCheckEligibility) {
      return null;
    }
    if (fetchedEligibility?.email === email) {
      return fetchedEligibility.eligible;
    }
    return null;
  }, [shouldCheckEligibility, fetchedEligibility, email]);
  const primaryAction = useMemo(
    () =>
      resolveLoginPrimaryAction({
        fromIntake,
        hasIntakeSession,
        emailEligibleForLogin,
        emailValid: isEmailValid,
      }),
    [emailEligibleForLogin, fromIntake, hasIntakeSession, isEmailValid],
  );
  const isLoginAction = forceLogin || primaryAction === "login";

  const requestLoginCode = useCallback(
    async (
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
    },
    [consent, email, website],
  );

  useEffect(() => {
    if (fromIntake) {
      return;
    }

    let cancelled = false;
    void getLastSession().then((loaded) => {
      if (!cancelled) {
        setHasIntakeSession(Boolean(loaded?.session));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fromIntake]);

  useEffect(() => {
    if (!shouldCheckEligibility) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsCheckingEligibility(true);
      void (async () => {
        try {
          const response = await fetch("/api/account/login-eligibility", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
            signal: controller.signal,
          });
          const json = (await response.json().catch(() => null)) as
            | { primaryAction?: LoginPrimaryAction }
            | null;
          if (!controller.signal.aborted) {
            setFetchedEligibility({
              email,
              eligible: json?.primaryAction === "login",
            });
          }
        } catch {
          if (!controller.signal.aborted) {
            setFetchedEligibility(null);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsCheckingEligibility(false);
          }
        }
      })();
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [email, shouldCheckEligibility]);

  useEffect(() => {
    clarityTag("login_primary_action", primaryAction);
  }, [primaryAction]);

  useEffect(() => {
    if (nurtureRef === NURTURE_DAY0_DASHBOARD_REF) {
      trackEvent(GA4_EVENTS.NURTURE_DASHBOARD_CTA_CLICKED, {
        source: "day0_email",
      });
    }
  }, [nurtureRef]);

  useEffect(() => {
    if (fromIntake) {
      clarityTag("login_source", "intake_result");

      const storedEmail = readStoredContactEmail();
      const hasEmail = isValidEmail(storedEmail);

      trackEvent(GA4_EVENTS.INTAKE_LOGIN_BRIDGE_VIEWED, {
        has_email: hasEmail,
        auto_sent: hasEmail,
        source: "intake",
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
      return;
    }

    if (fromVoortgang) {
      clarityTag("login_source", "voortgang");
      trackEvent(GA4_EVENTS.INTAKE_LOGIN_BRIDGE_VIEWED, {
        has_email: false,
        auto_sent: false,
        source: "voortgang",
      });
    }
  }, [fromIntake, fromVoortgang, requestLoginCode]);

  const handlePrimarySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!isLoginAction) {
      trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
        source: fromVoortgang ? "login_voortgang" : "login_screen",
      });
      router.push("/intake");
      return;
    }

    if (!isEmailValid) {
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
    : fromVoortgang
      ? "Log in of start je check"
      : "Welkom terug.";
  const loginLead = fromIntake
    ? "Sla je resultaten op in je persoonlijke dashboard. We sturen een inlogcode naar je mail — geen wachtwoord nodig."
    : isLoginAction
      ? "Vul je e-mailadres in — je krijgt een 6-cijferige inlogcode in je mail. Geen wachtwoord nodig."
      : fromVoortgang
        ? "Nog geen Leefstijlcheck gedaan? Start gratis (3 min). Heb je al een account? Vul je e-mail in om in te loggen."
        : "Nog geen check gedaan? Start de Leefstijlcheck. Heb je al een account? Vul je e-mail in om in te loggen.";
  const primaryButtonLabel = isLoginAction
    ? "Stuur inlogcode"
    : INTAKE_CTA.startCheck;
  const primaryButtonDisabled = isLoginAction
    ? !isEmailValid || isSubmitting || isCheckingEligibility
    : isSubmitting || isCheckingEligibility;

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

        <form onSubmit={handlePrimarySubmit} style={{ display: "grid", gap: 14 }}>
          <TextField
            label="E-mailadres"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="je@email.nl"
            autoFocus
            icon={<Mail s={17} />}
          />
          {isLoginAction ? (
            <Checkbox checked={consent} onChange={setConsent}>
              Ik wil dat mijn check-ins bewaard worden zodat mijn account onthoudt wat ik eerder invulde. Opt-in, op elk
              moment intrekbaar.
            </Checkbox>
          ) : null}
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
          <Button
            type="submit"
            full
            disabled={primaryButtonDisabled}
            iconRight={<ArrowRight s={16} />}
          >
            {primaryButtonLabel}
          </Button>
        </form>

        <section style={{ borderTop: "1px solid var(--divider)", paddingTop: 14, display: "grid", gap: 10 }}>
          {isLoginAction ? (
            <>
              <TrustLine icon={<Lock s={15} />}>Geen wachtwoord. De code is veilig en 15 minuten geldig.</TrustLine>
              <TrustLine icon={<Shield s={15} />}>Geen spam. Je e-mail wordt alleen gebruikt om je in te loggen.</TrustLine>
            </>
          ) : (
            <TrustLine icon={<Shield s={15} />}>Gratis · 3 minuten · geen account nodig voor je resultaat</TrustLine>
          )}
          {!fromIntake && !fromVoortgang && !isLoginAction ? (
            <>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-subtle)" }}>
                Nieuw hier?{" "}
                <Link href="/hoe-werkt-dashboard" style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Bekijk hoe het dashboard werkt
                </Link>
                {" · "}
                <Link
                  href="/onderbouwing"
                  onClick={() => {
                    trackOnderbouwingLinkClick({ surface: "login_help" });
                    clarityTag("onderbouwing_link", "login_help");
                  }}
                  style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  Onderbouwing
                </Link>
                .
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--text-subtle)" }}>
                Al een account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setForceLogin(true);
                    clarityTag("login_intent", "manual_login_link");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    color: "var(--text)",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    cursor: "pointer",
                  }}
                >
                  Log direct in
                </button>
              </p>
            </>
          ) : null}
        </section>
      </article>
    </AuthShell>
  );
}
