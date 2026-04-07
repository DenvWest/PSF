import Link from "next/link";
import type { GerelateerdLink } from "@/data/symptomen/cross-links";

interface GerelateerdBlokProps {
  links: GerelateerdLink[];
}

export default function GerelateerdBlok({ links }: GerelateerdBlokProps) {
  if (links.length === 0) return null;

  return (
    <aside aria-label="Gerelateerde onderwerpen" className="border-t border-stone-200 pt-10">
      <p className="ps-eyebrow mb-5">Gerelateerd</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 transition duration-200 hover:border-stone-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 transition group-hover:text-[var(--ps-green)]">
              {link.label}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
            <span className="mt-2 text-sm leading-relaxed text-stone-600">
              {link.beschrijving}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
