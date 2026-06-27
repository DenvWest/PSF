import type { Metadata } from "next";
import { Suspense } from "react";
import NutritionCapture from "@/components/intake/NutritionCapture";

export const metadata: Metadata = {
  title: "Voedingscheck — PerfectSupplement",
  description:
    "Beantwoord 6 korte vragen over wat je doorgaans eet en ontvang direct een persoonlijke inname-inschatting en leefstijladvies.",
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
