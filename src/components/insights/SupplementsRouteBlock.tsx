"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import { trackEvent } from "@/lib/ga4";

export default function SupplementsRouteBlock() {
  return (
    <section aria-label="Supplementen vergelijken">
      <Container className="py-8 md:py-10">
        <div className="flex flex-col items-start gap-6 rounded-[20px] border border-dashed border-[#D6D3D1] bg-[#FCFBF8] p-6 md:flex-row md:items-center md:gap-7 md:p-[26px_30px]">
          <span
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] border border-[#E7E5E4] bg-white"
            aria-hidden
          >
            <span className="relative h-[3px] w-[22px] bg-stone-400 before:absolute before:-top-[7px] before:left-0 before:h-[3px] before:w-[22px] before:bg-[#5A8F6A] after:absolute after:-bottom-[7px] after:left-0 after:h-[3px] after:w-[22px] after:bg-stone-300" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-stone-400">
              Secundaire route — geen leefstijl-categorie
            </p>
            <h2 className="mt-1.5 font-display text-[21px] font-normal text-stone-900">
              Supplementen vergelijken
            </h2>
            <p className="mt-1 max-w-[62ch] text-sm text-stone-500">
              Een aparte as die naar vergelijkingspagina&apos;s leidt —
              beoordeeld op bewijs, dosering en vorm. Eerst je leefstijl, dan pas
              de aanvulling.
            </p>
          </div>
          <Link
            href="/supplementen"
            onClick={() =>
              trackEvent("supplements_route_click", { source: "inzichten" })
            }
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[#D6D3D1] bg-white px-[22px] py-3 text-sm font-semibold text-stone-900 transition hover:border-[#0E1A14]"
          >
            Naar vergelijkingen →
          </Link>
        </div>
      </Container>
    </section>
  );
}
