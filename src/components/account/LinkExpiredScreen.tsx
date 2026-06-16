"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { ArrowRight, Clock } from "@/components/app/icons";
import { Button } from "@/components/app/primitives";

export default function LinkExpiredScreen() {
  const router = useRouter();

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
            background: "rgba(200,149,108,0.18)",
            border: "1px solid rgba(200,149,108,0.38)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--terra)",
          }}
        >
          <Clock s={29} />
        </div>
        <header style={{ display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: 33, lineHeight: 1.1 }}>
            Deze link werkt niet meer.
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Inloglinks zijn 15 minuten geldig en kunnen maar een keer gebruikt worden. Dat houdt je account veilig.
          </p>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65 }}>
            Vraag een nieuwe link aan met hetzelfde e-mailadres.
          </p>
        </header>
        <Button full iconRight={<ArrowRight s={16} />} onClick={() => router.push("/account/login")}>
          Nieuwe link aanvragen
        </Button>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--text-subtle)" }}>
          Je wordt teruggestuurd naar het inlogscherm.
        </p>
      </article>
    </AuthShell>
  );
}
