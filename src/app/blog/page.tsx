import type { Metadata } from "next";
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
  title: "Herstelbibliotheek — slaap, stress en herstel",
  description:
    "Artikelen over slaap, stress, energie en herstel vanaf 30. Onderbouwd, met bronnen.",
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
                  "Artikelen over slaap, stress, energie en supplementen.",
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
        <Container className="pb-16 pt-8 md:pb-20 md:pt-10">
          <header className="max-w-2xl">
            <p className={LIB_EYEBROW}>{BLOG_HUB_LABEL}</p>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
              Slaap, stress en herstel vanaf 30
            </h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-stone-600">
              {items.length} artikelen over slaap, stress, energie en
              supplementen.
            </p>
          </header>

          <div className="mt-8 md:mt-10">
            <BlogLibrary
              items={items}
              initialAudience={audience}
              footerSlot={
                <div className="mt-14 md:mt-16">
                  <BlogIntakeCTA placement="invite" locatie="blog_hub" />
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
