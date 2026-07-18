import { Card } from "@/components/app/primitives";
import type { MovementRecoveryTrendPoint } from "@/lib/movement-recovery-context";

type MovementRecoveryTrendsCardProps = {
  trend: MovementRecoveryTrendPoint[];
};

const FEEL_LABELS: Record<number, string> = {
  1: "Uitgeput",
  2: "Moe",
  3: "Matig",
  4: "Redelijk",
  5: "Fris",
};

export default function MovementRecoveryTrendsCard({
  trend,
}: MovementRecoveryTrendsCardProps) {
  if (trend.length === 0) {
    return (
      <Card pad={20}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
          Herstelgevoel volg je via de beweeg-check-in. Doe de check opnieuw om je trend te
          vullen — wearable-HRV komt later bij lidmaatschap.
        </p>
      </Card>
    );
  }

  const latest = trend[trend.length - 1];

  return (
    <Card pad={20}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-subtle)",
            }}
          >
            Herstelgevoel · beweging
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 22, color: "var(--text)" }}>
            {FEEL_LABELS[latest.value] ?? latest.value}
            <span style={{ fontSize: 13, color: "var(--text-subtle)", marginLeft: 8 }}>
              laatste check-in
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", minHeight: 56 }}>
          {trend.map((point) => (
            <div
              key={`${point.date}-${point.value}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 28,
                  height: `${Math.max(12, point.value * 10)}px`,
                  borderRadius: 6,
                  background:
                    point.value <= 2
                      ? "rgba(200,149,108,0.55)"
                      : "rgba(122,158,126,0.55)",
                }}
                aria-hidden
              />
              <span style={{ fontSize: 10, color: "var(--text-subtle)" }}>
                {point.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.5 }}>
          Self-report uit je beweeg-check-in — geen live HRV. Wearable-verdieping volgt met
          lidmaatschap.
        </p>
      </div>
    </Card>
  );
}
