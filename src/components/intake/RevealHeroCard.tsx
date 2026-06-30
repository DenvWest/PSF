"use client";

import RevealVitalityInstrument from "@/components/intake/RevealVitalityInstrument";
import { PROFILE_COPY } from "@/data/explanation-copy";
import type { ProfileLabel } from "@/lib/intake-engine";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
  profile: ProfileLabel;
  firstName?: string | null;
};

export default function RevealHeroCard({ model, profile }: RevealHeroCardProps) {
  const profileHook = PROFILE_COPY[profile.name];
  const pillarColor = model.priority.color;

  return (
    <article aria-label="Jouw startprofiel" className="grid gap-4 text-center">
      <div className="flex justify-center">
        <RevealVitalityInstrument value={model.vitality} />
      </div>

      <div className="grid gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716c]">
          {REVEAL_COPY.profileEyebrow}
        </p>
        <h3
          className="m-0 text-[24px] leading-tight text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)", fontWeight: 400 }}
        >
          {profile.name}
        </h3>
        {profileHook ? (
          <p
            className="mx-auto max-w-[34ch] text-[14px] leading-relaxed text-[#57534e]"
            style={{ textWrap: "pretty" }}
          >
            {profileHook}
          </p>
        ) : null}
      </div>

      <p
        className="m-0 inline-flex items-center justify-center gap-2 border-t border-[#ebe7e2] pt-3.5 text-[12px] font-bold uppercase tracking-[0.12em]"
        style={{ color: pillarColor }}
      >
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: pillarColor }} aria-hidden />
        {REVEAL_COPY.priorityBridgePrefix} {model.primaryPillarLabel}
      </p>
    </article>
  );
}
