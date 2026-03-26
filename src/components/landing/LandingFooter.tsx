import Link from "next/link";

const footerLinks = [
  { href: "#why", label: "Waarom" },
  { href: "#products", label: "Supplementen" },
  { href: "#kennis", label: "Kennis" },
];

const socials = [
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://x.com", label: "X" },
];

export default function LandingFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-[var(--ps-border)]/80 bg-[var(--ps-cream)] py-20"
    >
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-14 lg:flex-row lg:justify-between">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-[var(--ps-ink)]">
              Perfect Supplement
            </p>
            <p className="mt-4 max-w-md font-sans text-[0.9375rem] leading-[1.75] text-[var(--ps-body)]">
              Premium supplementen met nadruk op omega-3 en magnesium—duidelijk
              uitgelegd, zorgvuldig gekozen.
            </p>
            <p className="mt-8 font-sans text-[0.9375rem] text-[var(--ps-body)]">
              <span className="text-[var(--ps-muted)]">Contact:</span>{" "}
              <a
                href="mailto:hello@perfectsupplement.com"
                className="text-[var(--ps-ink)] underline-offset-4 hover:underline"
              >
                hello@perfectsupplement.com
              </a>
            </p>
          </div>
          <nav aria-label="Voetnoot">
            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-[var(--ps-body)] hover:text-[var(--ps-ink)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-10 flex gap-8">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-[var(--ps-muted)] hover:text-[var(--ps-ink)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--ps-border)] pt-10 text-xs text-[var(--ps-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Perfect Supplement. Alle rechten
            voorbehouden.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-[var(--ps-ink)]">
              Privacy
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--ps-ink)]">
              Disclaimer
            </Link>
            <Link href="/cookies" className="hover:text-[var(--ps-ink)]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
