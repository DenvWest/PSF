import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";

const ACCENT = "oklch(0.69 0.095 50)";

type Meter = { label: string; pct: number; tone: "accent" | "neutral" };

function MeterRow({ label, pct, tone }: Meter) {
  return (
    <div>
      <div className="text-[13px] text-[#9FB0A6]">{label}</div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: tone === "accent" ? "var(--ac)" : "rgba(255,255,255,.4)",
          }}
        />
      </div>
    </div>
  );
}

export default function MovementVersus() {
  return (
    <section
      id="wandelen-vs-kracht"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Waarom wandelen alleen niet genoeg is
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Wandelen is geweldig. Het is alleen niet hetzelfde.
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#9FB0A6]">
            Wandelen, fietsen en tuinieren zijn goud waard voor je hart en je
            hoofd. Maar ze geven je spieren zelden de prikkel die nodig is om
            kracht op peil te houden — dat vraagt om een andere uitdaging.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <h3 className="text-[17px] font-semibold text-[#F1EFE8]">
              Wandelen &amp; fietsen
            </h3>
            <p className="mt-0.5 text-[13px] uppercase tracking-wider text-[#7E8C82]">
              vooral je conditie
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              <MeterRow label="Hart & conditie" pct={85} tone="neutral" />
              <MeterRow
                label="Prikkel voor je spierkracht"
                pct={22}
                tone="neutral"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <h3 className="text-[17px] font-semibold text-[#F1EFE8]">
              Krachttraining
            </h3>
            <p className="mt-0.5 text-[13px] uppercase tracking-wider text-[#7E8C82]">
              vooral je spieren &amp; botten
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              <MeterRow label="Hart & conditie" pct={45} tone="neutral" />
              <MeterRow
                label="Prikkel voor je spierkracht"
                pct={92}
                tone="accent"
              />
            </div>
          </div>
        </div>

        <p
          className="mt-8 max-w-xl border-l-[3px] py-0.5 pl-6 font-serif text-[clamp(19px,2.4vw,24px)] italic leading-[1.32] text-[#F1EFE8]"
          style={{ borderColor: "var(--ac)" }}
        >
          Je hart traint mee tijdens het wandelen. Je spieren wachten nog
          steeds op hún uitdaging.
        </p>
      </Container>
    </section>
  );
}
