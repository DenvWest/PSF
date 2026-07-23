import type { ReactNode } from "react";

type CockpitTileProps = {
  eyebrow?: string;
  /** Rechtsboven naast de eyebrow (bijv. een readout-cijfer). */
  aside?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

/**
 * Eén tegel binnen een CockpitShell — donkere sub-kaart in preview-taal.
 * Eyebrow-stijl gelijk aan MovementDashboardPreview.
 */
export default function CockpitTile({
  eyebrow,
  aside,
  children,
  ariaLabel,
  className = "",
}: CockpitTileProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}
    >
      {eyebrow || aside ? (
        <div className="flex items-center justify-between gap-3">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              {eyebrow}
            </p>
          ) : (
            <span />
          )}
          {aside}
        </div>
      ) : null}
      {children}
    </div>
  );
}
