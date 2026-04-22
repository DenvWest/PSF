import Link from "next/link";
import type { BlogArtikel, BlogCategorie } from "@/types/blog";
import type { CategorieConfig } from "@/data/blog/categorieen";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import Container from "@/components/layout/Container";
import BlogArtikelKaart from "./BlogArtikelKaart";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface Props {
  config: CategorieConfig;
  artikelen: BlogArtikel[];
  aantalPerCategorie: Record<BlogCategorie, number>;
}

export default function BlogCategoriePageContent({
  config,
  artikelen,
  aantalPerCategorie,
}: Props) {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br pb-12 pt-12 md:pt-20 ${config.kleur.bg}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden
          style={{ backgroundImage: NOISE_SVG }}
        />
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="relative mb-10 md:mb-14">
            <ol className="flex items-center gap-2 text-[0.8125rem] text-white/50">
              <li>
                <Link href="/" className="transition hover:text-white/80">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li>
                <Link href="/blog" className="transition hover:text-white/80">
                  Blog
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-white/90">{config.naam}</li>
            </ol>
          </nav>

          <div className="relative max-w-2xl">
            <span className="text-2xl" aria-hidden>
              {config.icoon}
            </span>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white md:text-[3rem]">
              {config.naam}
            </h1>
            <p className={`mt-4 text-[1.0625rem] leading-[1.75] ${config.kleur.tekst}`}>
              {config.beschrijving}
            </p>
          </div>
        </Container>
      </section>

      {/* ── CATEGORIE TABS ─────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white">
        <Container>
          <div
            className="flex flex-wrap gap-1 py-4"
            role="tablist"
            aria-label="Categorieën"
          >
            {ALLE_CATEGORIEEN.map((cat) => {
              const isActive = cat.id === config.id;
              const aantal = aantalPerCategorie[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/blog/${cat.id}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  }`}
                >
                  <span aria-hidden>{cat.icoon}</span>
                  <span>{cat.naam}</span>
                  <span
                    className={`text-xs ${isActive ? "text-white/60" : "text-stone-400"}`}
                  >
                    {aantal}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </div>

      {/* ── ARTIKELEN ──────────────────────────────────────────────── */}
      <section className="py-14 md:py-20" aria-label={`${config.naam} artikelen`}>
        <Container>
          {artikelen.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {artikelen.map((artikel) => (
                <BlogArtikelKaart key={artikel.slug} artikel={artikel} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              Nog geen artikelen in deze categorie.
            </p>
          )}
        </Container>
      </section>

      <div className="ps-divider" />

      {/* ── ROUTE-ADVIES ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24" aria-label="Themagidsen">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
              Liever beginnen bij je klacht?
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-stone-500">
              Onze themagidsen helpen je begrijpen wat er speelt en wijzen je
              naar concrete stappen.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {[
                { label: "Stress", href: "/thema/stress" },
                { label: "Slaapproblemen", href: "/thema/slaap" },
                { label: "Energieverlies", href: "/thema/energie" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-300 hover:shadow-sm sm:w-auto sm:justify-center"
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
