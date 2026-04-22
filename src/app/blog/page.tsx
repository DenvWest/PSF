import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { alleArtikelen } from "@/data/blog";
import {
  ALLE_CATEGORIEEN,
  isGeldigeCategorie,
} from "@/data/blog/categorieen";
import type { BlogCategorie } from "@/types/blog";

export const metadata: Metadata = {
  title: "Kennisbank | Artikelen voor mannen 40+ | PerfectSupplement",
  description:
    "Onderbouwde artikelen over stress, slaap, energie en supplementen. Praktische inzichten voor mannen boven de 40.",
};

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function telArtikelen(categorie: BlogCategorie): number {
  return alleArtikelen.filter((a) => a.categorie === categorie).length;
}

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://perfectsupplement.nl",
              },
              { "@type": "ListItem", position: 2, name: "Blog" },
            ],
          }),
        }}
      />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pb-10 pt-12 md:pt-20">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
            <ol className="flex items-center gap-2 text-[0.8125rem] text-stone-400">
              <li>
                <Link href="/" className="transition hover:text-stone-600">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-stone-600">Blog</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-6 bg-stone-300" aria-hidden />
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-400">
                Blog
              </p>
            </div>
            <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-stone-900 md:text-[3.5rem]">
              Kennisbank
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.75] text-stone-500">
              Onderbouwde artikelen over stress, slaap, energie en
              supplementen. Geschreven om te begrijpen, niet om te verkopen.
            </p>
          </div>
        </Container>
      </section>

      {/* ── CATEGORIE HUB ──────────────────────────────────────────── */}
      <section className="pb-20 md:pb-28" aria-label="Categorieën">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {ALLE_CATEGORIEEN.map((cat) => {
              const aantal = telArtikelen(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/blog/${cat.id}`}
                  className={`group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-7 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:min-h-[220px] md:p-9 ${cat.kleur.bg}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    aria-hidden
                    style={{ backgroundImage: NOISE_SVG }}
                  />

                  <div className="relative flex flex-1 flex-col">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ring-1 ${cat.kleur.accent}`}
                      aria-hidden
                    >
                      {cat.icoon}
                    </span>

                    <div className="mt-auto">
                      <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                        {cat.naam}
                      </h2>
                      <p
                        className={`mt-2 text-sm leading-relaxed ${cat.kleur.tekst}`}
                      >
                        {cat.beschrijving}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-medium text-white/50">
                          {aantal} {aantal === 1 ? "artikel" : "artikelen"}
                        </span>
                        <span className="text-sm font-medium text-white/80 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <div className="ps-divider" />

      {/* ── ROUTE-ADVIES ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28" aria-label="Themagidsen">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
              Liever beginnen bij je klacht?
            </p>
            <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-stone-500">
              Onze themagidsen helpen je begrijpen wat er speelt en wijzen je
              naar concrete stappen.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {[
                { label: "Stress", href: "/thema/stress" },
                { label: "Slaapproblemen", href: "/thema/slaap" },
                { label: "Energieverlies", href: "/thema/energie" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white px-5 py-3.5 text-sm font-medium text-stone-800 transition hover:border-stone-300 hover:shadow-sm sm:w-auto sm:justify-center"
                >
                  <span>{link.label}</span>
                  <span
                    className="text-stone-400 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
