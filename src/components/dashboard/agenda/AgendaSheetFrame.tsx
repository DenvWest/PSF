"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type AgendaSheetFrameProps = {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Eén dark sheet-chrome voor alle Mijn Dag-sheets: bottom sheet op mobiel met
 * safe-area, zijpaneel vanaf md. Vervangt drie losse cream-sheets.
 */
export default function AgendaSheetFrame({
  titleId,
  title,
  onClose,
  children,
  footer,
}: AgendaSheetFrameProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-none bg-black/60 backdrop-blur-[2px]"
        aria-label="Sluiten"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-white/10 bg-[#16281a] shadow-[0_-12px_48px_rgba(0,0,0,0.45)] outline-none md:bottom-auto md:left-auto md:top-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-6">
          <h2
            id={titleId}
            className="m-0 text-[15px] font-semibold text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[16px] leading-none text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
