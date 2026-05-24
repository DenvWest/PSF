import type { Metadata } from "next";
import Hero from "@/components/homepage/Hero";
import HomeTrustSection from "@/components/homepage/HomeTrustSection";
import LifestyleCheckSection from "@/components/homepage/LifestyleCheckSection";
import HomeGuidesPromoSection from "@/components/homepage/HomeGuidesPromoSection";
import "./homepage.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Voor mannen 40+: ontdek in 3 minuten of vermoeidheid door leefstijl komt — niet door testosteron. Gratis Leefstijlcheck, 15 vragen.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <HomeTrustSection />
      <LifestyleCheckSection />
      <HomeGuidesPromoSection />
    </div>
  );
}
