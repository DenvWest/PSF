import type { Metadata } from "next";
import { Suspense } from "react";
import NutritionCapture from "@/components/intake/NutritionCapture";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Wat mis je? — PerfectSupplement";
const DESCRIPTION =
  "Beantwoord een paar korte vragen over wat je doorgaans eet en zie welke voedingsstoffen je waarschijnlijk mist — met wat je eraan kunt doen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake/voeding"),
  ...basicOpenGraph({ path: "/intake/voeding", title: TITLE, description: DESCRIPTION }),
};

function NutritionCaptureFallback() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center"
      aria-hidden
    />
  );
}

export default function VoedingPage() {
  return (
    <Suspense fallback={<NutritionCaptureFallback />}>
      <NutritionCapture />
    </Suspense>
  );
}
