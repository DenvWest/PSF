"use client";

import {
  MOVEMENT_FOLLOWUP_ROUTES,
  MOVEMENT_STRIP_VARIANTS,
  type MovementFollowupRoute,
  type MovementStripVariant,
} from "@/data/movement-checkin";
import { trackEvent } from "@/lib/ga4";

const EVENT_TARGET: Record<MovementFollowupRoute, string> = {
  programma: "beweging_programma",
  voortgang: "voortgang_beweging",
  mijn_dag: "mijn_dag",
};

export type MovementFollowupStripProps = {
  variant: MovementStripVariant;
  programHref: string;
  voortgangHref: string;
  /** Alleen gevuld wanneer hij van het dashboard kwam; anders valt de route weg. */
  mijnDagHref: string | null;
};

/**
 * Waar PerfectSupplement je hierna naartoe brengt — geen actielijst en geen
 * keuze: wat je deze week doet staat op de doe-surface achter de eerste link,
 * want daar kun je het ook veranderen. Alles hier is een tekstlink; de enige
 * knop op het scherm is de programma-CTA in de readout (L6).
 *
 * Navigatie via een gewone `<a>`: de check-in is net weggeschreven en een soft
 * navigate zou het dashboard uit een verouderde RSC-cache kunnen serveren.
 */
export default function MovementFollowupStrip({
  variant,
  programHref,
  voortgangHref,
  mijnDagHref,
}: MovementFollowupStripProps) {
  const strip = MOVEMENT_STRIP_VARIANTS[variant];
  const routes: MovementFollowupRoute[] = [...strip.routes];
  if (mijnDagHref) {
    routes.push("mijn_dag");
  }

  const hrefFor: Record<MovementFollowupRoute, string | null> = {
    programma: programHref,
    voortgang: voortgangHref,
    mijn_dag: mijnDagHref,
  };

  return (
    <section
      aria-labelledby="movement-followup-heading"
      className="mt-5 rounded-[16px] border border-white/10 bg-black/20 px-4 pb-1 pt-4"
    >
      <h2
        id="movement-followup-heading"
        className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9CC5A9]"
      >
        {strip.heading}
      </h2>
      {strip.lines.map((line) => (
        <p key={line} className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0]">
          {line}
        </p>
      ))}

      <div className="mt-3.5">
        {routes.map((route) => {
          const href = hrefFor[route];
          if (!href) return null;
          const copy = MOVEMENT_FOLLOWUP_ROUTES[route];
          return (
            <a
              key={route}
              href={href}
              onClick={() =>
                trackEvent("movement_checkin_routing_click", {
                  target: EVENT_TARGET[route],
                  surface: "intake_beweging",
                  slot: "strip",
                })
              }
              className="block border-t border-white/[0.06] py-3 no-underline"
            >
              <span className="flex min-h-[24px] items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-[#9CC5A9]">{copy.label}</span>
                <span aria-hidden="true" className="text-[15px] text-[#7E8C82]">
                  ›
                </span>
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[#7E8C82]">
                {copy.hint}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
