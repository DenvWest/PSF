"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";
import type {
  DashboardData,
  DashboardModel,
  LeefstijlprofielView,
  PillarId,
} from "@/types/dashboard";
import FavorietenBewegingSection from "@/components/dashboard/voortgang/FavorietenBewegingSection";
import LeefstijlprofielSupplementSection from "@/components/dashboard/voortgang/LeefstijlprofielSupplementSection";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";

type FavorietenViewProps = {
  model: DashboardModel;
  data?: DashboardData;
  scopedDomein: PillarId | null;
  adviesExtra?: ReactNode;
  onBack: () => void;
};

function kindLabel(kind: VoortgangFavoriteItem["kind"]): string {
  if (kind === "activiteit") {
    return "Activiteit";
  }
  if (kind === "dienst") {
    return "Dienst";
  }
  return "Supplement";
}

function ProfileToggle({
  view,
  onChange,
}: {
  view: LeefstijlprofielView;
  onChange: (view: LeefstijlprofielView) => void;
}) {
  const handleChange = (next: LeefstijlprofielView) => {
    if (next === view) {
      return;
    }
    trackEvent("dashboard_favorieten_toggle", { view: next });
    clarityTag("dashboard_favorieten", next);
    onChange(next);
  };

  return (
    <div
      className="sticky bottom-0 z-10 -mx-1 border-t border-[var(--divider-strong)] bg-[var(--bg)]/95 px-1 py-3 backdrop-blur-sm"
      role="tablist"
      aria-label="Favorietenweergave"
    >
      <div className="flex gap-2">
        {(
          [
            { id: "aanbevolen" as const, label: "Aanbevolen" },
            { id: "mijn_keuze" as const, label: "Mijn keuze" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={view === option.id}
            onClick={() => handleChange(option.id)}
            className={`min-h-11 flex-1 cursor-pointer rounded-full border px-4 text-[13.5px] font-semibold transition ${
              view === option.id
                ? "border-[var(--sage)] bg-[rgba(90,143,106,0.14)] text-[var(--sage)]"
                : "border-[var(--divider)] bg-transparent text-[var(--text-muted)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SavedFavoritesList() {
  const { items, remove } = useVoortgangFavorites();

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Opgeslagen favorieten">
      <VoortgangSectionHeader eyebrow="Opgeslagen" title="Wat je bewaarde" />
      <ul className="m-0 list-none overflow-hidden rounded-xl border border-[var(--divider)]">
        {items.map((item) => (
          <li key={item.id} className="border-t border-[var(--divider)] first:border-t-0">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Icons.Heart s={16} style={{ color: "var(--sage)", flexShrink: 0 }} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-[var(--text)]">
                  {item.title}
                </span>
                <span className="block text-[11px] text-[var(--text-subtle)]">
                  {kindLabel(item.kind)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Verwijder ${item.title} uit favorieten`}
                className="shrink-0 cursor-pointer rounded-lg border border-[var(--divider)] bg-transparent p-1.5 text-[var(--text-subtle)]"
              >
                <Icons.Plus s={14} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function FavorietenView({
  model,
  data,
  scopedDomein,
  adviesExtra,
  onBack,
}: FavorietenViewProps) {
  const [view, setView] = useState<LeefstijlprofielView>("aanbevolen");
  const supplementenHref = withVoortgangReturn("/supplementen");
  const scopedBeweging = scopedDomein === "beweging";
  const title = scopedDomein
    ? `Favorieten · ${PILLAR[scopedDomein].label}`
    : "Favorieten";

  const handleSupplementenHubClick = () => {
    trackEvent("dashboard_voortgang_supplementen_click", { surface: "favorieten" });
    clarityTag("dashboard_voortgang", "supplementen");
  };

  return (
    <section aria-label={title} style={{ paddingTop: 16, paddingBottom: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
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
          {title}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <section aria-label="Aanbevolen">
          <VoortgangSectionHeader eyebrow="Leefstijlkeuze" title="Wat past bij je check" />
          {scopedBeweging || scopedDomein == null ? (
            <FavorietenBewegingSection model={model} data={data} view={view} />
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                textWrap: "pretty",
              }}
            >
              Leefstijlkeuzes voor {PILLAR[scopedDomein].label.toLowerCase()} volgen in een
              volgende update — beweging is nu de blauwdruk.
            </p>
          )}
        </section>

        {view === "mijn_keuze" ? <SavedFavoritesList /> : null}

        {data ? (
          <LeefstijlprofielSupplementSection
            model={model}
            data={data}
            view={view}
            adviesExtra={adviesExtra}
          />
        ) : null}

        {view === "aanbevolen" ? (
          <Link
            href={supplementenHref}
            onClick={handleSupplementenHubClick}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--sage)] bg-[rgba(90,143,106,0.12)] px-5 py-[13px] text-[14.5px] font-semibold text-[var(--sage)] no-underline transition hover:bg-[rgba(90,143,106,0.2)]"
          >
            Alle supplementgidsen bekijken
          </Link>
        ) : null}
      </div>

      <ProfileToggle view={view} onChange={setView} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11.5,
          color: "var(--text-muted)",
          marginTop: 14,
        }}
      >
        <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
        <span>
          Algemene oriëntatie op basis van je antwoorden — geen persoonlijk medisch advies. Wij
          verkopen zelf niets.
        </span>
      </div>
    </section>
  );
}
