"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import { trackEvent } from "@/lib/ga4";

export default function SupplementsRouteBlock() {
  return (
    <section aria-label="Supplementen vergelijken">
      <Container className="pb-16 md:pb-20">
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-6 py-8 md:px-8 md:py-10">
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
            Secundaire route
          </p>
          <h2 className="mt-3 font-serif text-2xl font-normal text-stone-900 md:text-[1.75rem]">
            Supplementen vergelijken
          </h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-stone-600">
            Een aparte as — beoordeeld op bewijs, dosering en vorm. Eerst je
            leefstijl op orde, dan pas de aanvulling.
          </p>
          <Link
            href="/supplementen"
            onClick={() =>
              trackEvent("supplements_route_click", { source: "inzichten" })
            }
            className="mt-6 inline-flex min-h-[44px] items-center text-sm font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
          >
            Naar de supplementen →
          </Link>
        </div>
      </Container>
    </section>
  );
}
