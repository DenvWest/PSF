import type { Metadata } from "next";
import { Suspense } from "react";
import MovementCapture from "@/components/intake/MovementCapture";

export const metadata: Metadata = {
  title: "Beweeg-check — PerfectSupplement",
  description:
    "Twee korte vragen over wat je nu aan beweging doet. Je ziet direct waar winst zit en kiest zelf je eerste stap — geen schema, geen verplichting.",
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
