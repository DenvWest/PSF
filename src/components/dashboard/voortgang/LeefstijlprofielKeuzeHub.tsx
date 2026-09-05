"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { getReadoutDrivers, type ReadoutPillarId } from "@/lib/domain-role";
import { trackEvent } from "@/lib/ga4";
import { CHECK_NAME } from "@/lib/kompas-domain-check";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { DashboardData, Pillar, PillarId } from "@/types/dashboard";

type LeefstijlprofielKeuzeHubProps = {
  data?: DashboardData;
  onBack: () => void;
  onOpenDomain: (domain: PillarId) => void;
};

type KengetalRow = { label: string; answerLabel: string; benchmarkLabel?: string | null };

const READOUT_PILLAR_IDS: ReadoutPillarId[] = ["energie", "herstel"];

function VoortgangSubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <VoortgangTerugLink onBack={onBack} />
      {/* De balk in de header noemt dit scherm al; op mobiel stond het dubbel. */}
      <div className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)] md:block">
        {title}
      </div>
    </div>
  );
}

function DomainDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}
    />
  );
}

function buildMeetregel(daysAgo: number | undefined, savedCount: number): string {
  const base =
    daysAgo == null
      ? "Nog niet apart gemeten"
      : daysAgo === 0
        ? "Gemeten vandaag"
        : `Gemeten ${daysAgo} dagen geleden`;
  return savedCount > 0 ? `${base} · ${savedCount} opgeslagen` : base;
}

/** Kop-waarde + benchmark + twee vervolgrijen + meetregel — de vorm uit §E. */
function DomainKengetalBlok({
  pillar,
  rows,
  meetregel,
  onClick,
}: {
  pillar: Pillar;
  rows: KengetalRow[];
  meetregel: string;
  onClick: () => void;
}) {
  const [kop, ...rest] = rows;
  const vervolg = rest.slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
    >
      <CockpitTile>
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <DomainDot color={pillar.color} />
            <span className="font-serif text-[17px] text-[var(--text)]">{pillar.label}</span>
          </span>
          <Icons.ChevronRight s={18} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
        </div>
        <div className="mt-3">
          <p className="m-0 text-[12px] text-[var(--text-muted)]">{kop.label}</p>
          <p className="m-0 mt-0.5 text-[15px] font-medium text-[var(--text)]">
            {kop.answerLabel}
          </p>
          <p className="m-0 mt-1 text-[11.5px] text-[var(--text-subtle)]">
            {kop.benchmarkLabel ?? "Geen richtlijn — je eigen antwoord is de meetlat."}
          </p>
        </div>
        {vervolg.length > 0 ? (
          <ul className="m-0 mt-2.5 list-none space-y-1 p-0">
            {vervolg.map((row) => (
              <li
                key={row.label}
                className="flex items-baseline justify-between gap-2 text-[12.5px]"
              >
                <span className="text-[var(--text-muted)]">{row.label}</span>
                <span className="text-[var(--text)]">{row.answerLabel}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="m-0 mt-2.5 text-[11px] text-[var(--text-subtle)]">{meetregel}</p>
      </CockpitTile>
    </button>
  );
}

/** Domein nog niet gemeten — blok van dezelfde maat, de check als enige actie. */
function GeenCheckBlok({ pillar, domain }: { pillar: Pillar; domain: PillarId }) {
  const checkNaam = CHECK_NAME[domain] ?? "check";
  const route = PILLAR_CHECKIN_ROUTES[domain];
  const href = route ? `${route}?from=dashboard&kompas=${domain}` : null;

  const content = (
    <CockpitTile>
      <div className="flex items-center gap-2">
        <DomainDot color={pillar.color} />
        <span className="font-serif text-[17px] text-[var(--text)]">{pillar.label}</span>
      </div>
      <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
        Je hebt je {checkNaam} nog niet gedaan. Drie minuten, en dan staat hier wat je zelf opgaf.
      </p>
      {href ? (
        <p className="m-0 mt-2 text-[12px] font-semibold text-[var(--sage)]">
          Doe de {checkNaam} →
        </p>
      ) : null}
    </CockpitTile>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block no-underline"
      onClick={() =>
        trackEvent("dashboard_voortgang_hub_click", { destination: "check", domain })
      }
    >
      {content}
    </Link>
  );
}

/** Domein is al gemeten, maar draagt hier nog geen eigen kengetallen — eerlijke tussenvorm. */
function CheckedPlainBlok({
  pillar,
  meetregel,
  onClick,
}: {
  pillar: Pillar;
  meetregel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
    >
      <CockpitTile>
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <DomainDot color={pillar.color} />
            <span className="font-serif text-[17px] text-[var(--text)]">{pillar.label}</span>
          </span>
          <Icons.ChevronRight s={18} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
        </div>
        <p className="m-0 mt-1.5 text-[12px] text-[var(--text-subtle)]">{meetregel}</p>
      </CockpitTile>
    </button>
  );
}

function VerbindingBlok({ pillar, onClick }: { pillar: Pillar; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
    >
      <CockpitTile>
        <div className="flex items-center gap-2">
          <DomainDot color={pillar.color} />
          <span className="font-serif text-[17px] text-[var(--text)]">{pillar.label}</span>
        </div>
        <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
          Verbinding meet mee in je leefstijlcheck, niet apart. Je volgende hermeting brengt &apos;m
          mee.
        </p>
      </CockpitTile>
    </button>
  );
}

function driverSentence(pillar: Pillar, drivers: PillarId[]): string {
  const labels = drivers.map((id) => PILLAR[id].label.toLowerCase());
  const joined =
    labels.length > 1
      ? `${labels.slice(0, -1).join(", ")} en ${labels[labels.length - 1]}`
      : labels[0];
  return `${pillar.label} volgt uit je ${joined}.`;
}

/** Energie en herstel hebben geen eigen check — ze volgen uit hun drivers, zoals de hub het al doet. */
function VolgtUitDeRestSectie({
  onOpenDomain,
}: {
  onOpenDomain: (domain: PillarId) => void;
}) {
  return (
    <div>
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        Volgt uit de rest
      </p>
      <ul className="m-0 mt-2 list-none space-y-2.5 p-0">
        {READOUT_PILLAR_IDS.map((id) => {
          const pillar = PILLAR[id];
          const drivers = getReadoutDrivers(id);
          return (
            <li key={id}>
              <CockpitTile>
                <div className="flex items-center gap-2">
                  <DomainDot color={pillar.color} />
                  <span className="font-serif text-[16px] text-[var(--text)]">{pillar.label}</span>
                </div>
                <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                  {driverSentence(pillar, drivers)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {drivers.map((driverId) => (
                    <button
                      key={driverId}
                      type="button"
                      onClick={() => onOpenDomain(driverId)}
                      className="cursor-pointer rounded-full border border-[var(--panel-border)] bg-transparent px-2.5 py-1 text-[11px] text-[var(--text)]"
                    >
                      {PILLAR[driverId].label}
                    </button>
                  ))}
                </div>
              </CockpitTile>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function LeefstijlprofielKeuzeHub({
  data,
  onBack,
  onOpenDomain,
}: LeefstijlprofielKeuzeHubProps) {
  const { items } = useVoortgangFavorites();
  const domainCheckDaysAgo = data?.domainCheckDaysAgo;

  return (
    <section aria-label="Leefstijlprofiel" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Leefstijlprofiel" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <VoortgangSectionHeader
            eyebrow="Leefstijlkeuze"
            title="Wat past bij je check"
            body="Per domein zie je wat wij afleiden en wat jij zelf kiest — met supplementen, producten en diensten waar dat past."
          />
          <ul
            className="m-0 mt-3 list-none p-0"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {KOMPAS_RAIL_PILLAR_IDS.map((domain) => {
              const pillar = PILLAR[domain];
              const savedCount = items.filter((item) => item.domain === domain).length;
              const daysAgo = domainCheckDaysAgo?.[domain];
              const onClick = () => onOpenDomain(domain);

              if (domain === "verbinding") {
                return (
                  <li key={domain}>
                    <VerbindingBlok pillar={pillar} onClick={onClick} />
                  </li>
                );
              }

              if (domain === "voeding") {
                return (
                  <li key={domain}>
                    <CheckedPlainBlok
                      pillar={pillar}
                      meetregel={buildMeetregel(daysAgo, savedCount)}
                      onClick={onClick}
                    />
                  </li>
                );
              }

              if (daysAgo == null) {
                return (
                  <li key={domain}>
                    <GeenCheckBlok pillar={pillar} domain={domain} />
                  </li>
                );
              }

              const sleepFactRows = domain === "slaap" ? data?.sleepCheckinSnapshot?.factRows : null;
              if (sleepFactRows && sleepFactRows.length > 0) {
                return (
                  <li key={domain}>
                    <DomainKengetalBlok
                      pillar={pillar}
                      rows={sleepFactRows.slice(0, 3)}
                      meetregel={buildMeetregel(daysAgo, savedCount)}
                      onClick={onClick}
                    />
                  </li>
                );
              }

              return (
                <li key={domain}>
                  <CheckedPlainBlok
                    pillar={pillar}
                    meetregel={buildMeetregel(daysAgo, savedCount)}
                    onClick={onClick}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <VolgtUitDeRestSectie onOpenDomain={onOpenDomain} />
      </div>
    </section>
  );
}
