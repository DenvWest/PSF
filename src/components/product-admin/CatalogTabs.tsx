"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/producten", label: "Producten" },
  { href: "/admin/merken", label: "Merken" },
  { href: "/admin/categorieen", label: "Categorieën" },
  { href: "/admin/retailers", label: "Retailers" },
  { href: "/admin/import", label: "Import" },
];

export function CatalogTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Catalogus" className="mb-4 flex gap-1 border-b border-[var(--ps-border)]">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              active
                ? "border-[var(--ps-green)] font-semibold text-[var(--ps-ink)]"
                : "border-transparent text-[var(--ps-body)] hover:text-[var(--ps-ink)]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
