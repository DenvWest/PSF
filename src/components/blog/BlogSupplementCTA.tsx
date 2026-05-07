import Link from "next/link";
import type { BlogSupplementCTA as BlogSupplementCTAType } from "@/types/blog";

interface BlogSupplementCTAProps {
  cta: BlogSupplementCTAType;
}

export default function BlogSupplementCTA({ cta }: BlogSupplementCTAProps) {
  return (
    <aside
      aria-label={`Supplement: ${cta.naam}`}
      className="max-w-[72ch] rounded-xl border border-stone-200/95 bg-stone-50/70 px-6 py-5 md:py-6"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
        Verdieping (context, geen productclaim)
      </p>
      <p className="mt-3 text-[0.9375rem] leading-[1.75] text-stone-700">
        <span className="font-semibold text-stone-800">{cta.naam}</span>
        {" — "}
        <span>{cta.uitleg}</span>
      </p>
      <Link
        href={cta.href}
        className="mt-5 inline-flex min-h-10 items-center text-[0.8125rem] font-medium text-stone-800 underline decoration-stone-300 decoration-1 underline-offset-[4px] transition hover:text-stone-950 hover:decoration-stone-400"
      >
        Verder lezen — {cta.naam}
      </Link>
    </aside>
  );
}
