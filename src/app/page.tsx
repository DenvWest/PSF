import type { Metadata } from "next";
import Hero from "@/components/homepage/Hero";
import HomeFeaturedBlogSection from "@/components/homepage/HomeFeaturedBlogSection";
import JourneySection from "@/components/homepage/JourneySection";
import "./homepage.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Voor mannen 40+: grip op energie, slaap en leefstijl—stap voor stap, zonder harde sales.",
};

export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <JourneySection />
      <HomeFeaturedBlogSection />
    </div>
  );
}
