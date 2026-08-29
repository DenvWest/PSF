import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import KennisbankLibrary from "@/components/kennisbank/KennisbankLibrary";
import KennisbankIntakeCTA from "@/components/kennisbank/KennisbankIntakeCTA";
import { getKennisbankLibraryItems } from "@/lib/library/kennisbank-items";
import {
  AUDIENCE_PARAM,
  resolveContentAudience,
} from "@/lib/content-audience";
import { KB_HUB_LABEL } from "@/components/kennisbank/kennisbank-layout";
import {
  LIB_EYEBROW,
  LIB_PAGE_BG,
} from "@/components/library/library-tokens";

export const metadata: Metadata = {
  title: "Kennisbank — Begrippen & Concepten",
  description:
    "Van biobeschikbaarheid tot healthspan. De belangrijkste begrippen over supplementen, leefstijl en gezond ouder worden — helder uitgelegd, met bronnen.",
  alternates: {
    canonical: "https://perfectsupplement.nl/kennisbank",
  },
};

type KennisbankPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KennisbankPage({
  searchParams,
}: KennisbankPageProps) {
  const params = await searchParams;
  const audience = resolveContentAudience(
    typeof params[AUDIENCE_PARAM] === "string" ? params[AUDIENCE_PARAM] : undefined,
  );
  const items = getKennisbankLibraryItems();

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
                    name: KB_HUB_LABEL,
                    item: "https://perfectsupplement.nl/kennisbank",
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                name: KB_HUB_LABEL,
                description:
                  "Begrippen en concepten over supplementen, leefstijl en gezond ouder worden — helder uitgelegd.",
                url: "https://perfectsupplement.nl/kennisbank",
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
              <li className="font-medium text-stone-600">{KB_HUB_LABEL}</li>
            </ol>
          </nav>

          <header className="max-w-2xl">
            <p className={LIB_EYEBROW}>{KB_HUB_LABEL}</p>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
              Begrippen &amp; concepten
            </h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-stone-600">
              {items.length} begrippen die je nodig hebt om een etiket, een
              dosering of een claim zelf te beoordelen. Elk begrip staat op
              bronnen, niet op mening.
            </p>
          </header>

          <div className="mt-8 md:mt-10">
            <KennisbankLibrary
              items={items}
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
    </>
  );
}
