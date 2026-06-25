"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import LinkExpiredScreen from "@/components/account/LinkExpiredScreen";
import { Shield } from "@/components/app/icons";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE_RE = /^\d{6}$/;

type VerifyAccountScreenProps = {
  aid: string | null;
  code: string | null;
};

export default function VerifyAccountScreen({ aid, code }: VerifyAccountScreenProps) {
  const router = useRouter();
  const isValidParams = Boolean(aid && UUID_RE.test(aid) && code && CODE_RE.test(code));
  const [failed, setFailed] = useState(!isValidParams);

  useEffect(() => {
    if (!isValidParams) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/account/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aid, code }),
        });

        if (cancelled) {
          return;
        }

        if (response.status === 200) {
          router.replace("/dashboard");
          return;
        }

        setFailed(true);
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [aid, code, isValidParams, router]);

  if (failed) {
    return <LinkExpiredScreen />;
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
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 18,
            background: "rgba(90,143,106,0.18)",
            border: "1px solid rgba(90,143,106,0.38)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sage)",
          }}
        >
          <Shield s={29} />
        </div>
        <header style={{ display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>
            Je wordt ingelogd…
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Een moment, we verifiëren je link.
          </p>
        </header>
      </article>
    </AuthShell>
  );
}
