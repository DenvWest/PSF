import Link from "next/link";
import type { KennisbankTerm, KennisbankTheme } from "@/data/kennisbank";

const THEME_ACCENT: Record<KennisbankTheme, string> = {
  "lichaam-veroudering": "border-l-rose-400/65",
  "leefstijl-herstel": "border-l-emerald-500/65",
  supplementwetenschap: "border-l-sky-500/65",
  longevity: "border-l-amber-500/60",
};

interface KennisbankTermKaartProps {
  term: KennisbankTerm;
}

export default function KennisbankTermKaart({ term }: KennisbankTermKaartProps) {
  return (
    <Link
      href={`/kennisbank/${term.slug}`}
      className={`group flex min-h-0 flex-col rounded-2xl border border-stone-200/55 border-l-[3px] bg-white p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-stone-300/80 [@media(hover:hover)]:hover:shadow-md ${THEME_ACCENT[term.theme]}`}
    >
      <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-stone-900 md:text-xl">
        {term.term}
      </h3>
      <p className="mt-3 line-clamp-3 text-base leading-relaxed text-stone-500">
        {term.shortDefinition}
      </p>
      <p className="mt-auto pt-6 text-sm text-stone-500 transition [@media(hover:hover)]:group-hover:text-stone-700">
        Lezen →
      </p>
    </Link>
  );
}
