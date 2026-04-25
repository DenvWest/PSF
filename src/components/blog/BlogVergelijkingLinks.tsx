import Link from "next/link";
import type { BlogVergelijkingLink } from "@/types/blog";

interface BlogVergelijkingLinksProps {
  links: BlogVergelijkingLink[];
}

export default function BlogVergelijkingLinks({
  links,
}: BlogVergelijkingLinksProps) {
  if (links.length === 0) return null;

  return (
    <aside
      aria-label="Vergelijkingspagina's"
      className="my-2 overflow-hidden rounded-2xl border border-[var(--ps-green)]/20 bg-gradient-to-br from-[var(--ps-green-light)] via-[var(--ps-green-light)] to-white"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--ps-green)]/15 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ps-green)] text-white">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ps-green)]">
            Onze vergelijking
          </p>
          <p className="text-xs text-stone-500">
            Onafhankelijk beoordeeld · Geen reclame
          </p>
        </div>
      </div>

      {/* Turbo snippet */}
      <div className="px-5 pb-0 pt-4">
        <p className="text-sm leading-relaxed text-stone-700">
          <strong className="font-semibold text-stone-900">
            Niet elk supplement werkt hetzelfde.
          </strong>{" "}
          Wij vergeleken de populairste opties op werkzame dosis, kwaliteit en
          prijs — zodat jij de miskoop voorkomt.
        </p>
      </div>

      {/* Vergelijkings-cards */}
      <div className="space-y-2.5 p-5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex min-h-[56px] items-center justify-between gap-4 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-stone-200/80 transition-all duration-150 hover:ring-[var(--ps-green)]/40 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900 transition-colors group-hover:text-[var(--ps-green)]">
                {link.titel}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
                {link.beschrijving}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--ps-green)] px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-[var(--ps-green-hover)]">
              Bekijk →
            </span>
          </Link>
        ))}
      </div>

      {/* Social proof footer */}
      <div className="border-t border-[var(--ps-green)]/10 px-5 py-3">
        <p className="text-center text-xs text-stone-400">
          Bijgewerkt in 2026 · Gebaseerd op klinisch bewijs
        </p>
      </div>
    </aside>
  );
}
