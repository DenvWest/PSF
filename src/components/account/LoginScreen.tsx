"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthShell, TrustLine } from "@/components/account/AuthShell";
import { ArrowRight, Lock, Mail, MailOpen, Refresh, Shield } from "@/components/app/icons";
import { Button, Checkbox, TextField } from "@/components/app/primitives";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

type MailSentViewProps = {
  email: string;
  onResend: () => void;
  onChangeAddress: () => void;
};

function MailSentView({ email, onResend, onChangeAddress }: MailSentViewProps) {
  const [cooldown, setCooldown] = useState(30);

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

  const restartCooldown = () => setCooldown(30);

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
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 18,
            background: "rgba(90,143,106,0.2)",
            border: "1px solid rgba(90,143,106,0.35)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sage)",
          }}
        >
          <MailOpen s={29} />
        </div>
        <header style={{ display: "grid", gap: 8 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>Kijk even in je inbox.</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Als dit e-mailadres bij ons bekend is, sturen we je direct een veilige inloglink. Om je privacy te beschermen,
            laten we niet weten of een adres bestaat.
          </p>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Check <span style={{ color: "var(--text)" }}>{email}</span> - ook je spamfolder. De link is 15 minuten geldig
            en eenmalig te gebruiken.
          </p>
        </header>
        <section
          style={{
            borderTop: "1px solid var(--divider)",
            paddingTop: 14,
            display: "grid",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-subtle)" }}>Geen mail ontvangen?</p>
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
              }}
              icon={<Refresh s={16} />}
            >
              Mail opnieuw sturen
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [view, setView] = useState<"login" | "mail-sent">("login");
  const isEmailValid = useMemo(() => isValidEmail(email), [email]);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailValid) {
      return;
    }

    // TODO F1.2: POST /api/account/request-link
    // TODO F1.2: account_storage-consent meesturen
    void consent;
    setView("mail-sent");
  };

  if (view === "mail-sent") {
    return <MailSentView email={email} onResend={() => undefined} onChangeAddress={() => setView("login")} />;
  }

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
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>Welkom terug.</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Een plek die onthoudt hoe het met je gaat en wat je nodig hebt. Geen naam nodig. Je e-mailadres is genoeg.
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
          <Button type="submit" full disabled={!isEmailValid} iconRight={<ArrowRight s={16} />}>
            Stuur me een inloglink
          </Button>
        </form>

        <section style={{ borderTop: "1px solid var(--divider)", paddingTop: 14, display: "grid", gap: 10 }}>
          <TrustLine icon={<Lock s={15} />}>Geen wachtwoord. De link is veilig en 15 minuten geldig.</TrustLine>
          <TrustLine icon={<Shield s={15} />}>Geen spam. Je e-mail wordt alleen gebruikt om je in te loggen.</TrustLine>
        </section>
      </article>
    </AuthShell>
  );
}
