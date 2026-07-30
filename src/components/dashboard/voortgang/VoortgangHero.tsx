"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import {
  buildVoortgangBewijsRegel,
  type VoortgangBewijsState,
} from "@/lib/voortgang-bewijs-copy";
import type { DashboardData, DashboardModel } from "@/types/dashboard";
import VoortgangBewijsband from "@/components/dashboard/voortgang/VoortgangBewijsband";

type VoortgangHeroProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

const H1_BY_STATE: Record<VoortgangBewijsState, string> = {
  beantwoord: "Er zit beweging in.",
  opbouwend: "Er stapelt zich iets op. Lezen doe je straks.",
  dun: "Er ligt nog te weinig om iets te lezen.",
  wachtend: "Je bewijs begint bij je eerste dag.",
};

const REASSURANCE_BY_STATE: Record<VoortgangBewijsState, string> = {
  beantwoord: "Eén beweging in één domein. Je hermeting maakt er een reeks van.",
  opbouwend: "Losse dagen zeggen weinig. Een reeks zegt iets.",
  dun: "Twaalf dagen is kort. Er is nog ruimte genoeg tot je hermeting.",
  wachtend: "Eén moment per dag is genoeg om iets te kunnen aflezen.",
};

export default function VoortgangHero({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
}: VoortgangHeroProps) {
  const router = useRouter();
  const trackedStateRef = useRef<string | null>(null);

  const activeDays = data?.cycleEvidence?.activeDays ?? null;
  const cycleDay = data?.cycleEvidence?.cycleDay ?? null;
  const daysUntilRemeasure =
    data?.cycleEvidence?.daysUntilRemeasure ?? data?.remeasure?.daysUntil ?? null;

  const regel = buildVoortgangBewijsRegel({
    activeDays,
    cycleDay,
    daysUntilRemeasure,
    focusLabel: model.priority.label,
    focusDelta: model.deltaOf(model.priority.id),
  });

  useEffect(() => {
    if (trackedStateRef.current === regel.state) {
      return;
    }
    trackedStateRef.current = regel.state;
    trackEvent("dashboard_voortgang_bewijs_state", {
      state: regel.state,
      ...(cycleDay != null ? { cycle_day: cycleDay } : {}),
      ...(activeDays != null ? { active_days: activeDays } : {}),
    });
    clarityTag("dashboard_voortgang", `bewijs_${regel.state}`);
  }, [regel.state, cycleDay, activeDays]);

  const hermetingSoon =
    data?.remeasure?.daysUntil != null && data.remeasure.daysUntil <= 14;

  const handleGoAgenda = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "agenda",
      surface: "bewijs_hero",
    });
    clarityTag("dashboard_voortgang", "agenda");
    onGoAgenda();
  };

  const handleGoHermeting = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "hermeting",
      surface: "bewijs_hero",
    });
    clarityTag("dashboard_voortgang", "hermeting");
    onGoHermeting();
  };

  const handleOpenDomain = () => {
    const domain = model.priority.id;
    trackEvent("dashboard_voortgang_domein_click", { domain });
    clarityTag("dashboard_voortgang", `domeinring_${domain}`);
    router.push(buildDashboardVandaagHref(domain));
  };

  const eyebrow = cycleDay != null ? `BEWIJS · DAG ${cycleDay}` : "BEWIJS";

  return (
    <section
      aria-labelledby="voortgang-hero-title"
      className="relative -mx-3 overflow-hidden rounded-b-3xl bg-[#132414] sm:-mx-4 min-[1440px]:-mx-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, #000 0%, transparent 62%)",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, #000 0%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[150px] -top-[190px] h-[400px] w-[400px] rounded-full bg-[var(--sage)] opacity-[0.18] blur-[120px]"
      />

      <div className="relative z-[1] px-3 py-7 sm:px-4 min-[1440px]:px-6 lg:py-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-14">
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              {eyebrow}
            </p>
            <h1
              id="voortgang-hero-title"
              className="mt-3 font-serif text-[clamp(27px,7.4vw,34px)] leading-[1.1] tracking-[-0.005em] text-balance lg:mt-3.5 lg:text-[clamp(34px,3.6vw,50px)] lg:leading-[1.04]"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              {H1_BY_STATE[regel.state]}
            </h1>
            <p className="mt-3 max-w-[42ch] text-[15.5px] leading-[1.55] text-[#CDD7D0] text-pretty lg:max-w-[38ch] lg:text-[18px]">
              {regel.line}
            </p>

            <div className="mt-[18px] flex flex-wrap items-center gap-2.5">
              {hermetingSoon ? (
                <>
                  <button
                    type="button"
                    onClick={handleGoHermeting}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-[var(--sage)] bg-[var(--sage)] px-5 text-[14.5px] font-semibold text-[#0E1C10]"
                  >
                    Naar je hermeting
                  </button>
                  <button
                    type="button"
                    onClick={handleGoAgenda}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-white/12 bg-transparent px-5 text-[14.5px] font-semibold text-[rgba(255,255,255,0.95)]"
                  >
                    Wat staat er voor vandaag
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGoAgenda}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-[var(--sage)] bg-[var(--sage)] px-5 text-[14.5px] font-semibold text-[#0E1C10]"
                  >
                    {regel.ctaLabel ?? "Wat staat er voor vandaag"}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenDomain}
                    className="inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent px-1 text-[14px] text-[#9FB0A6] underline decoration-[rgba(159,176,166,0.45)] underline-offset-[3px]"
                  >
                    Bekijk je {model.priority.label.toLowerCase()}
                  </button>
                </>
              )}
            </div>

            <p className="mt-3 text-[12.5px] text-[rgba(255,255,255,0.40)] text-pretty">
              {REASSURANCE_BY_STATE[regel.state]}
            </p>
          </div>

          <VoortgangBewijsband
            cycleEvidence={data?.cycleEvidence ?? null}
            remeasure={data?.remeasure ?? null}
            domainCheckDaysAgo={data?.domainCheckDaysAgo}
            priorityLabel={model.priority.label}
          />
        </div>
      </div>
    </section>
  );
}
