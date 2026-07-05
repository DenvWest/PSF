"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type KennisbankVerdiepingGateProps = {
  termSlug: string;
  termName: string;
};

export default function KennisbankVerdiepingGate({
  termSlug,
  termName,
}: KennisbankVerdiepingGateProps) {
  const trackedView = useRef(false);

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    trackEvent("inzichten_premium_kennisbank_click", {
      slug: "gate_view",
      term: termSlug,
    });
    clarityTag("inzichten_layer", "kennisbank_gate");
  }, [termSlug]);

  return (
    <aside aria-label="Verdieping na je check" className="mx-auto max-w-xl">
      <div className="rounded-[20px] border border-[#E7E5E4] bg-white px-6 py-10 text-center">
        <h2 className="font-display text-[1.375rem] font-semibold leading-snug text-stone-900 md:text-2xl">
          De verdieping is gratis — geen abonnement nodig.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          <strong>
            Hier gaat {termName} verder: hoe het werkt, waarom het ertoe doet voor jouw keuze, en
            de volledige wetenschappelijke referenties.
          </strong>{" "}
          Je leest het na je gratis Leefstijlcheck, ingelogd met je account — zo koppelen we de
          uitleg aan jouw situatie in plaats van aan iedereen tegelijk.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/intake"
            onClick={() =>
              trackEvent("inzichten_premium_kennisbank_click", {
                slug: "gate_intake",
                term: termSlug,
              })
            }
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
          >
            Start de gratis check →
          </Link>
          <Link
            href="/account/login"
            onClick={() =>
              trackEvent("inzichten_premium_kennisbank_click", {
                slug: "gate_login",
                term: termSlug,
              })
            }
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#E7E5E4] bg-white px-[22px] py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Ik heb al een account — inloggen
          </Link>
        </div>
      </div>
    </aside>
  );
}
