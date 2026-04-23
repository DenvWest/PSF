import Container from "@/components/layout/Container";
import HubHero from "@/components/supplementen-hub/HubHero";
import PersonalizationCta from "@/components/supplementen-hub/PersonalizationCta";
import RecommendedForYou from "@/components/supplementen-hub/RecommendedForYou";
import ProfileUpdateLink from "@/components/supplementen-hub/ProfileUpdateLink";
import ThemaGrid from "@/components/supplementen-hub/ThemaGrid";
import SupplementCatalog from "@/components/supplementen-hub/SupplementCatalog";
import WhyTrustUs from "@/components/supplementen-hub/WhyTrustUs";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";

const MOCK_SESSION: IntakeSessionPayload = {
  sessionId: "preview-session",
  symptoms: ["slaap", "stress"],
  answers: { NUT_O3: 1 },
  scores: {
    sleep_score: 32,
    energy_score: 45,
    stress_score: 28,
    nutrition_score: 38,
    movement_score: 60,
    recovery_score: 41,
  },
  urgency: "moderate",
  profile: "Actieve man",
  timestamp: Date.now(),
  ageRange: "45–49",
};

export default function SupplementenPreviewPage() {
  return (
    <div>
      <HubHero hasSession={false} />

      <Container className="py-12 space-y-12">
        <div>
          <h2 className="font-serif text-lg text-stone-700 mb-4">
            Staat A — PersonalizationCta (geen sessie)
          </h2>
          <PersonalizationCta />
        </div>

        <div>
          <h2 className="font-serif text-lg text-stone-700 mb-4">
            Staat B — RecommendedForYou + ProfileUpdateLink (met sessie)
          </h2>
          <RecommendedForYou session={MOCK_SESSION} />
          <ProfileUpdateLink />
        </div>

        <div>
          <h2 className="font-serif text-lg text-stone-700 mb-4">
            ThemaGrid
          </h2>
          <ThemaGrid />
        </div>

        <div>
          <h2 className="font-serif text-lg text-stone-700 mb-4">
            SupplementCatalog (met CategoryNav filtering)
          </h2>
          <SupplementCatalog />
        </div>

        <WhyTrustUs />
      </Container>

      <Container className="py-12">
        <HubHero hasSession={true} />
      </Container>
    </div>
  );
}
