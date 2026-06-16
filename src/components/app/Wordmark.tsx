export type WordmarkProps = {
  size?: number;
};

export default function Wordmark({ size = 1 }: WordmarkProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 * size }}>
      <div
        style={{
          width: 30 * size,
          height: 30 * size,
          borderRadius: 9 * size,
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f1c10",
          fontFamily: "var(--f-serif)",
          fontSize: 18 * size,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        P
      </div>
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 18 * size,
          letterSpacing: "0.01em",
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        Perfect
        <span style={{ color: "var(--text-muted)" }}>Supplement</span>
      </div>
    </div>
  );
}
