"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import {
  hasNutritionReturnParam,
  nutritionResultsHref,
} from "@/lib/nutrition-return-link";

export default function NutritionResultsReturnLink() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  if (!hasNutritionReturnParam(params)) {
    return null;
  }

  const origin = params.from === "dashboard" ? "dashboard" : undefined;

  return (
    <nav aria-label="Terug naar voedingscheck-resultaat" className="mb-6">
      <Link
        href={nutritionResultsHref(origin)}
        onClick={() => {
          trackEvent(GA4_EVENTS.NUTRITION_ONDERBOUWING_RETURN_CLICK, {
            surface: "onderbouwing",
          });
          clarityTag("nutrition_result_reopen", "onderbouwing_return");
        }}
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-700"
      >
        ← Terug naar je voedingscheck-resultaat
      </Link>
    </nav>
  );
}
