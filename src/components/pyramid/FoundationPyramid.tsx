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
}: {
  layer: PyramidLayer;
  yCenter: number;
}) {
  return (
    <>
      <text
        x={CX}
        y={yCenter - 10}
        textAnchor="middle"
        className="fill-intake-ink-subtle text-[9px] font-semibold uppercase tracking-[0.14em]"
      >
        {layer.eyebrow}
      </text>
      <text
        x={CX}
        y={yCenter + 6}
        textAnchor="middle"
        className="fill-intake-ink text-[11px] font-medium"
      >
        {layer.label}
      </text>
      {layer.subtitle ? (
        <text
          x={CX}
          y={yCenter + 20}
          textAnchor="middle"
          className="fill-intake-ink-muted text-[9px]"
        >
          {layer.subtitle}
        </text>
      ) : null}
    </>
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
                      ? "cursor-pointer focus:outline-none"
                      : undefined
                  }
                  tabIndex={onPillarClick ? 0 : undefined}
                  role={onPillarClick ? "button" : undefined}
                  aria-label={pillarLabel}
                  onClick={() => handlePillarActivate(pillar.id)}
                  onKeyDown={(event) => {
                    if (!onPillarClick) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handlePillarActivate(pillar.id);
                    }
                  }}
                />
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
                  className="fill-intake-ink pointer-events-none text-[8px] font-medium"
                >
                  {pillar.label}
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
          Vijf lagen: leefstijl als fundament, gezondheidsuitkomsten, supplementen,
          tools en tracking, vitaliteit bovenaan.
        </desc>

        {LAYER_GEOMETRY.map((geom) => {
          const layer = getLayerMeta(geom.id);
          const yCenter = (geom.yTop + geom.yBottom) / 2;
          const isLifestyle = geom.id === "lifestyle";

          return (
            <g key={geom.id}>
              <polygon
                points={trapezoidPoints(geom)}
                fill="var(--intake-bg-elevated)"
                stroke="var(--intake-card-border)"
                strokeWidth={1}
                pointerEvents="none"
              />
              {!isLifestyle ? (
                <g pointerEvents="none">
                  <LayerLabel layer={layer} yCenter={yCenter} />
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
        <p className="mt-2 text-center text-[10px] text-intake-ink-subtle">
          Balkhoogte = status · groen = sterk · terra = aandacht of prioriteit
        </p>
      ) : null}
    </div>
  );
}
