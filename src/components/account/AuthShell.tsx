import type { ReactNode } from "react";
import Link from "next/link";
import DashboardBackLink from "@/components/app/DashboardBackLink";
import ExitButton from "@/components/app/ExitButton";
import Wordmark from "@/components/app/Wordmark";

type AuthShellProps = {
  children: ReactNode;
  exitHref?: string;
};

function AuthFooter() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--divider)",
        paddingTop: 14,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        color: "var(--text-subtle)",
        fontSize: 11.5,
        lineHeight: 1.4,
      }}
    >
      <span>Adviezen, geen diagnoses.</span>
      <span>Onafhankelijk · AVG-proof</span>
    </footer>
  );
}

type TrustLineProps = {
  icon: ReactNode;
  children: ReactNode;
};

export function TrustLine({ icon, children }: TrustLineProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text-muted)" }}>
      <span
        style={{
          color: "var(--sage)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

export function AuthShell({ children, exitHref = "/" }: AuthShellProps) {
  return (
    <main
      style={{
        position: "relative",
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(28px, 7vh, 72px) 18px calc(22px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: -110,
          left: "50%",
          transform: "translateX(-50%)",
          width: 560,
          height: 420,
          background: "radial-gradient(circle, rgba(90,143,106,0.14) 0%, rgba(26,46,26,0) 66%)",
        }}
      />
      <section
        aria-label="Account toegang"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 408,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <header
          style={{
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link href="/" aria-label="Naar de homepage" style={{ textDecoration: "none" }}>
            <Wordmark />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {exitHref === "/dashboard" ? <DashboardBackLink surface="account" /> : null}
            <ExitButton href={exitHref} label={exitHref === "/" ? "Naar de website" : "Terug naar dashboard"} />
          </div>
        </header>
        {children}
        <AuthFooter />
      </section>
    </main>
  );
}
