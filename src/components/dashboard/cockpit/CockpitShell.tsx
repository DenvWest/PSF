import type { CSSProperties, ReactNode } from "react";

type CockpitShellProps = {
  /** Domein-accent (CSS-kleur) — beschikbaar als `var(--ac)` binnen de shell. */
  accent: string;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  /** Geen outer panel — page/CockpitFrame levert al de atmosfeer. */
  embedded?: boolean;
};

/**
 * Donker cockpit-paneel in de preview-taal (MovementDashboardPreview):
 * forest-gradient, fijne grid-overlay met radial-mask en accent-glow.
 * Gebruikt door Beweging en Dagboek/Mijn Dag.
 *
 * De gradient loopt sinds 23 september 2026 over de gedeelde `--vd-bg`/
 * `--vd-surface`-tokens uit `globals.css` in plaats van eigen hex — dezelfde
 * tokens die Dagboek en Je patroon dragen, zodat er geen los kleurenpaar meer
 * buiten dat systeem om bestaat.
 */
export default function CockpitShell({
  accent,
  children,
  ariaLabel,
  className = "",
  embedded = false,
}: CockpitShellProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={
        embedded
          ? `relative ${className}`
          : `relative overflow-hidden rounded-[28px] border border-white/10 p-5 sm:p-6 ${className}`
      }
      style={
        embedded
          ? ({ "--ac": accent } as CSSProperties)
          : ({
              "--ac": accent,
              background: "linear-gradient(160deg, var(--vd-surface), var(--vd-bg))",
            } as CSSProperties)
      }
    >
      {!embedded ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(720px 420px at 65% 0%, #000, transparent 78%)",
            WebkitMaskImage: "radial-gradient(720px 420px at 65% 0%, #000, transparent 78%)",
          }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}
