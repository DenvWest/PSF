import Link from "next/link";
import type { KennisbankTheme } from "@/data/kennisbank";
import { themeLabels } from "@/data/kennisbank";
import Container from "@/components/layout/Container";
import KennisbankLibrary from "@/components/kennisbank/KennisbankLibrary";
import KennisbankIntakeCTA from "@/components/kennisbank/KennisbankIntakeCTA";
import type { ContentAudience } from "@/lib/content-audience";
import { getKennisbankLibraryItems } from "@/lib/library/kennisbank-items";
import { KB_HUB_LABEL } from "@/components/kennisbank/kennisbank-layout";
import {
  LIB_EYEBROW,
  LIB_PAGE_BG,
} from "@/components/library/library-tokens";

interface KennisbankThemaPageContentProps {
  theme: KennisbankTheme;
  audience: ContentAudience;
}

export default function KennisbankThemaPageContent({
  theme,
  audience,
}: KennisbankThemaPageContentProps) {
  const config = themeLabels[theme];
  const items = getKennisbankLibraryItems();

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
              <Link href="/kennisbank" className="transition hover:text-stone-600">
                {KB_HUB_LABEL}
              </Link>
            </li>
            <li aria-hidden className="select-none">
              ›
            </li>
            <li className="font-medium text-stone-600">{config.title}</li>
          </ol>
        </nav>

        <header className="max-w-2xl">
          <p className={LIB_EYEBROW}>{KB_HUB_LABEL}</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
            {config.title}
          </h1>
          <p className="mt-3 text-[1rem] leading-relaxed text-stone-600">
            {config.description}
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          <KennisbankLibrary
            items={items}
            initialGroup={theme}
            initialAudience={audience}
            footerSlot={
              <div className="mt-14 md:mt-16">
                <KennisbankIntakeCTA />
              </div>
            }
          />
        </div>
      </Container>
    </main>
  );
}
