import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PsScoreUitleg from "@/components/supplement-hub/PsScoreUitleg";
import {
  PS_SCORE_MODEL_DATE,
  PS_SCORE_MODEL_VERSION,
} from "@/data/supplement-hub/score-model";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "PS-Score — hoe we supplementen beoordelen",
  description:
    "De volledige rekenmethode achter onze supplementscore: vier onderdelen, de onderzoeksdosis per categorie, de opneembaarheid per vorm — en waarom prijs er niet in zit.",
  openGraph: {
    title: "PS-Score — hoe we supplementen beoordelen",
    description:
      "Berekend in plaats van ingetypt, zonder prijs in de score. De volledige methode, na te rekenen.",
  },
  ...canonicalMetadata("/ps-score"),
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "https://perfectsupplement.nl" },
  { name: "Supplementen", url: "/supplementen" },
  { name: "PS-Score", url: "/ps-score" },
]);

export default function PsScorePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="bg-[#FDFCFA] pb-20">
        <section className="bg-gradient-to-b from-[#F7F5F0] to-[#FDFCFA]">
          <Container className="pt-12 pb-14 md:pt-16 md:pb-16">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Supplementen", href: "/supplementen" },
                { label: "PS-Score" },
              ]}
            />

            <div className="mt-8 max-w-3xl">
              <p className="font-display text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                Model {PS_SCORE_MODEL_VERSION} · {PS_SCORE_MODEL_DATE}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl">
                Hoe de PS-Score tot stand komt
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                Elk supplement in onze catalogus krijgt een cijfer van 0 tot 100.
                Dat cijfer typen we niet in — we rekenen het uit, uit feiten die
                op het etiket staan en uit de Europese lijst van goedgekeurde
                gezondheidsclaims. Hieronder staat de hele rekensom, zodat je hem
                kunt nalopen en oneens kunt zijn.
              </p>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                Waar die feiten vandaan komen: het etiket, het Europese
                claimregister en labrapporten die fabrikanten zelf publiceren.
                Eigen labanalyses doen we (nog) niet —{" "}
                <Link
                  href="#grenzen"
                  className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] hover:decoration-ps-green"
                >
                  wat dat wel en niet zegt, staat onderaan
                </Link>
                .
              </p>

              <div className="mt-8">
                <Link
                  href="/supplementen#producten"
                  className="inline-flex items-center gap-2 rounded-xl bg-ps-green px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
                >
                  Bekijk de scores per product →
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <Container className="pt-14 md:pt-16">
          <PsScoreUitleg />
        </Container>
      </main>
    </>
  );
}
