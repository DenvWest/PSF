import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/homepage/Hero";
import "./homepage.css";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Voor mannen 40+: grip op energie, slaap en leefstijl—stap voor stap, zonder harde sales.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="home">
      <Hero />

      {/* Trust-sectie */}
      <div className="border-b border-stone-200/60 bg-[var(--ps-bg)] px-6 py-10 lg:px-8">
        <ul className="mx-auto grid max-w-screen-xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            {
              label: "Onafhankelijk",
              description: "Geen sponsors of betaalde plaatsingen",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
                  <path d="M12 3L4 7v5c0 4.97 3.6 9.6 8 10.93C16.4 21.6 20 16.97 20 12V7L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9.5 12l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              label: "Onderbouwd",
              description: "Gebaseerd op peer-reviewed onderzoek",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
                  <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19v18H5.5C4.67 21 4 20.33 4 19.5z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 19.5C4 18.67 4.67 18 5.5 18H19" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              label: "3 minuten",
              description: "12 vragen, persoonlijk herstelplan",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              label: "Gratis",
              description: "Geen account, geen kosten",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
                  <rect x="3" y="10" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 14h18M12 10V21" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="6" width="8" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6c0 0-1.5-3.5-3.5-2.5S7.5 6 12 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M12 6c0 0 1.5-3.5 3.5-2.5S16.5 6 12 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((item) => (
            <li key={item.label} className="relative group list-none">
              {/* gradient border */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 opacity-20 transition-opacity group-hover:opacity-35" aria-hidden="true" />
              <div className="relative rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="mt-1 text-xs leading-snug text-gray-500">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Sectie 4: Leefstijlcheck CTA ─────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#FDFCFA" }}
        aria-label="Leefstijlcheck"
      >
        <Container>
          <div className="bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] text-white rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="font-serif text-2xl lg:text-3xl text-white">
              Niet zeker waar je moet beginnen?
            </h2>
            <p className="text-white/80 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Doe onze gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk
              resultaat.
            </p>
            <div className="mt-6">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 bg-white text-[#5A8F6A] rounded-lg px-8 py-3.5 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
              >
                Start de Leefstijlcheck
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="text-white/50 text-xs mt-4">
              Geen account nodig · Je gegevens worden anoniem verwerkt
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
