import Link from "next/link";
import type { CategorieConfig } from "@/data/blog/categorieen";
import type { ContentAudience } from "@/lib/content-audience";
import type { LibraryItem } from "@/lib/library/library-item";
import Container from "@/components/layout/Container";
import BlogLibrary from "@/components/blog/BlogLibrary";
import BlogIntakeCTA from "@/components/blog/BlogIntakeCTA";
import BlogThemaLinks from "@/components/blog/BlogThemaLinks";
import { BLOG_HUB_LABEL } from "@/components/blog/blog-layout";
import {
  LIB_EYEBROW,
  LIB_PAGE_BG,
} from "@/components/library/library-tokens";

interface Props {
  config: CategorieConfig;
  /** Alle artikelen; de zijbalk toont de tellingen van elke categorie. */
  items: LibraryItem[];
  audience: ContentAudience;
}

export default function BlogCategoriePageContent({
  config,
  items,
  audience,
}: Props) {
  return (
    <main className={LIB_PAGE_BG}>
      <Container className="pb-16 pt-[5.5rem] md:pb-20 md:pt-28">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-stone-400">
            <li>
              <Link href="/" className="transition hover:text-stone-600">
                Home
              </Link>
            </li>
            <li aria-hidden className="select-none">
              ›
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-stone-600">
                {BLOG_HUB_LABEL}
              </Link>
            </li>
            <li aria-hidden className="select-none">
              ›
            </li>
            <li className="font-medium text-stone-600">{config.naam}</li>
          </ol>
        </nav>

        <header className="max-w-2xl">
          <p className={LIB_EYEBROW}>{BLOG_HUB_LABEL}</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
            {config.naam}
          </h1>
          <p className="mt-3 text-[1rem] leading-relaxed text-stone-600">
            {config.beschrijving}
          </p>
          <Link
            href={config.themaHref}
            className="mt-3 inline-block text-[0.875rem] font-medium text-ps-green transition-colors hover:text-ps-green-hover"
          >
            Naar de themagids →
          </Link>
        </header>

        <div className="mt-8 md:mt-10">
          <BlogLibrary
            items={items}
            initialGroup={config.id}
            initialAudience={audience}
            footerSlot={
              <div className="mt-14 md:mt-16">
                <BlogIntakeCTA placement="invite" locatie="blog_categorie" />
              </div>
            }
          />
        </div>
      </Container>

      <section className="border-t border-stone-200/70 py-16 md:py-20">
        <Container>
          <BlogThemaLinks
            heading="Andere themagidsen"
            subtext="Gidsen over slaap, stress en energie."
          />
        </Container>
      </section>
    </main>
  );
}
