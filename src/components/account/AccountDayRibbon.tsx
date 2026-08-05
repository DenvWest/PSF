import {
  DAYPART_HOUR_TICKS,
  DAYPART_SEGMENTS,
  describeScheduledTime,
  ribbonRatioForTime,
} from "@/lib/daypart-ribbon";

type AccountDayRibbonProps = {
  scheduledTime: string | null;
  domainLabel: string;
  domainColor: string;
};

const SEGMENT_TINT: Record<string, string> = {
  ochtend: "rgba(196,135,59,0.16)",
  middag: "rgba(90,143,106,0.16)",
  avond: "rgba(91,110,174,0.18)",
};

function clampChipRatio(ratio: number): number {
  return Math.min(0.88, Math.max(0.12, ratio));
}

/**
 * Eén rail: 06–24u, dagdelen als zachte banden, je vaste tijd als markering.
 * Verzet je de tijd elders op de pagina, dan schuift deze mee — het is een
 * weergave van de instelling eronder, geen losstaande illustratie.
 */
export default function AccountDayRibbon({
  scheduledTime,
  domainLabel,
  domainColor,
}: AccountDayRibbonProps) {
  const markerRatio = ribbonRatioForTime(scheduledTime);
  const timeLabel = describeScheduledTime(scheduledTime);

  return (
    <figure
      style={{
        margin: 0,
        padding: 16,
        borderRadius: 16,
        border: "1px solid var(--panel-border, rgba(22,40,26,0.12))",
        background: "rgba(22,40,26,0.03)",
      }}
      aria-labelledby="account-day-ribbon-caption"
    >
      <figcaption
        id="account-day-ribbon-caption"
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-subtle)",
        }}
      >
        Jouw dagritme
      </figcaption>

      <div
        role="img"
        aria-label={`Dagstap ${domainLabel} om ${timeLabel}.`}
        style={{ marginTop: 16, position: "relative", height: 46 }}
      >
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            top: 20,
            height: 20,
            display: "flex",
            overflow: "hidden",
            borderRadius: 999,
            border: "1px solid var(--panel-border, rgba(22,40,26,0.12))",
          }}
        >
          {DAYPART_SEGMENTS.map((segment) => (
            <div
              key={segment.id}
              style={{
                width: `${(segment.endRatio - segment.startRatio) * 100}%`,
                height: "100%",
                background: SEGMENT_TINT[segment.id],
              }}
            />
          ))}
        </div>

        {markerRatio !== null ? (
          <>
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 16,
                left: `${markerRatio * 100}%`,
                transform: "translateX(-50%)",
                height: 28,
                width: 6,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.6)",
                background: domainColor,
                boxShadow: `0 0 10px 1px ${domainColor}55`,
              }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: `${clampChipRatio(markerRatio) * 100}%`,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                borderRadius: 999,
                border: "1px solid var(--panel-border, rgba(22,40,26,0.12))",
                background: "var(--bg, #fff)",
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: "var(--text)",
              }}
            >
              {scheduledTime}
            </span>
          </>
        ) : (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              borderRadius: 999,
              border: "1px dashed var(--panel-border, rgba(22,40,26,0.2))",
              padding: "3px 8px",
              fontSize: 11,
              color: "var(--text-subtle)",
            }}
          >
            Nog geen vaste tijd
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-subtle)",
        }}
      >
        {DAYPART_HOUR_TICKS.map((hour) => (
          <span key={hour}>{String(hour).padStart(2, "0")}</span>
        ))}
      </div>
    </figure>
  );
}
