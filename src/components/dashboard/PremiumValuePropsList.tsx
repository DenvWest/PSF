import type { ComponentType } from "react";
import * as Icons from "@/components/app/icons";
import type { IconProps } from "@/components/app/icons";
import {
  getPremiumValuePropsByIds,
  PREMIUM_HUB_VALUE_PROP_IDS,
  PREMIUM_SOFT_UPSELL_PROP_IDS,
  PREMIUM_STATISTIEKEN_VALUE_PROPS,
  type PremiumValuePropIcon,
} from "@/data/dashboard/premium-value-props";

type PremiumValuePropsListProps = {
  variant?: "hub" | "softUpsell" | "comingSoonOnly";
};

const PREMIUM_VALUE_PROP_ICONS: Record<
  PremiumValuePropIcon,
  ComponentType<IconProps>
> = {
  trend: Icons.TrendUp,
  compare: Icons.Refresh,
  target: Icons.Target,
  calendar: Icons.Calendar,
};

function ValuePropIconChip({ icon }: { icon: PremiumValuePropIcon }) {
  const Icon = PREMIUM_VALUE_PROP_ICONS[icon];

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "rgba(200,149,108,0.1)",
        border: "1px solid rgba(200,149,108,0.22)",
        color: "var(--terra, #C8956C)",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Icon s={16} />
    </span>
  );
}

export default function PremiumValuePropsList({
  variant = "hub",
}: PremiumValuePropsListProps) {
  const items =
    variant === "comingSoonOnly"
      ? PREMIUM_STATISTIEKEN_VALUE_PROPS.filter((item) => item.comingSoon)
      : variant === "softUpsell"
        ? getPremiumValuePropsByIds(PREMIUM_SOFT_UPSELL_PROP_IDS)
        : getPremiumValuePropsByIds(PREMIUM_HUB_VALUE_PROP_IDS);

  if (items.length === 0) {
    return null;
  }

  const compact = variant === "softUpsell";

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 10 : 14,
        textAlign: "left",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <ValuePropIconChip icon={item.icon} />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: compact ? 13 : 14,
                    fontWeight: 600,
                    color: "var(--text)",
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </div>
                {!compact ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      margin: "4px 0 0",
                      textWrap: "pretty",
                    }}
                  >
                    {item.body}
                  </p>
                ) : null}
              </div>
              {item.comingSoon ? (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--terra, #C8956C)",
                    border: "1px solid rgba(200,149,108,0.4)",
                    borderRadius: 999,
                    padding: "3px 8px",
                  }}
                >
                  Binnenkort
                </span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
