import Link from "next/link";
import SectionShell from "./ui/SectionShell";

const items = [
  {
    title: "Wat is omega-3?",
    href: "/wat-is-omega-3",
  },
  {
    title: "Waar let je op bij omega-3?",
    href: "/waar-let-je-op-bij-omega-3",
  },
  {
    title: "Magnesium vergelijken",
    href: "/magnesium-vergelijken",
  },
];

export default function HomeKnowledgePreview() {
  return (
    <section
      id="kennis"
      className="border-b border-[var(--ps-border)]/50 py-[clamp(5rem,12vw,8rem)]"
      aria-labelledby="kennis-heading"
    >
      <SectionShell>
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-[var(--ps-muted)] sm:text-xs">
            Blog
          </p>
          <h2
            id="kennis-heading"
            className="font-display mt-8 text-[clamp(1.875rem,4vw,2.75rem)] font-light leading-[1.12] tracking-wide text-[var(--ps-ink)]"
          >
            Drie artikelen om mee te starten
          </h2>
          <p className="mt-8 max-w-2xl text-[1.0625rem] leading-[1.75] text-[var(--ps-body)] sm:text-lg">
            Diepgaandere stof vind je in het blog. Hier drie ingangen die
            aansluiten bij omega-3 en magnesium.
          </p>
          <ul className="mt-16 space-y-0 divide-y divide-[var(--ps-border)]/70">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-6 py-8 font-display text-[clamp(1.25rem,2.5vw,1.5rem)] font-light tracking-wide text-[var(--ps-ink)] transition hover:text-[var(--ps-charcoal)]"
                >
                  <span>{item.title}</span>
                  <span
                    className="shrink-0 text-sm text-[var(--ps-muted)] transition group-hover:text-[var(--ps-ink)]"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-12">
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--ps-body)] underline-offset-[6px] transition hover:text-[var(--ps-ink)] hover:underline"
            >
              Alle artikelen in het blog
            </Link>
          </p>
        </div>
      </SectionShell>
    </section>
  );
}
