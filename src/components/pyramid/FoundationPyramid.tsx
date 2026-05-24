"use client";

// FoundationPyramid: 5-laag visualisatie (Leefstijl als fundament).
// Niet te verwarren met FoundationStack (src/components/intake/) — dat is het
// basis-supplementen-blok in intake-resultaten.
//
// Modes:
// - preview: volledig statisch (toekomstig gebruik elders, niet op intake-intro)
// - personalized: alleen leefstijl-pijlers klikbaar; drawer via onPillarClick (caller)

import {
  FOUNDATION_BASE,
  LIFESTYLE_PILLARS,
  PYRAMID_LAYERS,
  type PillarId,
  type PyramidLayer,
  type PyramidLayerId,
} from "@/data/foundation-pyramid";
import {
  getDisplayStatusShort,
  type PillarDisplayStatus,
} from "@/lib/score-display";

export type PillarStatus =
  | "Sterk"
  | "Voldoende"
  | "Aandacht"
  | "Prioriteit"
  | "Niet gemeten";

type FoundationPyramidProps =
  | { mode: "preview" }
  | {
      mode: "personalized";
      pillarStatuses: Partial<Record<PillarId, PillarStatus>>;
      onPillarClick?: (pillarId: PillarId) => void;
    };

const CX = 200;

type LayerGeometry = {
  id: PyramidLayerId;
  yTop: number;
  yBottom: number;
  halfTop: number;
  halfBottom: number;
};

const LAYER_GEOMETRY: LayerGeometry[] = [
  { id: "vitality", yTop: 8, yBottom: 52, halfTop: 26, halfBottom: 38 },
  { id: "tools", yTop: 56, yBottom: 108, halfTop: 38, halfBottom: 58 },
  { id: "supplements", yTop: 112, yBottom: 172, halfTop: 58, halfBottom: 82 },
  { id: "outcomes", yTop: 176, yBottom: 244, halfTop: 82, halfBottom: 110 },
  { id: "lifestyle", yTop: 248, yBottom: 332, halfTop: 110, halfBottom: 138 },
];

const STATUS_FILL: Record<PillarStatus, number> = {
  Sterk: 1,
  Voldoende: 0.75,
  Aandacht: 0.5,
  Prioriteit: 0.25,
  "Niet gemeten": 0.12,
};

const STATUS_FILL_COLOR: Record<PillarStatus, string> = {
  Sterk: "var(--intake-sage)",
  Voldoende: "rgba(244, 239, 230, 0.35)",
  Aandacht: "var(--intake-terra)",
  Prioriteit: "var(--intake-terra-deep)",
  "Niet gemeten": "rgba(244, 239, 230, 0.12)",
};

const STATUS_LEGEND: Array<{ label: string; color: string }> = [
  { label: "Sterk", color: STATUS_FILL_COLOR.Sterk },
  { label: "Voldoende", color: STATUS_FILL_COLOR.Voldoende },
  { label: "Aandacht", color: STATUS_FILL_COLOR.Aandacht },
  { label: "Prioriteit", color: STATUS_FILL_COLOR.Prioriteit },
  { label: "Niet gemeten", color: STATUS_FILL_COLOR["Niet gemeten"] },
];

function trapezoidPoints(geom: LayerGeometry): string {
  const { yTop, yBottom, halfTop, halfBottom } = geom;
  return [
    `${CX - halfTop},${yTop}`,
    `${CX + halfTop},${yTop}`,
    `${CX + halfBottom},${yBottom}`,
    `${CX - halfBottom},${yBottom}`,
  ].join(" ");
}

function getLayerMeta(id: PyramidLayerId): PyramidLayer {
  const layer = PYRAMID_LAYERS.find((entry) => entry.id === id);
  if (!layer) {
    throw new Error(`Unknown pyramid layer: ${id}`);
  }
  return layer;
}

function statusForPillar(
  props: FoundationPyramidProps,
  pillarId: PillarId,
): PillarStatus {
  if (props.mode !== "personalized") {
    return "Niet gemeten";
  }
  return props.pillarStatuses[pillarId] ?? "Niet gemeten";
}

function LayerLabel({
  layer,
  yCenter,
  compact = false,
}: {
  layer: PyramidLayer;
  yCenter: number;
  compact?: boolean;
}) {
  const titleOffset = layer.subtitle ? (compact ? 4 : 6) : 2;
  return (
    <>
      <text
        x={CX}
        y={yCenter - (compact ? 6 : 10)}
        textAnchor="middle"
        className="fill-intake-ink-subtle text-[9px] font-semibold uppercase tracking-[0.14em]"
      >
        {layer.eyebrow}
      </text>
      <text
        x={CX}
        y={yCenter + titleOffset}
        textAnchor="middle"
        className="fill-intake-ink text-[11px] font-medium"
      >
        {layer.label}
      </text>
      {layer.subtitle ? (
        <text
          x={CX}
          y={yCenter + (compact ? 18 : 20)}
          textAnchor="middle"
          className="fill-intake-ink-muted text-[9px]"
        >
          {layer.subtitle}
        </text>
      ) : null}
    </>
  );
}

function StatusLegend() {
  return (
    <div
      className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
      aria-label="Legenda statuskleuren"
    >
      {STATUS_LEGEND.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[10px] text-intake-ink-subtle"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm border border-intake-card-border"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function LifestylePillars({
  geom,
  props,
}: {
  geom: LayerGeometry;
  props: FoundationPyramidProps;
}) {
  const innerTop = geom.yTop + 50;
  const innerBottom = geom.yBottom - 8;
  const innerHeight = innerBottom - innerTop;
  const count = LIFESTYLE_PILLARS.length;
  const totalWidth = geom.halfBottom * 2 - 16;
  const colWidth = totalWidth / count;
  const startX = CX - totalWidth / 2;
  const isPersonalized = props.mode === "personalized";
  const onPillarClick =
    props.mode === "personalized" ? props.onPillarClick : undefined;
  const isClickable = isPersonalized && Boolean(onPillarClick);

  function handlePillarActivate(pillarId: PillarId) {
    onPillarClick?.(pillarId);
  }

  return (
    <g>
      {LIFESTYLE_PILLARS.map((pillar, index) => {
        const x = startX + index * colWidth;
        const status = statusForPillar(props, pillar.id);
        const fillRatio = STATUS_FILL[status];
        const barHeight = innerHeight * fillRatio;
        const pillarLabel = `${pillar.label}, ${isPersonalized ? status : pillar.sublabel}`;

        return (
          <g key={pillar.id}>
            {index > 0 ? (
              <line
                x1={x}
                y1={innerTop}
                x2={x}
                y2={innerBottom}
                stroke="var(--intake-divider)"
                strokeWidth={1}
              />
            ) : null}

            {isPersonalized ? (
              <>
                <rect
                  x={x + 2}
                  y={innerTop}
                  width={colWidth - 4}
                  height={innerBottom - innerTop + 18}
                  fill="transparent"
                  className={
                    onPillarClick
                      ? "cursor-pointer focus:outline-none hover:opacity-90"
                      : undefined
                  }
                  tabIndex={onPillarClick ? 0 : undefined}
                  role={onPillarClick ? "button" : undefined}
                  aria-label={`${pillarLabel}. Tik voor uitleg en tips.`}
                  onClick={() => handlePillarActivate(pillar.id)}
                  onKeyDown={(event) => {
                    if (!onPillarClick) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handlePillarActivate(pillar.id);
                    }
                  }}
                />
                {isClickable ? (
                  <rect
                    x={x + 4}
                    y={innerTop + 28}
                    width={colWidth - 8}
                    height={innerBottom - innerTop - 28}
                    rx={2}
                    fill="transparent"
                    stroke="var(--intake-terra)"
                    strokeWidth={0.75}
                    strokeDasharray="3 2"
                    strokeOpacity={0.45}
                    pointerEvents="none"
                  />
                ) : null}
                <rect
                  x={x + 4}
                  y={innerBottom - barHeight}
                  width={colWidth - 8}
                  height={barHeight}
                  rx={2}
                  fill={STATUS_FILL_COLOR[status]}
                  pointerEvents="none"
                />
                <text
                  x={x + colWidth / 2}
                  y={innerTop + 10}
                  textAnchor="middle"
                  className={`pointer-events-none text-[8px] font-semibold ${
                    isClickable ? "fill-intake-terra" : "fill-intake-ink font-medium"
                  }`}
                >
                  {pillar.label}
                </text>
                {isClickable ? (
                  <line
                    x1={x + colWidth * 0.2}
                    y1={innerTop + 12}
                    x2={x + colWidth * 0.8}
                    y2={innerTop + 12}
                    stroke="var(--intake-terra)"
                    strokeWidth={0.75}
                    strokeOpacity={0.7}
                    pointerEvents="none"
                  />
                ) : null}
                <text
                  x={x + colWidth / 2}
                  y={innerTop + 22}
                  textAnchor="middle"
                  className="fill-intake-ink-muted pointer-events-none text-[7px] font-semibold uppercase tracking-wide"
                >
                  {getDisplayStatusShort(status as PillarDisplayStatus)}
                </text>
              </>
            ) : (
              <>
                <text
                  x={x + colWidth / 2}
                  y={innerTop + 10}
                  textAnchor="middle"
                  className="fill-intake-ink text-[8px] font-medium"
                >
                  {pillar.label}
                </text>
                <text
                  x={x + colWidth / 2}
                  y={innerTop + 24}
                  textAnchor="middle"
                  className="fill-intake-ink-subtle text-[7px]"
                >
                  {pillar.sublabel}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

export default function FoundationPyramid(props: FoundationPyramidProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-[640px]">
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label="PerfectSupplement Foundation Pyramid — leefstijl eerst, optimalisatie als laatste"
        className="h-auto w-full"
      >
        <title>PerfectSupplement Foundation Pyramid</title>
        <desc>
          Vijf lagen: leefstijl als fundament, vitaliteit, supplementen, tools
          en longevity bovenaan.
        </desc>

        {LAYER_GEOMETRY.map((geom) => {
          const layer = getLayerMeta(geom.id);
          const yCenter = (geom.yTop + geom.yBottom) / 2;
          const isLifestyle = geom.id === "lifestyle";

          return (
            <g key={geom.id}>
              <polygon
                points={trapezoidPoints(geom)}
                fill={
                  isLifestyle
                    ? "rgba(90, 143, 106, 0.14)"
                    : "var(--intake-bg-elevated)"
                }
                stroke={
                  isLifestyle ? "var(--intake-terra)" : "var(--intake-card-border)"
                }
                strokeWidth={isLifestyle ? 1.5 : 1}
                pointerEvents="none"
              />
              {!isLifestyle ? (
                <g pointerEvents="none">
                  <LayerLabel layer={layer} yCenter={yCenter} compact />
                </g>
              ) : (
                <g>
                  <text
                    x={CX}
                    y={geom.yTop + 14}
                    textAnchor="middle"
                    pointerEvents="none"
                    className="fill-intake-ink-subtle text-[9px] font-semibold uppercase tracking-[0.14em]"
                  >
                    {layer.eyebrow}
                  </text>
                  <text
                    x={CX}
                    y={geom.yTop + 28}
                    textAnchor="middle"
                    pointerEvents="none"
                    className="fill-intake-ink text-[11px] font-medium"
                  >
                    {layer.label}
                  </text>
                  {layer.subtitle ? (
                    <text
                      x={CX}
                      y={geom.yTop + 42}
                      textAnchor="middle"
                      pointerEvents="none"
                      className="fill-intake-ink-muted text-[9px]"
                    >
                      {layer.subtitle}
                    </text>
                  ) : null}
                  <LifestylePillars geom={geom} props={props} />
                </g>
              )}
            </g>
          );
        })}

        <g pointerEvents="none">
          <rect
            x={CX - 130}
            y={340}
            width={260}
            height={36}
            rx={6}
            fill="var(--intake-divider)"
            stroke="var(--intake-card-border)"
            strokeWidth={1}
          />

          {FOUNDATION_BASE.map((item, index) => {
            const slotWidth = 260 / FOUNDATION_BASE.length;
            const x = CX - 130 + index * slotWidth + slotWidth / 2;
            return (
              <g key={item.id}>
                {index > 0 ? (
                  <circle
                    cx={CX - 130 + index * slotWidth}
                    cy={358}
                    r={1.5}
                    fill="var(--intake-ink-subtle)"
                  />
                ) : null}
                <text
                  x={x}
                  y={362}
                  textAnchor="middle"
                  className="fill-intake-ink-muted text-[9px]"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <p className="mt-4 text-center text-xs leading-relaxed text-intake-ink-subtle">
        Lezen van onder naar boven: sterke leefstijl maakt sterke gezondheid
        mogelijk. Supplementen vullen aan waar leefstijl niet rond komt.
      </p>
      {props.mode === "personalized" ? (
        <>
          <p className="mt-2 text-center text-[10px] text-intake-ink-subtle">
            Balkhoogte = status · leefstijlgebieden zijn klikbaar
          </p>
          <StatusLegend />
        </>
      ) : null}
    </div>
  );
}
