type VoortgangSectionHeaderProps = {
  eyebrow: string;
  title?: string;
  body?: string;
  align?: "left" | "center";
};

export default function VoortgangSectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
}: VoortgangSectionHeaderProps) {
  const textAlign = align === "center" ? "center" : "left";

  return (
    <div style={{ marginBottom: 12, textAlign }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-subtle)",
          marginBottom: title ? 6 : 0,
        }}
      >
        {eyebrow}
      </div>
      {title ? (
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 20,
            color: "var(--text)",
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
      ) : null}
      {body ? (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
