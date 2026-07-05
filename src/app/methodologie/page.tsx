import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import MethodologyHero from "@/components/methodology/MethodologyHero";
import MethodologyIntakeCta from "@/components/methodology/MethodologyIntakeCta";
import MethodologyJourney from "@/components/methodology/MethodologyJourney";
import MethodologyLeefstijlCheck from "@/components/methodology/MethodologyLeefstijlCheck";
import MethodologyVoortgang from "@/components/methodology/MethodologyVoortgang";
import MethodologyScoring from "@/components/methodology/MethodologyScoring";
import MethodologyTrustPillars from "@/components/methodology/MethodologyTrustPillars";
import {
  methodologyH2Class,
  methodologyLeadClass,
} from "@/components/methodology/methodology-typography";
import { METHODOLOGY_METADATA, METHODOLOGY_SUPPLEMENTEN } from "@/data/methodology";
import { canonicalMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: METHODOLOGY_METADATA.title,
  description: METHODOLOGY_METADATA.description,
  ...canonicalMetadata("/methodologie"),
};

export default function MethodologiePage() {
  return (
    <main className="bg-[#FDFCFA]">
      <Container>
        <MethodologyHero />
      </Container>

      <Container>
        <MethodologyJourney />

        <section id="leefstijl" className="scroll-mt-28">
          <MethodologyLeefstijlCheck />
          <MethodologyVoortgang />
        </section>
      </Container>

      <section id="supplementen" className="scroll-mt-28 bg-white">
        <Container className="py-14 md:py-16">
          <h2 className={methodologyH2Class}>{METHODOLOGY_SUPPLEMENTEN.title}</h2>
          <p className={methodologyLeadClass}>
            {METHODOLOGY_SUPPLEMENTEN.lead}
          </p>
          <div className="mt-10">
            <MethodologyTrustPillars />
          </div>
          <MethodologyScoring />
        </Container>
      </section>

      <Container>
        <MethodologyIntakeCta />
      </Container>
    </main>
  );
}
