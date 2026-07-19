import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";

const ACCENT = "#5A8F6A";
const CIRCUMFERENCE = 2 * Math.PI * 64;
const EXAMPLE_SCORE = 62;
const DASH_OFFSET = CIRCUMFERENCE * (1 - EXAMPLE_SCORE / 100);

export default function MovementDashboardPreview() {
  return (
    <section
      id="dashboard-preview"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <p
          className="text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--ac)" }}
        >
          Straks: jouw eigen dashboard
        </p>
        <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
          Je toekomst wordt iets wat je kunt zien groeien
        </h2>
        <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-[#9FB0A6]">
          Geen los goed voornemen, maar een plek waar je je vooruitgang volgt —
          en waar elke week zichtbaar meetelt.
        </p>

        <div
          className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-6"
          style={{ background: "linear-gradient(160deg, #131F1D, #0C1315)" }}
        >
          <span className="absolute right-4 top-4 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#7E8C82]">
            voorbeeld
          </span>

          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute h-36 w-36 rounded-full opacity-30 blur-2xl"
                style={{ background: "var(--ac)" }}
              />
              <span className="relative text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                Future You Score
              </span>
              <svg
                viewBox="0 0 160 160"
                className="relative my-2 h-[140px] w-[140px]"
                role="img"
                aria-label={`Future You Score, voorbeeld: ${EXAMPLE_SCORE} van de 100`}
              >
                <circle cx="80" cy="80" r="64" fill="none" stroke="#22302E" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="var(--ac)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={DASH_OFFSET}
                  transform="rotate(-90 80 80)"
                />
                <text
                  x="80"
                  y="76"
                  textAnchor="middle"
                  fill="#F1EFE8"
                  fontSize="40"
                  className="font-serif"
                >
                  {EXAMPLE_SCORE}
                </text>
                <text
                  x="80"
                  y="98"
                  textAnchor="middle"
                  fill="#8B9A96"
                  fontSize="10"
                  letterSpacing="1"
                >
                  VAN DE 100
                </text>
              </svg>
              <span className="relative text-[12.5px]" style={{ color: "var(--ac)" }}>
                groeit naar 78 met je plan →
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
                    Beweegstreak
                  </span>
                  <p className="mt-1 font-serif text-[26px] text-[#F1EFE8]">
                    12{" "}
                    <span className="font-sans text-[14px] text-[#9FB0A6]">
                      dagen
                    </span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
                    Deze week
                  </span>
                  <div className="mt-2 flex flex-col gap-1.5 text-[13px]">
                    <span className="flex items-center gap-2 text-[#9FB0A6]">
                      <span
                        aria-hidden
                        className="h-3.5 w-3.5 rounded-[4px]"
                        style={{ background: "var(--ac)" }}
                      />
                      1× kracht
                    </span>
                    <span className="flex items-center gap-2 text-[#9FB0A6]">
                      <span
                        aria-hidden
                        className="h-3.5 w-3.5 rounded-[4px]"
                        style={{ background: "var(--ac)" }}
                      />
                      2× wandelen 20 min
                    </span>
                    <span className="flex items-center gap-2 text-[#CDD7D0]">
                      <span
                        aria-hidden
                        className="h-3.5 w-3.5 rounded-[4px] border border-[#5E6D69]"
                      />
                      1× conditie
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
                  Krachtscore · Conditie · Energie
                </span>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
                  <span style={{ color: "var(--ac)" }}>Kracht ▲</span>
                  <span className="text-[#58C7C0]">Conditie ▲</span>
                  <span className="text-[#CDD7D0]">Energie ↗</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
                  Behaald · volgende badge
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]"
                    style={{
                      color: "var(--ac)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "color-mix(in srgb, var(--ac) 35%, transparent)",
                      background: "color-mix(in srgb, var(--ac) 10%, transparent)",
                    }}
                  >
                    Eerste week
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]"
                    style={{
                      color: "var(--ac)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "color-mix(in srgb, var(--ac) 35%, transparent)",
                      background: "color-mix(in srgb, var(--ac) 10%, transparent)",
                    }}
                  >
                    10-dagen-streak
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#5E6D69]">
                    Eerste maand →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
