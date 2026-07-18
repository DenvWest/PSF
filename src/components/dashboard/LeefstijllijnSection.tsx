"use client";

import * as Icons from "@/components/app/icons";
import { Card, DeltaBadge, Sparkline } from "@/components/app/primitives";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type LeefstijllijnSectionProps = {
  model: DashboardModel;
  surface?: "voortgang" | "domain";
  compact?: boolean;
  focusPillarId?: PillarId;
};

export default function LeefstijllijnSection({
  model,
  surface = "voortgang",
  compact = false,
  focusPillarId,
}: LeefstijllijnSectionProps) {
  const rows = buildLeefstijllijnRows(model).filter(
    (row) => !focusPillarId || row.pillarId === focusPillarId,
  );
  const isLight = surface === "domain";

  return (
    <section aria-label="Leefstijllijn">
      <div style={{ marginBottom: compact ? 10 : 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isLight ? "#78716c" : "var(--text-subtle)",
            marginBottom: 6,
          }}
        >
          Analyse
        </div>
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: compact ? 19 : 21,
            color: isLight ? "#1c1917" : "var(--text)",
            lineHeight: 1.15,
          }}
        >
          Jouw lijn
        </div>
        {!compact ? (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              lineHeight: 1.5,
              color: isLight ? "#57534e" : "var(--text-muted)",
              textWrap: "pretty",
            }}
          >
            Score per domein over je checks — begin en laatste meting op één curve.
          </p>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
        {rows.map((row) => {
          const Icon = Icons[row.icon];
          const hasTrend = row.trend.length >= 2;

          return (
            <Card
              key={row.pillarId}
              pad={compact ? 12 : 14}
              surface={isLight ? "light" : undefined}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: `${row.color}14`,
                    color: row.color,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  <Icon s={18} />
                </span>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: isLight ? "#1c1917" : "var(--text)",
                      }}
                    >
                      {row.label}
                    </span>
                    {hasTrend && row.baselineScore != null ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: isLight ? "#78716c" : "var(--text-subtle)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Begin {row.baselineScore}
                      </span>
                    ) : null}
                  </div>
                  <Sparkline
                    data={hasTrend ? row.trend : null}
                    color={row.color}
                    h={compact ? 34 : 40}
                    empty={!hasTrend}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--f-serif)",
                      fontSize: 22,
                      color: isLight ? "#1c1917" : "var(--text)",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {row.currentScore}
                  </span>
                  <DeltaBadge delta={row.delta} empty={row.delta == null} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
