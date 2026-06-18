"use client";

import VitalityRing from "@/components/app/VitalityRing";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroProps = {
  model: RevealModel;
  emailLine?: string | null;
};

export default function RevealHero({ model, emailLine }: RevealHeroProps) {
  return (
    <section aria-label="Jouw vitaliteit">
      {model.recognitionLine ? (
        <p className="mb-4 text-center text-[15px] leading-relaxed text-intake-ink-muted">
          {model.recognitionLine}
        </p>
      ) : null}
      <article
        className="rounded-3xl border px-5 py-5 lg:px-6 lg:py-6"
        style={{
          background: "var(--panel, rgba(255,255,255,0.05))",
          borderColor: "rgba(90,143,106,0.28)",
          boxShadow: "0 0 0 1px rgba(90,143,106,0.08)",
        }}
      >
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-8">
          <VitalityRing value={model.vitality} showLockedHint size={148} />
          <div className="text-center lg:text-left">
            <p className="font-serif text-xl text-intake-ink lg:text-[22px]">
              {model.profileName}
            </p>
            {model.driverLine ? (
              <p className="mt-2 text-sm leading-relaxed text-intake-ink-muted lg:max-w-[32ch]">
                {model.driverLine}
              </p>
            ) : null}
            {model.strengthLine ? (
              <p className="mt-1.5 text-[13px] leading-relaxed text-intake-ink-subtle lg:max-w-[32ch]">
                {model.strengthLine}
              </p>
            ) : null}
            {emailLine ? (
              <p className="mt-2 text-sm text-intake-ink-muted">{emailLine}</p>
            ) : null}
            <p className="mt-2 text-[12px] text-intake-ink-subtle">{REVEAL_COPY.contextLine}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
