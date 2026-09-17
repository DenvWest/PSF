import { Suspense } from "react";
import type { Metadata } from "next";
import NutritionCapture from "@/components/intake/NutritionCapture";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

/**
 * `/intake` is de voedingscheck.
 *
 * Tot 17 september 2026 stond hier de brede leefstijlcheck over acht
 * categorieën. Die woont nu op `/intake/leefstijl` en wordt niet meer
 * aangeboden — zie BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md §3.9.
 *
 * De reden in één zin: van de twee checks leidt alleen deze naar een
 * `/beste/*`-pagina, en dat is waar dit product zijn oordeel publiceert.
 * De lange check meet daarnaast vier domeinen die sinds juni al niet meer in
 * de navigatie staan.
 *
 * Samenvoegen was de andere optie en is afgewezen: dat maakt de check langer
 * terwijl korter de opgave was.
 */

const TITLE = "Wat mis je? — PerfectSupplement";
const DESCRIPTION =
  "Beantwoord een paar korte vragen over wat je doorgaans eet en zie welke voedingsstoffen je waarschijnlijk mist — met wat je eraan kunt doen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake"),
  ...basicOpenGraph({ path: "/intake", title: TITLE, description: DESCRIPTION }),
};

function NutritionCaptureFallback() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center"
      aria-hidden
    />
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<NutritionCaptureFallback />}>
      <NutritionCapture />
    </Suspense>
  );
}
