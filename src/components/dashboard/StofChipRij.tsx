"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * De stofchips van Keuze en Patroon in één rij die op een telefoon zijdelings
 * scrolt in plaats van over zeven regels te wrappen. De gekozen chip schuift
 * in beeld; rechts toont een vervaging dat er meer is. Vanaf `sm` wrapt de rij
 * gewoon weer.
 */
export default function StofChipRij({
  as: Tag = "div",
  label,
  actief,
  children,
}: {
  as?: "div" | "nav";
  label: string;
  /** Verandert wanneer een andere chip gekozen is; dan scrolt die in beeld. */
  actief: string | null;
  children: ReactNode;
}) {
  const rij = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const gekozen = rij.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const container = rij.current;
    if (!gekozen || !container || container.scrollWidth <= container.clientWidth) return;
    const links = gekozen.offsetLeft - (container.clientWidth - gekozen.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, links), behavior: "smooth" });
  }, [actief]);

  const klasse =
    "mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] sm:flex-wrap sm:overflow-visible [&>*]:shrink-0";

  return Tag === "nav" ? (
    <nav ref={rij as React.RefObject<HTMLElement>} aria-label={label} className={klasse}>
      {children}
    </nav>
  ) : (
    <div ref={rij as React.RefObject<HTMLDivElement>} role="group" aria-label={label} className={klasse}>
      {children}
    </div>
  );
}
