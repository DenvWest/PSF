import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import BlogLibrary from "@/components/blog/BlogLibrary";
import BlogIntakeCTA from "@/components/blog/BlogIntakeCTA";
import BlogThemaLinks from "@/components/blog/BlogThemaLinks";
import FloatingLeefstijlcheckCta from "@/components/ui/FloatingLeefstijlcheckCta";
import { getBlogLibraryItems } from "@/lib/library/blog-items";
import {
  AUDIENCE_PARAM,
  resolveContentAudience,
} from "@/lib/content-audience";
import { BLOG_HUB_LABEL } from "@/components/blog/blog-layout";
import {
  LIB_EYEBROW,
  LIB_PAGE_BG,
} from "@/components/library/library-tokens";

export const metadata: Metadata = {
  title: "Herstelbibliotheek — Slaap, Stress & Herstel na 40",
  description:
    "Moe wakker worden, altijd aan staan of trager herstel na 40? Rustige, onderbouwde artikelen over slaap, stress, energie en wat je lichaam signaleert — met een lens voor mannen- en vrouwenfysiologie.",
  alternates: {
    canonical: "https://perfectsupplement.nl/blog",
  },
};

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const audience = resolveContentAudience(
    typeof params[AUDIENCE_PARAM] === "string" ? params[AUDIENCE_PARAM] : undefined,
  );
  const items = getBlogLibraryItems();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://perfectsupplement.nl",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: BLOG_HUB_LABEL,
                    item: "https://perfectsupplement.nl/blog",
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                name: BLOG_HUB_LABEL,
                description:
                  "Rustige, onderbouwde artikelen over slaap, stress, energie en herstel na je 40e.",
                url: "https://perfectsupplement.nl/blog",
                isPartOf: {
                  "@type": "WebSite",
                  name: "PerfectSupplement",
                  url: "https://perfectsupplement.nl",
                },
              },
            ],
          }),
        }}
      />

      <main className={LIB_PAGE_BG}>
        <Container className="pb-16 pt-[5.5rem] md:pb-20 md:pt-28">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-[0.8125rem] text-stone-400">
              <li>
                <Link href="/" className="transition hover:text-stone-600">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-stone-600">{BLOG_HUB_LABEL}</li>
            </ol>
          </nav>

          <header className="max-w-2xl">
            <p className={LIB_EYEBROW}>{BLOG_HUB_LABEL}</p>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
              Begrijp waarom je lichaam niet meer herstelt zoals vroeger
            </h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-stone-600">
              {items.length} artikelen over slaap, stress, energie en
              supplementen — met het mechanisme, het bewijsniveau en de bronnen
              erbij. Kies voor wie je leest en de volgorde past zich aan — er
              verdwijnt niets.
            </p>
          </header>

          <div className="mt-8 md:mt-10">
            <BlogLibrary
              items={items}
              initialAudience={audience}
              footerSlot={
                <div className="mt-14 md:mt-16">
                  <BlogIntakeCTA />
                </div>
              }
            />
          </div>
        </Container>

        <section className="border-t border-stone-200/70 py-16 md:py-20">
          <Container>
            <BlogThemaLinks />
          </Container>
        </section>
      </main>

      <FloatingLeefstijlcheckCta revealOnTimer={false} />
    </>
  );
}
