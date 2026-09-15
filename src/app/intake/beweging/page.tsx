import type { Metadata } from "next";
import { Suspense } from "react";
import MovementCapture from "@/components/intake/MovementCapture";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Beweeg-check — PerfectSupplement";
const DESCRIPTION =
  "Twee korte vragen over wat je nu aan beweging doet. Je ziet direct waar winst zit en kiest zelf je eerste stap — geen schema, geen verplichting.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake/beweging"),
  ...basicOpenGraph({ path: "/intake/beweging", title: TITLE, description: DESCRIPTION }),
};

function MovementCaptureFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-intake-ink-subtle">Even laden…</p>
    </div>
  );
}

export default function BewegingPage() {
  return (
    <Suspense fallback={<MovementCaptureFallback />}>
      <MovementCapture />
    </Suspense>
  );
}
