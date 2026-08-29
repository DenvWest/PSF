"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import { REVEAL_ROADMAP_COPY } from "@/lib/results-reveal-copy";
import type { RevealRoadmapDomain, RevealRoadmapSupplement } from "@/lib/reveal-roadmap";
import type { PillarId } from "@/types/dashboard";

type RevealDomainRoadmapProps = {
  domains: RevealRoadmapDomain[];
  sessionId: string | null;
};

function SupplementCard({
  supplement,
  domain,
  color,
  sessionId,
}: {
  supplement: RevealRoadmapSupplement;
  domain: PillarId;
  color: string;
  sessionId: string | null;
}) {
  return (
    <article
      className="grid gap-2.5 rounded-2xl border border-white/12 bg-black/25 p-3.5"
      aria-label={`Aanvulling bij ${domain}: ${supplement.name}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}1f`, color }}
        >
          <Icons.Pill s={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-[16px] leading-tight text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
          >
            {supplement.name}
          </span>
          <span className="block text-[11.5px] text-[#7E8C82]">{supplement.form}</span>
        </span>
      </div>

      <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FAFA4]">
        <span className="text-[#7E8C82]">{REVEAL_ROADMAP_COPY.claimPrefix} </span>
        {supplement.claim}
      </p>
      <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#7E8C82]">
        {supplement.rationale} {supplement.trustLine}
      </p>

      <Link
        href={supplement.href}
        onClick={() => {
          trackEvent("intake_roadmap_supplement_clicked", { domein: domain });
          emitIntakeClientEvent("intake.cta_to_comparison", {
            domain,
            supplement: supplement.name,
            href: supplement.href,
            session_id: sessionId,
          });
        }}
        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-[14px] font-bold text-[#F1EFE8] transition hover:bg-white/[0.07]"
      >
        {REVEAL_ROADMAP_COPY.supplementCta}
        <Icons.ArrowRight s={15} />
      </Link>
    </article>
  );
}

function LaneLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
      {children}
    </p>
  );
}

function DomainRow({
  domain,
  isOpen,
  onToggle,
  sessionId,
}: {
  domain: RevealRoadmapDomain;
  isOpen: boolean;
  onToggle: (domain: PillarId) => void;
  sessionId: string | null;
}) {
  const Icon = Icons[domain.icon as keyof typeof Icons] as ComponentType<{ s?: number }>;
  const panelId = `reveal-route-panel-${domain.id}`;

  return (
    <li
      className={`overflow-hidden rounded-2xl border transition ${
        isOpen
          ? "border-[color:var(--ac)]/45 bg-[color:var(--ac)]/[0.07]"
          : "border-white/10 bg-black/15"
      }`}
      style={{ "--ac": domain.color } as CSSProperties}
    >
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => onToggle(domain.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-[60px] w-full cursor-pointer items-center gap-3 bg-transparent px-3.5 py-3 text-left transition hover:bg-white/[0.04]"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${domain.color}1f`, color: domain.color }}
          >
            <Icon s={17} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span
                className="text-[16px] leading-tight text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
              >
                {domain.label}
              </span>
              {domain.isFocus ? (
                <span
                  className="rounded-md border px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: domain.color, borderColor: `${domain.color}66` }}
                >
                  {REVEAL_ROADMAP_COPY.focusBadge}
                </span>
              ) : (
                <span className="text-[10.5px] tabular-nums text-[#7E8C82]">
                  {REVEAL_ROADMAP_COPY.rankPrefix} {domain.rank}
                </span>
              )}
            </span>
            <span className="relative mt-1.5 block h-1.5 w-full max-w-[220px] rounded-full bg-white/[0.08]">
              <span
                className="absolute inset-y-0 left-0 block rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, domain.score))}%`,
                  background: `linear-gradient(90deg, ${domain.color}c4, ${domain.color})`,
                }}
              />
            </span>
          </span>

          <span
            className="shrink-0 text-[18px] tabular-nums text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
          >
            {domain.score}
          </span>
          <span
            aria-hidden
            className={`shrink-0 text-[#7E8C82] transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <Icons.ChevronDown s={16} />
          </span>
        </button>
      </h3>

      {isOpen ? (
        <div id={panelId} className="grid gap-4 border-t border-white/[0.07] px-3.5 py-4">
          <div>
            <LaneLabel>{REVEAL_ROADMAP_COPY.rungBasis}</LaneLabel>
            <ul className="m-0 mt-1.5 grid list-none gap-1 p-0">
              {domain.basis.lines.map((line) => (
                <li
                  key={line}
                  className="max-w-[62ch] text-[13.5px] leading-relaxed text-[#C6D1C9]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <LaneLabel>{REVEAL_ROADMAP_COPY.rungNow}</LaneLabel>
            <p className="m-0 mt-1.5 text-[15px] font-semibold leading-snug text-[#F1EFE8]">
              {domain.now.title}
            </p>
          </div>

          <div>
            <LaneLabel>{REVEAL_ROADMAP_COPY.rungLater}</LaneLabel>
            <ul className="m-0 mt-1.5 grid list-none gap-2 p-0">
              {domain.later.map((lane) => (
                <li key={lane.label} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: lane.soon ? "#7E8C82" : domain.color }}
                  />
                  <span className="min-w-0">
                    <span className="text-[13.5px] font-semibold text-[#F1EFE8]">
                      {lane.label}
                    </span>
                    {lane.soon ? (
                      <span className="ml-2 whitespace-nowrap rounded-md border border-white/12 bg-black/25 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
                        {REVEAL_ROADMAP_COPY.soonBadge}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block max-w-[62ch] text-[12.5px] leading-relaxed text-[#7E8C82]">
                      {lane.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-2 max-w-[62ch] text-[11.5px] leading-relaxed text-[#7E8C82]">
              {REVEAL_ROADMAP_COPY.adaptsNote}
            </p>
          </div>

          <div>
            <LaneLabel>{REVEAL_ROADMAP_COPY.rungSupplement}</LaneLabel>
            <div className="mt-1.5">
              {domain.supplement ? (
                <SupplementCard
                  supplement={domain.supplement}
                  domain={domain.id}
                  color={domain.color}
                  sessionId={sessionId}
                />
              ) : (
                <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#7E8C82]">
                  {domain.supplementNote}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function RevealDomainRoadmap({ domains, sessionId }: RevealDomainRoadmapProps) {
  const [open, setOpen] = useState<PillarId | null>(domains[0]?.id ?? null);

  function toggle(domain: PillarId) {
    setOpen((current) => {
      const next = current === domain ? null : domain;
      if (next) {
        trackEvent("intake_roadmap_domain_opened", { domein: next });
      }
      return next;
    });
  }

  return (
    <section aria-label={REVEAL_ROADMAP_COPY.sectionTitle} className="grid gap-3">
      <header className="grid gap-1">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
          {REVEAL_ROADMAP_COPY.sectionEyebrow}
        </p>
        <h2
          className="m-0 text-[19px] leading-tight text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
        >
          {REVEAL_ROADMAP_COPY.sectionTitle}
        </h2>
        <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#7E8C82]">
          {REVEAL_ROADMAP_COPY.sectionLead}
        </p>
      </header>

      <ul aria-label={REVEAL_ROADMAP_COPY.listLabel} className="m-0 grid list-none gap-2 p-0">
        {domains.map((domain) => (
          <DomainRow
            key={domain.id}
            domain={domain}
            isOpen={open === domain.id}
            onToggle={toggle}
            sessionId={sessionId}
          />
        ))}
      </ul>
    </section>
  );
}
