"use client";

import VitalityScoreCard from "@/components/app/VitalityScoreCard";
import { PROFILE_COPY } from "@/data/explanation-copy";
import { isUsableFirstName } from "@/lib/intake-greetings";
import type { ProfileLabel } from "@/lib/intake-engine";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
  profile: ProfileLabel;
  firstName?: string | null;
};

export default function RevealHeroCard({
  model,
  profile,
  firstName = null,
}: RevealHeroCardProps) {
  const focusLine =
    model.driverLine ??
    `Begin bij ${model.primaryPillarLabel.toLowerCase()} — hier ligt je eerste hefboom.`;
  const profileHook = PROFILE_COPY[profile.name];
  const kicker = isUsableFirstName(firstName) ? `${firstName!.trim()},` : null;

  return (
    <VitalityScoreCard
      value={model.vitality}
      showRhythm={false}
      layoutVariant="reveal-story"
      kicker={kicker}
      profileName={profile.name}
      profileHook={profileHook}
      footer={
        <div className="reveal-story-insights">
          {model.strengthLine ? (
            <p className="reveal-story-insights__line reveal-story-insights__line--strength">
              {model.strengthLine}
            </p>
          ) : null}
          <p className="reveal-story-insights__line">{focusLine}</p>
        </div>
      }
    />
  );
}
