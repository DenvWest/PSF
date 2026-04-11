import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Hero() {
  return (
    <section className="relative border-b border-stone-200/50 bg-[var(--ps-bg)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.6),transparent_55%)]"
        aria-hidden
      />

      <Container className="relative max-w-screen-xl">
        <div className="max-w-[65ch] pt-6 text-left">
          <div className="space-y-4 py-[clamp(2rem,5vh,4rem)]">
            <h1 className="text-pretty text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
              Moe, slecht slapen of constant gestrest?
            </h1>
            <p className="text-base leading-relaxed text-stone-600 sm:text-lg">
              Na je 40e verandert je lichaam. Dat is normaal — maar je hoeft het
              niet te accepteren. Ontdek in 3 minuten waar jij kunt verbeteren.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-4">
              <Link
                href="/intake"
                className="inline-flex min-h-[44px] min-w-[12rem] items-center justify-center rounded-xl bg-emerald-800 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-emerald-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ps-bg)]"
              >
                Doe de leefstijlcheck →
              </Link>
              <Link
                href="/supplementen"
                className="inline-flex min-h-[44px] min-w-[12rem] items-center justify-center rounded-xl border border-stone-300/90 bg-white/70 px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ps-bg)]"
              >
                Bekijk supplementen
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
