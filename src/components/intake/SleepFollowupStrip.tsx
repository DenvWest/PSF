"use client";

import { trackEvent } from "@/lib/ga4";

export type SleepFollowupStripProps = {
  voortgangHref: string;
  kompasHref: string;
  mijnDagHref: string | null;
};

export default function SleepFollowupStrip({
  voortgangHref,
  kompasHref,
  mijnDagHref,
}: SleepFollowupStripProps) {
  const links = [
    {
      key: "voortgang",
      href: voortgangHref,
      label: "Bekijk je slaapvoortgang",
      hint: "Prioriteitenladder, delta en wat je deze week doet.",
    },
    {
      key: "kompas",
      href: kompasHref,
      label: "Terug naar Slaap in je Kompas",
      hint: "Mini-ladder en je volgende stap van vandaag.",
    },
    ...(mijnDagHref
      ? [
          {
            key: "mijn_dag",
            href: mijnDagHref,
            label: "Plan op Mijn Dag",
            hint: "Koppel je avondritueel aan een vaste tijd.",
          },
        ]
      : []),
  ];

  return (
    <section
      aria-labelledby="sleep-followup-heading"
      className="mt-5 rounded-[16px] border border-white/10 bg-black/20 px-4 pb-1 pt-4"
    >
      <h2
        id="sleep-followup-heading"
        className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9CC5A9]"
      >
        Waar je dit terugvindt
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0]">
        Je slaapbeeld staat op meerdere plekken — steeds dezelfde conclusie, andere diepte.
      </p>

      <div className="mt-3.5">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            onClick={() =>
              trackEvent("sleep_checkin_routing_click", {
                target: link.key,
                surface: "intake_slaap",
                slot: "strip",
              })
            }
            className="block border-t border-white/[0.06] py-3 no-underline"
          >
            <span className="flex min-h-[24px] items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold text-[#9CC5A9]">{link.label}</span>
              <span aria-hidden="true" className="text-[15px] text-[#7E8C82]">
                ›
              </span>
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[#7E8C82]">
              {link.hint}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
