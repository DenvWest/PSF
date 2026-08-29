"use client";

import IntakeInBoxExit from "@/components/intake/IntakeInBoxExit";
import RevealDomainRoadmap from "@/components/intake/RevealDomainRoadmap";
import RevealLeefstijlRing from "@/components/intake/RevealLeefstijlRing";
import RevealProposition from "@/components/intake/RevealProposition";
import RevealScoreReadout from "@/components/intake/RevealScoreReadout";
import RevealTrackChoice from "@/components/intake/RevealTrackChoice";
import { isUsableFirstName } from "@/lib/intake-greetings";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { withIntakeReturn } from "@/lib/intake-return-link";
import { buildSupplementHubHref } from "@/lib/supplement-hub/hub-link";
import { REVEAL_COPY, REVEAL_RING_COPY } from "@/lib/results-reveal-copy";
import { mapCheckScoresToDomainScores, type RevealModel } from "@/lib/reveal-model";
import { buildRevealRingRows, buildRevealRoadmap } from "@/lib/reveal-roadmap";

type RevealReportProps = {
  model: RevealModel;
  answers: Record<string, number>;
  sessionId: string | null;
  firstName?: string | null;
};

export default function RevealReport({
  model,
  answers,
  sessionId,
  firstName = null,
}: RevealReportProps) {
  const input = buildRecommendationInput({
    scores: mapCheckScoresToDomainScores(model.scores),
    answers,
  });
  const ringRows = buildRevealRingRows(model);
  const roadmap = buildRevealRoadmap(model, input);

  const focusDomain = roadmap.find((domain) => domain.isFocus) ?? roadmap[0];
  const focusSupplement =
    focusDomain?.supplement ?? roadmap.find((domain) => domain.supplement)?.supplement ?? null;
  const greeting = isUsableFirstName(firstName) ? `${firstName!.trim()}, ` : "";

  // Het verhaal in de volgorde van de check: waarmee je begon, wat eruit komt,
  // waar je op kunt bouwen. Lege regels vallen weg in plaats van te vullen.
  const storyLines = [model.recognitionLine, model.driverLine, model.strengthLine].filter(
    (line): line is string => Boolean(line),
  );

  return (
    <div className="grid gap-6 lg:gap-8">
      <header className="flex items-start justify-between gap-4">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
          {REVEAL_RING_COPY.eyebrow}
        </p>
        <IntakeInBoxExit variant="on-dark" />
      </header>

      <section
        aria-label="Jouw startprofiel en route"
        className="grid gap-6 rounded-3xl border border-white/12 bg-white/[0.035] p-4 sm:p-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8 lg:p-7"
      >
        {/* De linkerkolom is de uitlezing: het instrument, het getal op zijn
            schaal, en waar je route begint. De onderbouwing per domein staat
            rechts in de route — die stond hier tot 29 augustus ook, waardoor
            dezelfde twee regels twee keer in beeld stonden. */}
        <div className="grid content-start justify-items-center gap-5 text-center lg:justify-items-start lg:text-left">
          <RevealLeefstijlRing rows={ringRows} vitality={model.vitality} />

          <RevealScoreReadout vitality={model.vitality} />

          <div className="grid w-full gap-2 border-t border-white/[0.09] pt-4">
            <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
              {REVEAL_COPY.profileEyebrow}
            </p>
            <h1
              className="m-0 text-[26px] leading-tight text-[#F1EFE8] sm:text-[30px]"
              style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
            >
              {greeting}
              {focusDomain?.label} is je startpunt
            </h1>
            {storyLines.length > 0 ? (
              <p
                className="m-0 max-w-[46ch] text-[13.5px] leading-relaxed text-[#C6D1C9]"
                style={{ textWrap: "pretty" }}
              >
                {storyLines.join(" ")}
              </p>
            ) : null}
          </div>

          <details className="w-full border-t border-white/[0.09] pt-4 text-left">
            <summary className="cursor-pointer list-none text-[12px] text-[#7E8C82] underline underline-offset-2">
              {REVEAL_RING_COPY.ringExplainerSummary}
            </summary>
            <p className="m-0 mt-2 max-w-[52ch] text-[12px] leading-relaxed text-[#7E8C82]">
              {REVEAL_RING_COPY.ringExplainer}
            </p>
          </details>
        </div>

        <div className="min-w-0 border-t border-white/[0.07] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <RevealDomainRoadmap domains={roadmap} sessionId={sessionId} />
        </div>
      </section>

      <RevealProposition />

      <RevealTrackChoice
        supplementHref={withIntakeReturn(buildSupplementHubHref(focusSupplement?.hubSlug))}
        supplementLabel={focusSupplement?.name ?? null}
        sessionId={sessionId}
      />

      <p className="m-0 text-center text-[12px] leading-relaxed text-[#7E8C82]">
        {REVEAL_COPY.contextLine}
      </p>
    </div>
  );
}
