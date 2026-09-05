import Image from "next/image";
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
import { themaCover } from "@/lib/kennisbank-cover";

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
  const cover = themaCover(theme);

  return (
    <main className={LIB_PAGE_BG}>
      <Container className="pb-16 pt-8 md:pb-20 md:pt-10">
        <div className="relative mb-8 aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-xl bg-stone-100 md:mb-10">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

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
