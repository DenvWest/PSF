import Link from "next/link";
import Container from "@/components/layout/Container";
import { BLOG_HERO_PT } from "@/components/blog/blog-layout";

export default function InzichtenPremiumKennisbankUpsell() {
  return (
  <>
    <section className={`${BLOG_HERO_PT} pb-9 md:pb-10`}>
      <Container>
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
          Kennisbank
        </p>
        <h1 className="mt-3 max-w-[24ch] font-display text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.1] tracking-[-0.02em] text-stone-900">
          Verdieping na je check
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-stone-600">
          <strong>Gratis — geen abonnement nodig.</strong> Verdiepende begrippen
          uit de kennisbank lees je na je gratis Leefstijlcheck, ingelogd met je
          account. Zo koppelen we achtergrondkennis aan wat je in je dashboard
          ziet.
        </p>
      </Container>
    </section>
    <section className="pb-16 md:pb-20">
      <Container>
        <div className="mx-auto max-w-xl rounded-[20px] border border-[#E7E5E4] bg-white px-6 py-10 text-center">
          <p className="text-base leading-relaxed text-stone-600">
            Maak eerst je gratis Leefstijlcheck en log in om de verdieping te
            lezen — of log direct in als je al een account hebt. Dit is geen
            betaalde functie.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/intake"
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
            >
              Start Leefstijlcheck →
            </Link>
            <Link
              href="/account/login"
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#E7E5E4] bg-white px-[22px] py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Inloggen →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  </>
  );
}
