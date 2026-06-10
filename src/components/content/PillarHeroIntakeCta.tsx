"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  hasIntakeReturnParam,
  INTAKE_RESULTS_HREF,
} from "@/lib/intake-return-link";

type Props = { defaultLabel: string };

const BTN_CLASS =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-700 px-8 py-3 text-sm font-semibold text-white no-underline hover:bg-green-800 transition-colors";

function PillarHeroIntakeCtaInner({ defaultLabel }: Props) {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  if (hasIntakeReturnParam(params)) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Link href={INTAKE_RESULTS_HREF} className={BTN_CLASS}>
          ← Bekijk je resultaten
        </Link>
        <Link
          href="/intake"
          className="text-sm font-medium text-green-700 underline decoration-green-700/35 underline-offset-[3px] hover:decoration-green-700"
        >
          Of doe de check opnieuw →
        </Link>
      </div>
    );
  }

  return (
    <Link href="/intake" className={BTN_CLASS}>
      {defaultLabel}
    </Link>
  );
}

export default function PillarHeroIntakeCta({ defaultLabel }: Props) {
  return (
    <Suspense
      fallback={
        <Link href="/intake" className={BTN_CLASS}>
          {defaultLabel}
        </Link>
      }
    >
      <PillarHeroIntakeCtaInner defaultLabel={defaultLabel} />
    </Suspense>
  );
}
