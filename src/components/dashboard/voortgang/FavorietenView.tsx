"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { buildDashboardVoortgangHref } from "@/lib/dashboard-url";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites, type VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";

type FavorietenViewProps = {
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

/**
 * De laag waar deze keuze vandaan komt — "Laag 2 · Kracht + basisconditie".
 *
 * Dit is de terugweg naar de plek waar je hem koos. Tot 22 augustus droeg
 * `MijnKeuzeTile` op Kompas die herkomst; nu die tegel weg is, is dit de enige
 * plek waar hij nog te lezen valt (roadmap §7, R1).
 */
function layerLabel(item: VoortgangFavoriteItem): string | null {
  const laag = item.domain ? parseLadderFavoriteLayer(item.id) : null;
  if (!item.domain || laag == null) {
    return null;
  }
  const naam = resolveLadderLayerName(item.domain, laag);
  return naam ? `Laag ${laag} · ${naam}` : `Laag ${laag}`;
}

function sourceLabel(source: VoortgangFavoriteItem["source"]): string | null {
  if (source === "aanbevolen") {
    return "Aanbevolen";
  }
  if (source === "mijn_keuze") {
    return "Mijn keuze";
  }
  return null;
}

export default function FavorietenView({ onBack }: FavorietenViewProps) {
  const { items, remove } = useVoortgangFavorites();
  const leefstijlprofielHref = buildDashboardVoortgangHref("leefstijlprofiel");

  const grouped = items.reduce<Record<string, VoortgangFavoriteItem[]>>((acc, item) => {
    const key = item.domain ?? "overig";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "overig") {
      return 1;
    }
    if (b === "overig") {
      return -1;
    }
    return a.localeCompare(b);
  });

  return (
    <section aria-label="Favorieten" style={{ paddingTop: 16, paddingBottom: 8 }}>
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
          Favorieten
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <VoortgangSectionHeader
            eyebrow="Opgeslagen"
            title="Nog niets bewaard"
            body="Bewaar aanbevelingen of keuzes vanuit je leefstijlprofiel — dan staan ze hier."
          />
          <Link
            href={leefstijlprofielHref}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--sage)] bg-[rgba(90,143,106,0.12)] px-5 py-[13px] text-[14.5px] font-semibold text-[var(--sage)] no-underline transition hover:bg-[rgba(90,143,106,0.2)]"
          >
            Naar leefstijlprofiel
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groupKeys.map((domainKey) => {
            const domainLabel =
              domainKey === "overig"
                ? "Overig"
                : (PILLAR[domainKey as keyof typeof PILLAR]?.label ?? domainKey);

            return (
              <section key={domainKey} aria-label={`Favorieten ${domainLabel}`}>
                <VoortgangSectionHeader eyebrow={domainLabel} title="Opgeslagen" />
                <ul className="m-0 list-none overflow-hidden rounded-xl border border-[var(--divider)]">
                  {grouped[domainKey].map((item) => (
                    <li key={item.id} className="border-t border-[var(--divider)] first:border-t-0">
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <Icons.Heart s={16} style={{ color: "var(--sage)", flexShrink: 0 }} />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-[var(--text)]">
                            {item.title}
                          </span>
                          <span className="block text-[11px] text-[var(--text-subtle)]">
                            {kindLabel(item.kind)}
                            {sourceLabel(item.source) ? ` · ${sourceLabel(item.source)}` : ""}
                            {layerLabel(item) ? ` · ${layerLabel(item)}` : ""}
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
          })}
        </div>
      )}

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
