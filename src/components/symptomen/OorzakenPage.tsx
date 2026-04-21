import Link from "next/link";
import type { OorzakenData } from "@/types/symptomen";
import { crossLinks } from "@/data/symptomen/cross-links";
import Breadcrumbs from "./Breadcrumbs";
import OorzaakCategorieBlok from "./OorzaakCategorieBlok";
import GerelateerdBlok from "./GerelateerdBlok";
import Container from "@/components/layout/Container";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";

interface OorzakenPageProps {
  data: OorzakenData;
  symptoomLabel: string;
}

export default function OorzakenPage({ data, symptoomLabel }: OorzakenPageProps) {
  const gerelateerdLinks = crossLinks[data.slug]?.oorzaken ?? [];

  return (
    <div className="bg-stone-50/40 pb-24">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: "Symptomen", href: "/symptomen" },
              { label: symptoomLabel, href: `/symptomen/${data.slug}` },
              { label: "Oorzaken" },
            ]}
          />

          <div className="ps-prose-container mt-5">
            <h1 className="ps-symptoom-h1 text-4xl text-stone-900 md:text-5xl">
              {data.h1}
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              {renderInlineMarkdownLinks(data.intro)}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        {/* ── H2 ────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
          {data.h2Titel}
        </h2>

        {/* ── Categorie-blokken ─────────────────────────────────────── */}
        <div className="mt-8 space-y-0">
          {data.categorieen.map((categorie, i) => (
            <OorzaakCategorieBlok key={i} categorie={categorie} index={i} />
          ))}
        </div>

        {/* ── Afsluiting + CTA ──────────────────────────────────────── */}
        <div className="mt-16 rounded-2xl border border-stone-200 bg-white px-8 py-10">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
            {data.afsluitingTitel}
          </h2>
          <p className="ps-prose-container mt-3 text-sm leading-relaxed text-stone-600">
            {renderInlineMarkdownLinks(data.afsluitingTekst)}
          </p>
          <div className="mt-6">
            <Link
              href={data.ctaOplossingen.href}
              className="ps-btn-primary inline-flex min-h-[44px] items-center"
            >
              {data.ctaOplossingen.label}
            </Link>
          </div>
        </div>

        {/* ── Gerelateerd (cross-links) ─────────────────────────────── */}
        {gerelateerdLinks.length > 0 && (
          <div className="mt-16">
            <GerelateerdBlok links={gerelateerdLinks} />
          </div>
        )}
      </Container>
    </div>
  );
}
