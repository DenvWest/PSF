import Link from "next/link";
import type { BlogSupplementCTA as BlogSupplementCTAType } from "@/types/blog";

interface BlogSupplementCTAProps {
  cta: BlogSupplementCTAType;
}

export default function BlogSupplementCTA({ cta }: BlogSupplementCTAProps) {
  return (
    <aside aria-label={`Supplement: ${cta.naam}`} className="ps-supplement-block">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ps-green)]">
        Supplement ondersteuning
      </p>
      <p className="mt-1.5 text-sm text-stone-700">
        <span className="font-semibold">{cta.naam}</span>
        {" — "}
        {cta.uitleg}
      </p>
      <Link
        href={cta.href}
        className="mt-3 inline-flex min-h-[44px] items-center text-xs font-medium text-[var(--ps-green)] underline decoration-[var(--ps-green-light)] underline-offset-4 transition hover:text-[var(--ps-green-hover)]"
      >
        Meer over {cta.naam} →
      </Link>
    </aside>
  );
}
