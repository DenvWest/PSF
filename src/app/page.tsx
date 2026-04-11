import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display } from "next/font/google";
import Hero from "@/components/homepage/Hero";
import HomeFeaturedBlogSection from "@/components/homepage/HomeFeaturedBlogSection";
import JourneySection from "@/components/homepage/JourneySection";
import "./homepage.css";

const intakeCtaHeading = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

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
      <section className="border-t border-stone-200/60 pb-20 md:pb-28">
        <div className="mx-auto max-w-[680px] px-6 lg:px-8">
          <div
            className="mx-auto text-center"
            style={{
              background: "#1a1a1a",
              borderRadius: 16,
              padding: "40px 24px",
            }}
          >
            <h2
              className={`${intakeCtaHeading.className} m-0 text-[24px] font-normal leading-snug text-white`}
            >
              Ontdek waar je staat
            </h2>
            <p
              className="mx-auto mt-3 max-w-[28rem] text-[15px] leading-relaxed text-[#999]"
            >
              Beantwoord 12 vragen en krijg een persoonlijk herstelplan.
            </p>
            <Link
              href="/intake"
              className="mt-6 inline-block rounded-[10px] bg-white px-8 py-[14px] text-sm font-semibold text-[#1a1a1a] transition hover:bg-stone-100"
            >
              Start de intake →
            </Link>
            <p className="mb-0 mt-4 text-[12px] text-[#666]">
              Duurt 3 minuten · gratis · geen account nodig
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
