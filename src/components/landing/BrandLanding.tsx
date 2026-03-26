import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import HomeWhySection from "./HomeWhySection";
import FoundationStackSection from "./FoundationStackSection";
import HomeKnowledgePreview from "./HomeKnowledgePreview";
import LandingFooter from "./LandingFooter";

export default function BrandLanding() {
  return (
    <div className="min-h-screen bg-[var(--ps-cream)]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HomeWhySection />
        <FoundationStackSection />
        <HomeKnowledgePreview />
      </main>
      <LandingFooter />
    </div>
  );
}
