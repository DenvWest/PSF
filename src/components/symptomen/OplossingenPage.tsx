import type { OplossingenData } from "@/types/symptomen";
import { crossLinks } from "@/data/symptomen/cross-links";
import Breadcrumbs from "./Breadcrumbs";
import OplossingNiveauBlok from "./OplossingNiveauBlok";
import CTASection from "./CTASection";
import GerelateerdBlok from "./GerelateerdBlok";
import Container from "@/components/layout/Container";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";

interface OplossingenPageProps {
  data: OplossingenData;
  symptoomLabel: string;
}

export default function OplossingenPage({ data, symptoomLabel }: OplossingenPageProps) {
  const gerelateerdLinks = crossLinks[data.slug]?.oplossingen ?? [];

  return (
    <div className="bg-stone-50/40 pb-24">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: "Symptomen", href: "/symptomen" },
              { label: symptoomLabel, href: `/symptomen/${data.slug}` },
              { label: "Oplossingen" },
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
        {/* ── Drie niveaus ────────────────────────────────────────────── */}
        <div className="space-y-16">
          {data.niveaus.map((niveau) => (
            <OplossingNiveauBlok key={niveau.niveau} niveau={niveau} />
          ))}
        </div>

        {/* ── CTA sectie ──────────────────────────────────────────────── */}
        <div className="mt-16">
          <CTASection
            titel={data.cta.titel}
            tekst={data.cta.tekst}
            knopLabel={data.cta.knopLabel}
            knopDisabled={data.cta.knopDisabled}
            secundaireLink={data.cta.secundaireLink}
          />
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
