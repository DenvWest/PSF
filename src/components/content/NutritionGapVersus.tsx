import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";
import { NUTRITION_GAP_ACCENT } from "@/data/voedingstekort";

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

export default function NutritionGapVersus() {
  return (
    <section
      id="vegan-vs-aandacht"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Waarom plantaardig alleen niet genoeg is
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Vegan eten kan uitstekend. Het is alleen niet vanzelf compleet.
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#9FB0A6]">
            Groenten, peulvruchten en volkoren zijn goud waard. Ze leveren
            vezels, fytonutriënten en vaak genoeg eiwit als je oplet. Ze leveren
            alleen geen B12, nauwelijks EPA/DHA, en zonder gejodeerd zout of
            verrijkte drank ook weinig jodium en calcium.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <h3 className="text-[17px] font-semibold text-[#F1EFE8]">
              Plantaardig zonder aandacht
            </h3>
            <p className="mt-0.5 text-[13px] uppercase tracking-wider text-[#7E8C82]">
              gezond bord, stille gaten
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              <MeterRow label="Vezels & groenten" pct={88} tone="neutral" />
              <MeterRow
                label="B12 · jodium · EPA/DHA · D"
                pct={18}
                tone="neutral"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <h3 className="text-[17px] font-semibold text-[#F1EFE8]">
              Plantaardig mét vijf knoppen
            </h3>
            <p className="mt-0.5 text-[13px] uppercase tracking-wider text-[#7E8C82]">
              B12 · jodium · algen · verrijkte drank · D in de winter
            </p>
            <div className="mt-4 flex flex-col gap-3.5">
              <MeterRow label="Vezels & groenten" pct={88} tone="neutral" />
              <MeterRow
                label="B12 · jodium · EPA/DHA · D"
                pct={86}
                tone="accent"
              />
            </div>
          </div>
        </div>

        <p
          className="mt-8 max-w-xl border-l-[3px] py-0.5 pl-6 font-serif text-[clamp(19px,2.4vw,24px)] italic leading-[1.32] text-[#F1EFE8]"
          style={{ borderColor: "var(--ac)" }}
        >
          Je groenten doen hun werk. Een handvol stoffen wacht nog steeds op
          hún plek — expres, niet als bijvangst.
        </p>
      </Container>
    </section>
  );
}
