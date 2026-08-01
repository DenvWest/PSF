"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainCheckinLink from "@/components/dashboard/domain/DomainCheckinLink";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainHeaderCard from "@/components/dashboard/domain/DomainHeaderCard";
import DomainSectionHeader from "@/components/dashboard/domain/DomainSectionHeader";
import DomainSoonPill from "@/components/dashboard/domain/DomainSoonPill";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel } from "@/types/dashboard";

export default function VerbindingScreen({ model }: { model: DashboardModel }) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.verbinding;

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_verbinding_premium_upsell", { surface: "kompas_verbinding" });
    clarityTag("dashboard_verbinding_premium", "shown");
  }, []);

  return (
    <DomainCockpitShell accent={pillar.color} ariaLabel="Verbinding-cockpit">
      <DomainHeaderCard
        pillar={pillar}
        score={model.scores.verbinding ?? 0}
        eyebrow="Relatie & ritme"
        tagline="Kleine contactmomenten, groot effect op herstel."
      />

      <DomainCheckinLink
        href="/intake?from=dashboard&kompas=verbinding"
        icon={<Icons.User s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />}
        label="Start leefstijlcheck (1 min)"
        onClick={() => {
          trackEvent("dashboard_verbinding_checkin_click", { surface: "kompas_verbinding" });
          clarityTag("dashboard_verbinding_checkin", "click");
        }}
        caption="Aparte verbinding-check volgt binnenkort; je start nu via de leefstijlcheck."
      />

      <section aria-label="Leefstijl eerst">
        <DomainSectionHeader eyebrow="Leefstijl eerst" title="Mini-acties die blijven hangen" />
        <CockpitTile>
          <div className="flex flex-col gap-3">
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">60-seconden check-in</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Stuur vandaag een korte vraag: &ldquo;Hoe gaat het echt met je?&rdquo;.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Korte belafspraak</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Plan 10 minuten bellen in plaats van eindeloos appen.
              </div>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
              <div className="font-serif text-[16px] text-[#F1EFE8]">Offline samen-moment</div>
              <div className="mt-1 text-[13px] text-[#9FB0A6]">
                Koppel een wandeling of koffie aan een vast wekelijks moment.
              </div>
            </div>
            <Link
              href="/inzichten"
              onClick={() => {
                trackEvent("dashboard_verbinding_leefstijl_click", {
                  surface: "kompas_verbinding",
                });
                clarityTag("dashboard_verbinding_leefstijl", "click");
              }}
              className="mt-0.5 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
            >
              Bekijk leefstijl &amp; inzichten <Icons.ChevronRight s={15} />
            </Link>
          </div>
        </CockpitTile>
      </section>

      <section aria-label="Verder verdiepen">
        <DomainSectionHeader
          eyebrow="Daarna verdiepen"
          title="Kies je volgende stap"
          action={<DomainSoonPill />}
        />
        <CockpitTile>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                trackEvent("dashboard_verbinding_verdieping_click", {
                  surface: "kompas_verbinding",
                  target: "patroon",
                  state: "coming_soon",
                });
                clarityTag("dashboard_verbinding_verdieping", "patroon_soon");
              }}
              className="cursor-pointer rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3 text-left"
            >
              <div className="font-serif text-[16px] leading-tight text-[#F1EFE8]">
                Verdiep je in je patroon
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                Binnenkort zie je welke contactmomenten je energie geven en welke leegtrekken.
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent("dashboard_verbinding_verdieping_click", {
                  surface: "kompas_verbinding",
                  target: "sociaal_ritme",
                  state: "coming_soon",
                });
                clarityTag("dashboard_verbinding_verdieping", "ritme_soon");
              }}
              className="cursor-pointer rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3 text-left"
            >
              <div className="font-serif text-[16px] leading-tight text-[#F1EFE8]">
                Zie je sociale ritme
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                Binnenkort: weekoverzicht met pieken/dips en 1 concrete suggestie voor je volgende
                stap.
              </div>
            </button>
          </div>
        </CockpitTile>
      </section>

      <KompasBegeleidingLink surface="kompas_verbinding" />

      <CockpitTile>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icons.Target s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />
            <div>
              <div className="font-serif text-[16px] text-[#F1EFE8]">Jouw eerstvolgende stap</div>
              <div className="mt-0.5 text-[13px] text-[#9FB0A6]">
                Binnenkort persoonlijk zichtbaar in je verbinding-kompas.
              </div>
            </div>
          </div>
          <DomainSoonPill />
        </div>
      </CockpitTile>
    </DomainCockpitShell>
  );
}
