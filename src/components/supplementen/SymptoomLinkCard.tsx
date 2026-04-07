import Link from "next/link";

interface SymptoomLinkCardProps {
  symptoom: string;
  tekst: string;
  href: string;
}

export default function SymptoomLinkCard({
  symptoom,
  tekst,
  href,
}: SymptoomLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 transition duration-150 hover:border-stone-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {symptoom}
      </p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
        {tekst}
      </p>
      <p className="mt-4 text-xs font-medium text-[var(--ps-green)] transition group-hover:text-[var(--ps-green-hover)]">
        Bekijk oplossingen →
      </p>
    </Link>
  );
}
