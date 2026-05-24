import { Suspense } from "react";
import IntakeResultsReturnLink from "@/components/intake/IntakeResultsReturnLink";

export function IntakeResultsReturnBanner() {
  return (
    <Suspense fallback={null}>
      <IntakeResultsReturnLink />
    </Suspense>
  );
}
