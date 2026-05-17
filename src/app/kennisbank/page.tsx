import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { getAllThemes, getTermsByTheme } from "@/data/kennisbank";
import KennisbankHubHero from "@/components/kennisbank/KennisbankHubHero";
import KennisbankThemaKaart from "@/components/kennisbank/KennisbankThemaKaart";
import KennisbankIntakeCTA from "@/components/kennisbank/KennisbankIntakeCTA";
import {
  KB_BG_CLASS,
  KB_CARD_SHELL,
  KB_CONVERSION_PY,
  KB_HUB_LABEL,
} from "@/components/kennisbank/kennisbank-layout";

export const metadata: Metadata = {
  title: "Kennisbank — Begrippen & Concepten | PerfectSupplement",
  description:
    "Van biobeschikbaarheid tot healthspan. De belangrijkste begrippen over supplementen, leefstijl en gezond ouder worden — helder uitgelegd.",
  alternates: {
    canonical: "https://perfectsupplement.nl/kennisbank",
  },
};

export default function KennisbankPage() {
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

      <KennisbankHubHero />

      <section className={`${KB_BG_CLASS} pt-2 pb-14 md:pt-3 md:pb-16`} aria-label="Thema's">
        <Container>
          <div className={`${KB_CARD_SHELL} p-5 md:p-8 lg:p-10`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {getAllThemes().map((theme) => (
                <KennisbankThemaKaart
                  key={theme}
                  theme={theme}
                  termCount={getTermsByTheme(theme).length}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className={`${KB_BG_CLASS} ${KB_CONVERSION_PY}`} aria-label="Leefstijlcheck">
        <Container>
          <KennisbankIntakeCTA className="mx-auto max-w-2xl" />
        </Container>
      </section>
    </>
  );
}
