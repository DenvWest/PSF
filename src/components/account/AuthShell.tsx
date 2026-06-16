import type { ReactNode } from "react";
import Wordmark from "@/components/app/Wordmark";

type AuthShellProps = {
  children: ReactNode;
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

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(28px, 7vh, 72px) 18px 22px",
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
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <header style={{ marginBottom: 6 }}>
          <Wordmark />
        </header>
        {children}
        <AuthFooter />
      </section>
    </main>
  );
}
