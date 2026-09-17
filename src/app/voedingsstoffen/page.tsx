import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { nutrientContent } from "@/data/content-graph/nutrient-content";
import { NUTRIENT_PAGES } from "@/data/nutrition/nutrient-pages";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { buildNamedItemListSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Voedingsstoffen: waar ze in zitten en hoeveel je nodig hebt",
  description:
    "Vijf voedingsstoffen met een supplementroute: eiwit, omega-3, vitamine D, magnesium en zink. Per stof de bronnen, de drempel en wanneer aanvullen ergens over gaat.",
  ...canonicalMetadata("/voedingsstoffen"),
};

const jsonLd = buildNamedItemListSchema(
  "Voedingsstoffen",
  NUTRIENT_IDS.map((id) => ({
    name: nutrientContent(id).label,
    url: `/voedingsstoffen/${NUTRIENT_PAGES[id].slug}`,
  })),
);

export default function VoedingsstoffenHub() {
  const stoffen = NUTRIENT_IDS.map((id) => ({
    copy: NUTRIENT_PAGES[id],
    content: nutrientContent(id),
    route: nutrientRoute(id),
  }));

  const macro = stoffen.filter((s) => s.content.groep === "macro");
  const micro = stoffen.filter((s) => s.content.groep === "micro");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-10 md:py-14">
        <Container>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Voedingsstoffen" }]}
          />

          <header className="mt-8 max-w-[68ch]">
            <h1 className="text-balance font-serif text-[2rem] leading-[1.15] text-stone-900 md:text-[2.5rem]">
              Waar zitten deze voedingsstoffen in?
            </h1>
            <p className="mt-5 text-[1.0625rem] leading-[1.75] text-stone-600">
              Vijf stoffen waarvoor een supplement bestaat én waarvoor je bord
              een alternatief heeft. Per stof: welke voeding hem levert, welke
              drempel eraan hangt, en wanneer aanvullen pas ergens over gaat.
              Eerst je eten, dan pas het potje.
            </p>
          </header>

          {[
            { titel: "Macronutriënt", items: macro },
            { titel: "Micronutriënten", items: micro },
          ].map((groep) =>
            groep.items.length > 0 ? (
              <section key={groep.titel} className="mt-12">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {groep.titel}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {groep.items.map(({ copy, content, route }) => (
                    <li key={copy.slug}>
                      <Link
                        href={`/voedingsstoffen/${copy.slug}`}
                        className="group block h-full rounded-2xl border border-stone-200/90 bg-white px-6 py-5 transition hover:border-ps-green/45 hover:shadow-[0_4px_14px_rgba(90,143,106,0.12)]"
                      >
                        <span className="block font-serif text-[1.25rem] text-stone-900 transition-colors group-hover:text-ps-green">
                          {content.label}
                        </span>
                        <span className="mt-2 block text-[0.9375rem] leading-relaxed text-stone-600">
                          {route.thresholdNl}
                        </span>
                        <span className="mt-3 block text-[13px] text-stone-500">
                          {content.insights.length} artikelen
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}

          <p className="mt-12 max-w-[68ch] text-[0.9375rem] leading-relaxed text-stone-600">
            Wil je weten of jíj hieraan komt? De{" "}
            <Link
              href="/intake/voeding"
              className="font-medium text-emerald-800 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-800"
            >
              voedingscheck
            </Link>{" "}
            leest in een minuut uit wat je bord voor deze vijf stoffen doet.
          </p>

          <div className="mt-12">
            <MedicalDisclaimer />
          </div>
        </Container>
      </main>
    </>
  );
}
