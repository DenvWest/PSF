import { Suspense } from "react";
import NutritionResultsReturnLink from "@/components/intake/NutritionResultsReturnLink";

export function NutritionResultsReturnBanner() {
  return (
    <Suspense fallback={null}>
      <NutritionResultsReturnLink />
    </Suspense>
  );
}
