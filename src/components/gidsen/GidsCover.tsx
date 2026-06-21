import type { CSSProperties } from "react";

type GidsCoverProps = {
  title: string;
  accent: string;
  label?: string;
  subtitle?: string;
  brand?: string;
  className?: string;
};

function getTitleSize(title: string): string {
  if (title.length > 9) {
    return "12.5cqw";
  }
  if (title.length > 6) {
    return "16.5cqw";
  }
  return "21cqw";
}

export default function GidsCover({
  title,
  accent,
  label = "Gratis compacte gids",
  subtitle = "voor mannen 40+",
  brand = "PerfectSupplement",
  className,
}: GidsCoverProps) {
  const titleSize = getTitleSize(title);
  const coverStyle = {
    "--ac": accent,
    "--ts": titleSize,
  } as CSSProperties;

  return (
    <div
      className={`flex h-full w-full items-center justify-center [container-type:inline-size] ${className ?? ""}`}
      style={{
        ...coverStyle,
        containerType: "inline-size",
        perspective: "1500px",
        perspectiveOrigin: "54% 44%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "86cqw",
          height: "122cqw",
          transformStyle: "preserve-3d",
          transform: "rotateY(-22deg) rotateX(1.5deg)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "8%",
            right: "16%",
            bottom: "-7cqw",
            height: "14cqw",
            background: "rgba(8,16,11,.5)",
            filter: "blur(8cqw)",
            borderRadius: "50%",
            transform: "translateZ(-26cqw)",
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "86cqw",
            height: "122cqw",
            transform: "translate(-50%,-50%) rotateY(180deg) translateZ(3cqw)",
            background: "#0d1611",
            borderRadius: "1.5cqw",
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "86cqw",
            height: "6cqw",
            transform: "translate(-50%,-50%) rotateX(90deg) translateZ(61cqw)",
            background: "linear-gradient(90deg,#e9e2d2,#d3cab6)",
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "6cqw",
            height: "122cqw",
            transform: "translate(-50%,-50%) rotateY(90deg) translateZ(43cqw)",
            background:
              "repeating-linear-gradient(to bottom,#efe9da 0 0.45cqw,#c9bea8 0.45cqw,#c9bea8 0.9cqw)",
            boxShadow: "inset 0 0 3cqw rgba(0,0,0,.15)",
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "6cqw",
            height: "122cqw",
            transform: "translate(-50%,-50%) rotateY(-90deg) translateZ(43cqw)",
            background: "linear-gradient(90deg,#0e1812,#16271d 45%,#0c140f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1cqw 0 0 1cqw",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "2.4cqw",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "color-mix(in srgb, var(--ac) 70%, #cfd9d0)",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "86cqw",
            height: "122cqw",
            transform: "translate(-50%,-50%) translateZ(3cqw)",
            borderRadius: "1cqw 1.8cqw 1.8cqw 1cqw",
            overflow: "hidden",
            background:
              "linear-gradient(158deg, color-mix(in oklab,#17281e 84%, var(--ac)) 0%, #14241a 46%, #0e1813 100%)",
            boxShadow:
              "inset 6cqw 0 12cqw -6cqw rgba(0,0,0,.55), inset 0 0 1px rgba(255,255,255,.06)",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-26cqw",
              right: "-22cqw",
              width: "90cqw",
              height: "90cqw",
              borderRadius: "50%",
              background:
                "repeating-radial-gradient(circle at center, transparent 0 9.4cqw, color-mix(in srgb, var(--ac) 26%, transparent) 9.4cqw 9.9cqw, transparent 9.9cqw 12cqw)",
              opacity: 0.85,
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(118deg, rgba(255,255,255,.07) 0%, transparent 32%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              padding: "9.5cqw 8.5cqw",
            }}
          >
            <div style={{ marginBottom: "auto" }}>
              <div
                style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "3cqw",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "color-mix(in srgb, var(--ac) 78%, #e7ede8)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  width: "9cqw",
                  height: "0.5cqw",
                  marginTop: "3.5cqw",
                  background: "var(--ac)",
                  borderRadius: "1cqw",
                }}
              />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
                fontWeight: 400,
                fontSize: "var(--ts)",
                lineHeight: 0.92,
                letterSpacing: "-0.01em",
                color: "#F4F1E9",
                margin: 0,
              }}
            >
              {title}
            </h2>
            <div
              style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "3.9cqw",
                letterSpacing: "0.01em",
                color: "rgba(231,237,232,.62)",
                marginTop: "3.2cqw",
              }}
            >
              {subtitle}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2.4cqw",
                marginTop: "8.5cqw",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: "3cqw",
                  height: "3cqw",
                  background: "var(--ac)",
                  transform: "rotate(45deg)",
                  borderRadius: "0.5cqw",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "3.7cqw",
                  letterSpacing: "0.005em",
                  color: "#EDEAE0",
                }}
              >
                {brand}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
