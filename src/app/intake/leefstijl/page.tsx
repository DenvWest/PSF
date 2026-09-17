import { Suspense } from "react";
import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";
import { INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";
import IntakeClient from "../IntakeClient";

/**
 * De brede leefstijlcheck — tot 17 september 2026 de inhoud van
 * `/intake`, nu een eigen route die niet meer wordt aangeboden.
 *
 * Hij blijft bestaan omdat bestaande sessies eraan hangen: de scoring-engine,
 * `RULES_VERSION 1.4.0` en de hermeting-deltalogica lezen zijn antwoorden.
 * Weghalen zou die geschiedenis onleesbaar maken. Wat verdween is de ingang,
 * niet de code — hetzelfde patroon als /inzichten in juni.
 *
 * Zie BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md §3.9.
 */

const TITLE = "Leefstijlcheck voor 30-plussers";
const DESCRIPTION = `18 vragen, 3 minuten: persoonlijk inzicht in slaap, stress, energie en herstel. Gratis, anoniem — geen diagnose, wel een ${INTAKE_DELIVERABLE.intakeMetadataSuffix}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake/leefstijl"),
  ...basicOpenGraph({ path: "/intake/leefstijl", title: TITLE, description: DESCRIPTION }),
  robots: { index: false, follow: true },
};

function IntakeLoadingFallback() {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
          role="status"
          aria-label="Laden"
        />
        <span className="text-sm text-white/60">Laden&hellip;</span>
      </div>
    </div>
  );
}

export default function LeefstijlcheckPage() {
  return (
    <Suspense fallback={<IntakeLoadingFallback />}>
      <IntakeClient />
    </Suspense>
  );
}
