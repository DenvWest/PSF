"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { NextStep, NextStepAction } from "@/lib/content-graph/next-step";

/**
 * Eén vervolgstap onder een contentpagina, met één regel eronder.
 *
 * Vervangt de stapel van vier CTA-blokken. De vorm zegt het verschil: de
 * primaire stap is een knop, de tweede is een zin met een link. Twee knoppen
 * naast elkaar zou de keuze teruggeven die dit blok juist wegneemt.
 *
 * Client component omdat het blok zijn eigen vertoning en klik meet — zonder
 * die meting zou een CTA op 151 pagina's landen zonder dat iemand kan aflezen
 * of hij werkt.
 */

type NextStepBlockProps = {
  step: NextStep;
  /** Slug of pad van de pagina waar dit blok op staat — de bron in de events. */
  node: string;
  nodeType: string;
};

function payloadFor(
  node: string,
  nodeType: string,
  action: NextStepAction,
  positie: "primary" | "secondary",
) {
  return {
    node,
    node_type: nodeType,
    step_kind: action.kind,
    target: action.target,
    positie,
  };
}

export default function NextStepBlock({
  step,
  node,
  nodeType,
}: NextStepBlockProps) {
  const gemeld = useRef(false);

  useEffect(() => {
    if (gemeld.current) return;
    gemeld.current = true;
    emitIntakeClientEvent(
      "content.next_step_shown",
      payloadFor(node, nodeType, step.primary, "primary"),
    );
    trackEvent("content_next_step_shown", {
      node_type: nodeType,
      step_kind: step.primary.kind,
      target: step.primary.target,
    });
    clarityTag("content_next_step", step.primary.target);
  }, [node, nodeType, step]);

  function meldKlik(action: NextStepAction, positie: "primary" | "secondary") {
    emitIntakeClientEvent(
      "content.next_step_clicked",
      payloadFor(node, nodeType, action, positie),
    );
    trackEvent("content_next_step_clicked", {
      node_type: nodeType,
      step_kind: action.kind,
      target: action.target,
      positie,
    });
  }

  return (
    <aside
      aria-label="Volgende stap"
      className="rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-6 py-7 md:px-8 md:py-8"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ps-green">
        Je volgende stap
      </p>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-stone-700 md:text-base">
        {step.primary.reasonNl}
      </p>
      <Link
        href={step.primary.href}
        onClick={() => meldKlik(step.primary, "primary")}
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md md:text-base"
      >
        {step.primary.label}
        <span aria-hidden="true">→</span>
      </Link>

      {step.secondary ? (
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Liever het hele plaatje?{" "}
          <Link
            href={step.secondary.href}
            onClick={() => meldKlik(step.secondary!, "secondary")}
            className="font-medium text-emerald-800 underline decoration-emerald-700/35 underline-offset-[3px] transition hover:decoration-emerald-800"
          >
            {step.secondary.label}
          </Link>
          .
        </p>
      ) : null}
    </aside>
  );
}
