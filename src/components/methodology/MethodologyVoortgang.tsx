"use client";

import Link from "next/link";
import MethodologyDashboardPreview from "@/components/methodology/MethodologyDashboardPreview";
import {
  methodologyPrimaryBtnClass,
  methodologySecondaryBtnClass,
} from "@/components/methodology/methodology-buttons";
import MethodologyPreviewCard from "@/components/methodology/MethodologyPreviewCard";
import {
  methodologyBodySmClass,
  methodologyH2Class,
  methodologyLeadClass,
  splitLeadOnDelimiter,
} from "@/components/methodology/methodology-typography";
import { METHODOLOGY_VOORTGANG } from "@/data/methodology";
import { trackEvent } from "@/lib/ga4";

export default function MethodologyVoortgang() {
  const {
    bullets,
    dashboardCardTitle,
    dashboardEyebrow,
    dashboardLink,
    inzichtenLink,
    lead,
    title,
  } = METHODOLOGY_VOORTGANG;

  const [leadFirst, leadSecond] = splitLeadOnDelimiter(lead, " — ");

  return (
    <section
      id={METHODOLOGY_VOORTGANG.id}
      aria-labelledby="methodology-voortgang-title"
      className="-mx-6 bg-[#FDFCFA] px-6 py-14 md:py-16 lg:-mx-8 lg:px-8"
    >
      <h2 id="methodology-voortgang-title" className={methodologyH2Class}>
        {title}
      </h2>
      <p className={methodologyLeadClass}>
        <span className="block text-stone-800">{leadFirst}</span>
        {leadSecond ? (
          <span className="mt-0.5 block text-stone-600">{leadSecond}</span>
        ) : null}
      </p>

      <div className="mt-10 max-w-2xl">
        <MethodologyPreviewCard eyebrow={dashboardEyebrow} title={dashboardCardTitle}>
          <MethodologyDashboardPreview />
        </MethodologyPreviewCard>
      </div>

      <ul className="mt-10 max-w-2xl space-y-2 border-t border-stone-300/50 pt-8">
        {bullets.map((bullet) => (
          <li
            key={bullet.slice(0, 40)}
            className={`flex gap-3 ${methodologyBodySmClass}`}
          >
            <span
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5A8F6A]"
              aria-hidden="true"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={dashboardLink.href}
          onClick={() =>
            trackEvent("methodologie_nav_click", {
              location: "methodologie",
              target: dashboardLink.href,
            })
          }
          className={methodologyPrimaryBtnClass}
        >
          {dashboardLink.label}
        </Link>
        <Link
          href={inzichtenLink.href}
          onClick={() =>
            trackEvent("methodologie_nav_click", {
              location: "methodologie",
              target: inzichtenLink.href,
            })
          }
          className={methodologySecondaryBtnClass}
        >
          {inzichtenLink.label}
        </Link>
      </div>
    </section>
  );
}
