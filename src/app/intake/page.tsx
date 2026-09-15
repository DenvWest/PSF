import { Suspense } from "react";
import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";
import { INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";
import IntakeClient from "./IntakeClient";

const TITLE = "Gratis Leefstijlcheck voor 30-plussers";
const DESCRIPTION = `18 vragen, 3 minuten: persoonlijk inzicht in slaap, stress, energie en herstel. Gratis, anoniem — geen diagnose, wel een ${INTAKE_DELIVERABLE.intakeMetadataSuffix}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake"),
  ...basicOpenGraph({ path: "/intake", title: TITLE, description: DESCRIPTION }),
};

// useSearchParams() in IntakeClient requires a Suspense boundary; without it
// Next.js App Router will bail out during prerendering and fail the build.
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

export default function IntakePage() {
  return (
    <Suspense fallback={<IntakeLoadingFallback />}>
      <IntakeClient />
    </Suspense>
  );
}
