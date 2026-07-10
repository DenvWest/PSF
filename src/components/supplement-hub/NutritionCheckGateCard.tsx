"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

type NutritionCheckGateCardProps = {
  href?: string;
};

export default function NutritionCheckGateCard({
  href = "/intake/voeding?from=supplementen",
}: NutritionCheckGateCardProps) {
  function handleCtaClick() {
    trackEvent("hub_voedingscheck_cta_click", { surface: "supplementen_hub" });
  }

  return (
    <div className="rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-8 py-10 md:px-12 md:py-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
        Jouw volgende stap
      </h2>

      <ol className="mt-6 space-y-3" aria-label="Voortgang naar supplementadvies">
        <li className="flex items-start gap-3 text-base text-stone-700">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5A8F6A] text-xs font-bold text-white"
            aria-hidden
          >
            ✓
          </span>
          <span>
            <span className="font-semibold text-stone-900">Stap 1</span>
            {" — "}
            Leefstijlcheck gedaan
          </span>
        </li>
        <li className="flex items-start gap-3 text-base text-stone-700">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#5A8F6A] text-xs font-bold text-[#3D6B4F]"
            aria-hidden
          >
            2
          </span>
          <span>
            <span className="font-semibold text-stone-900">Stap 2</span>
            {" — "}
            Voedingscheck (±3 min)
          </span>
        </li>
      </ol>

      <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-600">
        Supplementadvies tonen we pas als we weten wat er op je bord tekortschiet
        — eerst voeding, dan gericht vergelijken.
      </p>

      <div className="mt-6">
        <Link
          href={href}
          onClick={handleCtaClick}
          className="inline-flex items-center gap-2 rounded-xl bg-ps-green px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
        >
          Doe de voedingscheck →
        </Link>
      </div>

      <p className="mt-4 text-sm text-stone-500">
        Geen diagnose · geen account verplicht
      </p>
    </div>
  );
}

export function EmptyAfterNutritionCheck() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-8 py-10 md:px-12 md:py-12">
      <h2 className="font-display text-2xl text-stone-900">
        Je basis zit goed
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-stone-600">
        Uit je voedingscheck volgt geen supplement-prioriteit. Blijf je bord
        centraal houden — vergelijk alleen als je situatie verandert.
      </p>
      <p className="mt-4 text-sm text-stone-500">
        Algemene oriëntatie — geen persoonlijk medisch advies.
      </p>
    </div>
  );
}
