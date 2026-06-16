type WordmarkProps = {
  size?: number;
};

export default function Wordmark({ size = 1 }: WordmarkProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 30 * size,
          height: 30 * size,
          borderRadius: 9 * size,
          flexShrink: 0,
          background: "var(--sage)",
          color: "#0f1c10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--f-serif)",
          fontSize: 18 * size,
          lineHeight: 1,
        }}
      >
        P
      </div>
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 18 * size,
          color: "var(--text)",
          letterSpacing: "0.01em",
        }}
      >
        Perfect<span style={{ color: "var(--text-muted)" }}>Supplement</span>
      </div>
    </div>
  );
}
