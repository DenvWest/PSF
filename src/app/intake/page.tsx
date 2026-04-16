import { Suspense } from "react";
import IntakeClient from "./IntakeClient";

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
