"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { PILLAR } from "@/data/dashboard";
import { SCHAP_BASIS_CARDS } from "@/data/movement/schap-basis-cards";
import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { buildDashboardFavorietenSchapHref } from "@/lib/dashboard-url";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { useVoortgangFavorites, type VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";
import type { DashboardData, PillarId, SchapTabId } from "@/types/dashboard";

/** wandelen/ritme zijn gratis schap-kaarten die als kind="activiteit" worden
 * bewaard (zelfde databron als Leefstijlprofiel), maar visueel op het schap
 * horen — vandaar deze whitelist naast de kind==="supplement"-filter. */
const SCHAP_BASIS_CARD_IDS = new Set<string>(SCHAP_BASIS_CARDS.map((card) => card.id));

/**
 * favorieten-schap-prebuild-v3 §12 · vier sub-oppervlakken, nooit tegelijk
 * zichtbaar. De prebuild kent geen domein-state (het schap is daar
 * cross-domein demo-materiaal); `src/` bouwt beweging eerst als blauwdruk,
 * dus deze view is domein-gescoped — Producten/Diensten/Begeleiding tonen
 * hier alleen wat bij `domain` hoort.
 */
const SCHAP_TABS: readonly { id: SchapTabId; label: string }[] = [
  { id: "leefstijl", label: "Leefstijl" },
  { id: "producten", label: "Producten" },
  { id: "diensten", label: "Diensten" },
  { id: "begeleiding", label: "Begeleiding" },
];

/** Zelfde vijf domeinen als account-favorites.ts VALID_DOMAINS — energie/herstel zijn readout-domeinen, geen leefstijlkeuze. */
const SPIEGEL_DOMAINS: readonly PillarId[] = ["beweging", "slaap", "voeding", "stress", "verbinding"];

type FavorietenSchapViewProps = {
  domain: PillarId;
  activeTab: SchapTabId | null;
  hasCheck: boolean;
  data?: DashboardData;
  onBack: () => void;
  onOpenLeefstijlprofiel: (domain: PillarId) => void;
};

export default function FavorietenSchapView({
  domain,
  activeTab,
  hasCheck,
  data,
  onBack,
  onOpenLeefstijlprofiel,
}: FavorietenSchapViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<SchapTabId>(activeTab ?? "producten");
  const { items, isSaved, save } = useVoortgangFavorites();
  const nutritionLogCompleted =
    buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true;

  const handleTabChange = (next: SchapTabId) => {
    if (next === tab) {
      return;
    }
    setTab(next);
    emitAccountClientEvent("dashboard.schap_tab_selected", { domain, tab: next });
    clarityTag("dashboard_schap_tab", next);
    router.replace(buildDashboardFavorietenSchapHref(domain, next), { scroll: false });
  };

  const handleOpenLeefstijlprofiel = (target: PillarId) => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "leefstijlprofiel",
      domain: target,
      surface: "favorieten_schap_leefstijl",
    });
    clarityTag("dashboard_leefstijlprofiel", target);
    onOpenLeefstijlprofiel(target);
  };

  return (
    <section aria-label={`Favorieten · ${PILLAR[domain].label}`} style={{ paddingTop: 16, paddingBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Terug"
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--panel-border)",
            color: "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          Favorieten
        </div>
      </div>

      <KetenStrip hasCheck={hasCheck} />

      <nav
        role="tablist"
        aria-label="Schap"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-[var(--divider)]"
        style={{ scrollbarWidth: "none" }}
      >
        {SCHAP_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => handleTabChange(t.id)}
            className={`min-h-11 flex-shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-3.5 text-[13.5px] font-semibold transition ${
              tab === t.id
                ? "border-[var(--sage)] text-[var(--sage)]"
                : "border-transparent text-[var(--text-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "leefstijl" ? (
        <LeefstijlTab items={items} onOpenLeefstijlprofiel={handleOpenLeefstijlprofiel} />
      ) : tab === "producten" ? (
        <ProductenTab
          domain={domain}
          items={items}
          isSaved={isSaved}
          onSave={save}
          verdicts={data?.supplementVerdicts ?? []}
          nutritionLogCompleted={nutritionLogCompleted}
        />
      ) : tab === "diensten" ? (
        <DienstenTab
          domain={domain}
          items={items}
          isSaved={isSaved}
          onSave={save}
        />
      ) : (
        <BegeleidingTab />
      )}
    </section>
  );
}

function KetenStrip({ hasCheck }: { hasCheck: boolean }) {
  const steps: { id: string; label: string; on?: boolean; active?: boolean }[] = [
    { id: "check", label: "Check", on: hasCheck },
    { id: "onderbouwing", label: "Onderbouwing", on: hasCheck },
    { id: "schap", label: "Schap", active: true },
    { id: "vergelijking", label: "Vergelijking" },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px]">
      {steps.map((step, i) => (
        <span key={step.id} className="flex items-center gap-1.5">
          <span
            className={
              step.active
                ? "font-semibold text-[var(--sage)]"
                : step.on
                  ? "text-[#CDD7D0]"
                  : "text-[#7E8C82]"
            }
          >
            {step.label}
          </span>
          {i < steps.length - 1 ? (
            <Icons.ChevronRight s={11} style={{ color: "#7E8C82" }} />
          ) : null}
        </span>
      ))}
    </div>
  );
}

/**
 * §3 · Leefstijl is een spiegel, geen werkplek — per domein één regel en de
 * weg terug naar Leefstijlprofiel. Nul kaarten: geen CockpitTile, geen
 * oordeel, alleen een rij met wat er al gekozen is.
 */
function LeefstijlTab({
  items,
  onOpenLeefstijlprofiel,
}: {
  items: VoortgangFavoriteItem[];
  onOpenLeefstijlprofiel: (domain: PillarId) => void;
}) {
  return (
    <section aria-label="Leefstijl">
      <VoortgangSectionHeader eyebrow="Leefstijl" title="Per domein, kort" />
      <p className="m-0 mb-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Alleen een spiegel. Aanbeveling en keuze staan op je leefstijlprofiel per domein — wil je
        daar iets veranderen, ga je daarheen.
      </p>
      <div>
        {SPIEGEL_DOMAINS.map((d) => {
          const gekozen = items.filter(
            (item) => item.domain === d && item.kind === "activiteit",
          ).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onOpenLeefstijlprofiel(d)}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 border-t border-[var(--divider)] bg-transparent py-3 text-left first:border-t-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-[#F1EFE8]">{PILLAR[d].label}</span>
                <span className="block text-[12px] text-[#9FB0A6]">
                  {gekozen === 0 ? "nog niets gekozen" : `${gekozen} gekozen`}
                </span>
              </span>
              <Icons.ChevronRight s={16} style={{ color: "#9FB0A6", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * §2 · Producten — twee bronnen, twee secties, altijd in die volgorde (N2).
 * Aanbevolen komt uit het systeem: de twee gratis schap-basiskaarten (nooit
 * gegate) plus de kandidaten met commissie/oordeel achter de poort
 * (DomainSupplementStance). Mijn keuze is uitsluitend wat de klant zelf
 * bewaarde — een aanbeveling wordt hier nooit stilzwijgend een keuze.
 */
function ProductenTab({
  domain,
  items,
  isSaved,
  onSave,
  verdicts,
  nutritionLogCompleted,
}: {
  domain: PillarId;
  items: VoortgangFavoriteItem[];
  isSaved: (id: string) => boolean;
  onSave: (item: VoortgangFavoriteItem) => void;
  verdicts: DashboardData["supplementVerdicts"];
  nutritionLogCompleted: boolean;
}) {
  const gekozen = items.filter(
    (item) =>
      item.domain === domain &&
      (item.kind === "supplement" || SCHAP_BASIS_CARD_IDS.has(item.id)),
  );

  return (
    <div className="flex flex-col gap-7">
      <section aria-label="Aanbevolen producten">
        <VoortgangSectionHeader eyebrow="Aanbevolen" title="Wat past bij je check" />
        <p className="m-0 mb-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Dit leiden wij af uit je checks. Ons oordeel is gratis — kiezen is aan jou.
        </p>
        <div className="flex flex-col gap-2.5">
          {SCHAP_BASIS_CARDS.map((card) => (
            <MovementSchapBasisCard
              key={card.id}
              card={card}
              saved={isSaved(card.id)}
              onSave={() =>
                onSave({
                  id: card.id,
                  title: card.title,
                  kind: "activiteit",
                  domain,
                  source: "aanbevolen",
                })
              }
            />
          ))}
        </div>
        <div className="mt-2.5">
          <DomainSupplementStance
            domain="movement"
            verdicts={verdicts ?? []}
            nutritionLogCompleted={nutritionLogCompleted}
            surface="favorieten_schap_producten"
            openByDefault
            showFavoriteSave
            favoriteSource="aanbevolen"
          />
        </div>
      </section>

      <section aria-label="Mijn keuze producten">
        <VoortgangSectionHeader eyebrow="Mijn keuze" title="Wat jij koos" />
        {gekozen.length === 0 ? (
          <CockpitTile>
            <p className="m-0 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
              Je hebt hier nog niets gekozen.
            </p>
          </CockpitTile>
        ) : (
          <div className="flex flex-col gap-2">
            {gekozen.map((item) => (
              <CockpitTile key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 text-[14px] text-[#F1EFE8] text-pretty">
                    {item.title}
                  </span>
                  <FavoriteSaveButton compact surface="favorieten_schap_producten" item={item} />
                </div>
              </CockpitTile>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * §1/§7 · Diensten — zelfde twee-secties-vorm als Producten, maar zonder
 * afleiding en zonder poort (lock 7/8): een dienst heeft geen inname om te
 * meten. De vier kaarten zijn categorieën, geen met-naam-genoemde aanbieder
 * (zie schap-diensten.ts) — dus geen commissie-microcopy en geen
 * vergelijkingslink, die horen bij een echte, geverifieerde partij.
 */
function DienstenTab({
  domain,
  items,
  isSaved,
  onSave,
}: {
  domain: PillarId;
  items: VoortgangFavoriteItem[];
  isSaved: (id: string) => boolean;
  onSave: (item: VoortgangFavoriteItem) => void;
}) {
  const gekozen = items.filter((item) => item.domain === domain && item.kind === "dienst");

  return (
    <div className="flex flex-col gap-7">
      <section aria-label="Aanbevolen diensten">
        <VoortgangSectionHeader eyebrow="Aanbevolen" title="Categorieën die passen bij je check" />
        <p className="m-0 mb-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Dit zijn categorieën, geen specifieke aanbieder — die beoordelen we zodra we er een
          gekozen hebben.
        </p>
        <div className="flex flex-col gap-2.5">
          {SCHAP_DIENST_CARDS.map((card) => (
            <MovementSchapBasisCard
              key={card.id}
              card={card}
              saved={isSaved(card.id)}
              onSave={() =>
                onSave({
                  id: card.id,
                  title: card.title,
                  kind: "dienst",
                  domain,
                  source: "aanbevolen",
                })
              }
            />
          ))}
        </div>
      </section>

      <section aria-label="Mijn keuze diensten">
        <VoortgangSectionHeader eyebrow="Mijn keuze" title="Wat jij koos" />
        {gekozen.length === 0 ? (
          <CockpitTile>
            <p className="m-0 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
              Je hebt hier nog geen dienst gekozen.
            </p>
          </CockpitTile>
        ) : (
          <div className="flex flex-col gap-2">
            {gekozen.map((item) => (
              <CockpitTile key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 text-[14px] text-[#F1EFE8] text-pretty">
                    {item.title}
                  </span>
                  <FavoriteSaveButton compact surface="favorieten_schap_diensten" item={item} />
                </div>
              </CockpitTile>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BegeleidingTab() {
  return (
    <section aria-label="Begeleiding">
      <VoortgangSectionHeader eyebrow="Van PerfectSupplement" title="Onze eigen begeleiding" />
      <CockpitTile>
        <p className="m-0 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
          Je neemt nog niets van ons af.
        </p>
      </CockpitTile>
    </section>
  );
}
