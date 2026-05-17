import { HOMEPAGE_TRUST } from "@/data/homepage";

const TRUST_ICONS = [
  (
    <svg key="Onafhankelijk" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <path d="M12 3L4 7v5c0 4.97 3.6 9.6 8 10.93C16.4 21.6 20 16.97 20 12V7L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.5 12l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg key="Onderbouwd" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19v18H5.5C4.67 21 4 20.33 4 19.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 19.5C4 18.67 4.67 18 5.5 18H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg key="3 minuten" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg key="Gratis" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-ps-green">
      <rect x="3" y="10" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 14h18M12 10V21" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="6" width="8" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6c0 0-1.5-3.5-3.5-2.5S7.5 6 12 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6c0 0 1.5-3.5 3.5-2.5S16.5 6 12 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
] as const;

export default function HomeTrustSection() {
  const { tagline, cards } = HOMEPAGE_TRUST;

  return (
    <section
      className="border-b border-stone-200/60 bg-[var(--ps-bg)] px-6 py-10 lg:px-8"
      aria-label="Vertrouwen en onderbouwing"
    >
      <div className="mx-auto max-w-screen-xl">
        <p className="mb-8 text-center text-sm font-medium text-stone-700 sm:text-base">
          {tagline}
        </p>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {cards.map((item, index) => (
            <li
              key={item.label}
              className="group relative list-none overflow-hidden rounded-2xl"
            >
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 opacity-20 transition-opacity group-hover:opacity-35"
                aria-hidden="true"
              />
              <div className="relative h-full rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  {TRUST_ICONS[index]}
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="mt-1 text-xs leading-snug text-gray-500">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
