const bar = (width: number | string, height: number, opacity = 0.08) => ({
  width,
  height,
  borderRadius: 8,
  background: `rgba(255,255,255,${opacity})`,
});

const card = {
  borderRadius: 28,
  border: "1px solid var(--panel-border)",
  background: "rgba(255,255,255,0.04)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
} as const;

export default function DashboardLoading() {
  return (
    <div className="ps-dark ps-dash-surface-kompas min-h-dvh" aria-busy="true">
      <main
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding:
            "clamp(20px, 4vh, 36px) 18px calc(96px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className="animate-pulse"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={bar(120, 22, 0.12)} />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ ...bar(38, 38, 0.06), borderRadius: 11 }} />
              <div style={{ ...bar(38, 38, 0.06), borderRadius: 11 }} />
            </div>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={bar(220, 30, 0.14)} />
            <div style={bar("80%", 16, 0.08)} />
          </div>

          <div style={card}>
            <div style={bar(140, 14, 0.1)} />
            <div style={bar(200, 22, 0.12)} />
            <div style={bar("90%", 14, 0.06)} />
            <div style={bar("70%", 14, 0.06)} />
          </div>

          <div style={card}>
            <div style={bar(120, 14, 0.1)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={bar("100%", 44, 0.05)} />
              <div style={bar("100%", 44, 0.05)} />
              <div style={bar("100%", 44, 0.05)} />
            </div>
          </div>
        </div>
      </main>

      <nav
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
          background: "rgba(16,26,16,0.92)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--panel-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className="animate-pulse"
          style={{ display: "flex", width: "100%", maxWidth: 600 }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "9px 4px 11px",
              }}
            >
              <div style={{ ...bar(20, 20, 0.1), borderRadius: 6 }} />
              <div style={bar(34, 9, 0.08)} />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
