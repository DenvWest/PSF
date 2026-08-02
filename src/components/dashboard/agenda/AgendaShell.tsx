import type { CSSProperties, ReactNode } from "react";

type AgendaShellProps = {
  accentColor: string;
  children: ReactNode;
};

/**
 * Full-bleed surface: Mijn Dag is een pagina in de dark cockpit-wereld, geen
 * lichte kaart-in-kaart. De accentkleur reist mee als CSS-var zodat losse
 * onderdelen hem kunnen lenen zonder prop-drilling.
 */
export default function AgendaShell({ accentColor, children }: AgendaShellProps) {
  return (
    <section
      aria-label="Mijn dag"
      className="min-w-0"
      style={{ "--agenda-accent": accentColor } as CSSProperties}
    >
      {children}
    </section>
  );
}

export function AgendaShellSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-white/10 py-4 first:border-t-0 ${className}`}>
      {children}
    </div>
  );
}
