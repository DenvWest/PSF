"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROFILE_SLUG_BY_LABEL } from "@/data/profiles";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildCheckLens,
  CHECK_LENS_COPY,
  type CheckLensModel,
  type CheckLensTarget,
} from "@/lib/check-lens";
import { getProfileLabel } from "@/lib/intake-engine";
import {
  hasIntakeReturnParam,
  INTAKE_RESULTS_HREF,
} from "@/lib/intake-return-link";
import { getLastSession } from "@/lib/intake-storage";

type CheckLensProps = {
  target: CheckLensTarget;
};

function surfaceOf(target: CheckLensTarget): string {
  return target.kind === "guide" ? `gids:${target.thema}` : `profiel:${target.slug}`;
}

function ReturnLink() {
  return (
    <Link
      href={INTAKE_RESULTS_HREF}
      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-700"
    >
      ← {CHECK_LENS_COPY.resultsLabel}
    </Link>
  );
}

export default function CheckLens({ target }: CheckLensProps) {
  const searchParams = useSearchParams();
  const fromIntake = hasIntakeReturnParam(Object.fromEntries(searchParams.entries()));
  const [lens, setLens] = useState<CheckLensModel | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!fromIntake) {
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const loaded = await getLastSession();
        if (cancelled || !loaded?.session) {
          return;
        }
        const { scores, answers } = loaded.session;
        const profile = getProfileLabel(scores);
        setLens(
          buildCheckLens(target, {
            scores,
            answers,
            ownProfileSlug: PROFILE_SLUG_BY_LABEL[profile.name] ?? null,
          }),
        );
      } catch {
        /* zonder sessie blijft alleen de terugkeerlink staan */
      }
    })();

    return () => {
      cancelled = true;
    };
    // target is een letterlijk object per pagina; de identiteit ervan verandert niet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromIntake]);

  useEffect(() => {
    if (!lens || shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("check_lens_shown", { surface: surfaceOf(target), tone: lens.tone });
    clarityTag("check_lens", lens.tone);
    // zie boven: target is stabiel per pagina
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lens]);

  if (!fromIntake) {
    return null;
  }

  if (!lens) {
    return (
      <nav aria-label="Terug naar intake-resultaten" className="mb-6">
        <ReturnLink />
      </nav>
    );
  }

  return (
    <aside
      aria-label="Wat je leefstijlcheck hierover zegt"
      className={`mb-8 rounded-2xl border px-5 py-5 ${
        lens.tone === "off"
          ? "border-stone-200 bg-stone-50"
          : "border-emerald-200 bg-emerald-50/60"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          {CHECK_LENS_COPY.eyebrow}
        </p>
        {lens.badge ? (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              lens.tone === "off"
                ? "border-stone-300 text-stone-500"
                : "border-emerald-300 text-emerald-700"
            }`}
          >
            {lens.badge}
          </span>
        ) : null}
      </div>

      {lens.score ? (
        <div className="mt-3 flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: lens.score.color }}
          />
          <span className="text-sm font-semibold text-stone-800">{lens.score.label}</span>
          <span className="text-sm tabular-nums text-stone-500">{lens.score.value}/100</span>
          <span className="relative ml-1 hidden h-1.5 max-w-[160px] flex-1 rounded-full bg-stone-200 sm:block">
            <span
              className="absolute inset-y-0 left-0 block rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, lens.score.value))}%`,
                background: lens.score.color,
              }}
            />
          </span>
        </div>
      ) : null}

      {lens.lines.map((line) => (
        <p key={line} className="mt-3 text-[15px] leading-relaxed text-stone-700">
          {line}
        </p>
      ))}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <ReturnLink />
        {lens.cta ? (
          <Link
            href={lens.cta.href}
            onClick={() =>
              trackEvent("check_lens_cta_clicked", {
                surface: surfaceOf(target),
                tone: lens.tone,
              })
            }
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-700"
          >
            {lens.cta.label} →
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
