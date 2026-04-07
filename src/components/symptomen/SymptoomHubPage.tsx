import Link from "next/link";
import type { SymptoomData } from "@/types/symptomen";
import Breadcrumbs from "./Breadcrumbs";
import Container from "@/components/layout/Container";

interface SymptoomHubPageProps {
  data: SymptoomData;
}

export default function SymptoomHubPage({ data }: SymptoomHubPageProps) {
  return (
    <div className="bg-stone-50/40 pb-24">
      {/* ── Header / hero ────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: "Symptomen", href: "/symptomen" },
              { label: data.label },
            ]}
          />

          <div className="ps-prose-container mt-5">
            <h1 className="ps-symptoom-h1 text-4xl text-stone-900 md:text-5xl">
              {data.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              {data.heroIntro}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        {/* ── Herkenning ───────────────────────────────────────────────── */}
        <p className="ps-prose-container text-base leading-7 text-stone-600">
          {data.herkenning}
        </p>

        {/* ── Twee kaarten ─────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href={`/symptomen/${data.slug}/oorzaken`}
            className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
          >
            <div>
              <p className="ps-eyebrow mb-2">Stap 1</p>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                {data.ctaOorzaken}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Ontdek de concrete factoren die bij jou een rol spelen.
              </p>
            </div>
            <span
              aria-hidden
              className="mt-6 text-lg text-stone-400 transition group-hover:translate-x-1 group-hover:text-[var(--ps-green)]"
            >
              →
            </span>
          </Link>

          <Link
            href={`/symptomen/${data.slug}/oplossingen`}
            className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
          >
            <div>
              <p className="ps-eyebrow mb-2">Stap 2</p>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                {data.ctaOplossingen}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Praktische stappen, van direct toepasbaar tot structureel.
              </p>
            </div>
            <span
              aria-hidden
              className="mt-6 text-lg text-stone-400 transition group-hover:translate-x-1 group-hover:text-[var(--ps-green)]"
            >
              →
            </span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
