"use client";

import ApproachCardLink from "@/components/insights/ApproachCardLink";

export default function AanpakQ1EiwitHero() {
  return (
    <article className="rounded-[20px] border border-[#5A8F6A] bg-white p-6 ring-2 ring-[#5A8F6A]/25 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A8F6A]">
          Prioriteit · hoog
        </span>
        <span className="rounded-full bg-[#FAF9F7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500 ring-1 ring-[#E7E5E4]">
          Moeite · laag
        </span>
      </div>

      <h2 className="mt-4 font-display text-[22px] font-normal text-stone-900">
        Eiwit — grootste winst uit je check
      </h2>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-stone-600">
        Uit jouw antwoorden: je eet weinig bewust eiwit. Dat is vaak de snelste stap vóór supplementen —
        elke maaltijd een eiwitbron, zonder ingewikkeld dieet.
      </p>

      <div className="mt-5">
        <ApproachCardLink
          href="/voeding-na-40"
          destination="approach_q1_eiwit"
          pillar="voeding"
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
        >
          Bekijk je voedingsaanpak →
        </ApproachCardLink>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-stone-500">
        <ApproachCardLink
          href="/kennisbank/eiwitbehoefte-na-40"
          destination="approach_q1_eiwit_kennisbank"
          pillar="voeding"
          className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-800"
        >
          Lees waarom eiwit na 40 ertoe doet →
        </ApproachCardLink>
      </p>

      <div className="mt-5 flex items-start gap-2 border-t border-[#F0EEEC] pt-4">
        <span className="mt-0.5 shrink-0 rounded-[3px] border border-[#D6D3D1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-stone-400">
          adv
        </span>
        <p className="text-[13px] leading-relaxed text-stone-400">
          Haal je het niet uit voeding?{" "}
          <ApproachCardLink
            href="/beste/eiwitpoeder"
            destination="approach_eiwitpoeder_vergelijk"
            pillar="voeding"
            className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-800"
          >
            Vergelijk eiwitpoeder →
          </ApproachCardLink>
        </p>
      </div>
    </article>
  );
}
