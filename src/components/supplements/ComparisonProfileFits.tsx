import Link from "next/link";
import Container from "@/components/layout/Container";
import type { SupplementProfileFit } from "@/data/supplement-profile-fits";

interface ComparisonProfileFitsProps {
  fits: SupplementProfileFit[];
}

export function ComparisonProfileFits({ fits }: ComparisonProfileFitsProps) {
  if (fits.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-stone-100 pt-12" aria-labelledby="past-bij-profiel">
      <Container>
        <h2
          id="past-bij-profiel"
          className="font-display text-2xl font-bold text-stone-900"
        >
          Past bij dit profiel
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Herken je jezelf? Deze profielen combineren leefstijl en supplementen — start bij
          herkenning, niet bij een potje.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {fits.map((fit) => (
            <li key={fit.slug} className="list-none">
              <Link
                href={`/profiel/${fit.slug}`}
                className="group flex h-full flex-col rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-6 transition-colors hover:border-emerald-300 hover:bg-emerald-50/70"
              >
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-emerald-800">
                  Profiel
                </span>
                <span className="mt-2 font-display text-lg font-semibold text-stone-900 group-hover:text-emerald-900">
                  {fit.label}
                </span>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                  {fit.snippet}
                </p>
                <span className="mt-4 text-sm font-medium text-emerald-800 group-hover:underline">
                  Bekijk profiel →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
