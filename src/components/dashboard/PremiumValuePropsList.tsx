import { PREMIUM_STATISTIEKEN_VALUE_PROPS } from "@/data/dashboard/premium-value-props";

type PremiumValuePropsListProps = {
  variant?: "full" | "comingSoonOnly";
};

export default function PremiumValuePropsList({
  variant = "full",
}: PremiumValuePropsListProps) {
  const items =
    variant === "comingSoonOnly"
      ? PREMIUM_STATISTIEKEN_VALUE_PROPS.filter((item) => item.comingSoon)
      : PREMIUM_STATISTIEKEN_VALUE_PROPS;

  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        textAlign: "left",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  lineHeight: 1.35,
                }}
              >
                {item.title}
              </div>
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
        </li>
      ))}
    </ul>
  );
}
