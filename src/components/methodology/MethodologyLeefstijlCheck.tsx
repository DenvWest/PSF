"use client";

import Link from "next/link";
import LeefstijlDisclaimerBlock from "@/components/legal/LeefstijlDisclaimerBlock";
import { methodologyPrimaryBtnClass } from "@/components/methodology/methodology-buttons";
import MethodologyPreviewCard from "@/components/methodology/MethodologyPreviewCard";
import {
  methodologyBodySmClass,
  methodologyH2Class,
  methodologyLeadColumnClass,
  methodologySectionLabelClass,
  splitLeadOnDelimiter,
} from "@/components/methodology/methodology-typography";
import FoundationPyramid from "@/components/pyramid/FoundationPyramid";
import { METHODOLOGY_LEEFSTIJLCHECK } from "@/data/methodology";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

const onderbouwingLinkClass =
  "mt-4 block rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center transition hover:border-ps-green/30 hover:bg-white/[0.07]";

export default function MethodologyLeefstijlCheck() {
  const {
    interventionDomains,
    intakeCta,
    onderbouwingLink,
    pillarsBridge,
    pyramidCardTitle,
    pyramidEyebrow,
    subtitle,
    title,
    titleAccent,
  } = METHODOLOGY_LEEFSTIJLCHECK;

  const [subtitleFirst, subtitleSecond] = splitLeadOnDelimiter(subtitle, ";");

  return (
    <section
      id={METHODOLOGY_LEEFSTIJLCHECK.id}
      aria-labelledby="methodology-leefstijl-title"
      className="-mx-6 bg-[#F7F5F0] px-6 py-14 md:py-16 lg:-mx-8 lg:px-8"
    >
      <h2 id="methodology-leefstijl-title" className={methodologyH2Class}>
        {title}
        <span className="mt-1 block text-2xl font-normal text-stone-600 md:text-3xl">
          {titleAccent}
        </span>
      </h2>
      <p className={methodologyLeadColumnClass}>
        <span className="block text-stone-800">{subtitleFirst}</span>
        {subtitleSecond ? (
          <span className="mt-0.5 block text-stone-600">{subtitleSecond}</span>
        ) : null}
      </p>

      <div className="mt-10 max-w-xl">
        <MethodologyPreviewCard eyebrow={pyramidEyebrow} title={pyramidCardTitle}>
          <div className="flex w-full flex-1 flex-col">
            <FoundationPyramid mode="methodologyPreview" />
            <Link
              href={onderbouwingLink.href}
              onClick={() =>
                trackEvent(GA4_EVENTS.ONDERBOUWING_LINK_CLICKED, {
                  surface: "methodologie",
                })
              }
              className={onderbouwingLinkClass}
            >
              <span className="block text-sm font-medium leading-snug text-ps-green">
                {onderbouwingLink.title}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-stone-400">
                {onderbouwingLink.subtitle} →
              </span>
            </Link>
          </div>
        </MethodologyPreviewCard>
      </div>

      <div className="mt-10 max-w-xl border-t border-stone-300/50 pt-8">
        <p className={methodologySectionLabelClass}>{pillarsBridge}</p>
        <ul className="mt-4 space-y-2">
          {interventionDomains.map((domain) => (
            <li
              key={domain.label}
              className={`rounded-xl border border-stone-200/80 bg-white px-4 py-3 ${methodologyBodySmClass}`}
            >
              <span className="font-medium text-stone-900">{domain.label}</span>
              <span className="text-stone-600"> — {domain.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Link
          href={intakeCta.href}
          onClick={() =>
            trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
              location: "methodologie",
              target: "/intake",
            })
          }
          className={methodologyPrimaryBtnClass}
        >
          {intakeCta.label}
        </Link>
      </div>

      <LeefstijlDisclaimerBlock variant="compact" className="mt-6" />
    </section>
  );
}
