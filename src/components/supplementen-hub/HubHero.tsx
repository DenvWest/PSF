import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

type HubHeroProps = {
  hasSession: boolean;
};

export default function HubHero({ hasSession }: HubHeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDFCFA 0%, #F7F5F0 100%)" }}
      aria-label="Supplementen hub introductie"
    >
      <Container className="relative py-16 lg:py-24">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Supplementen" },
          ]}
        />

        <div className="mt-6 max-w-2xl">
          <h1 className="font-display text-3xl md:text-5xl text-stone-900 leading-tight">
            Welk supplement past bij jou?
          </h1>
          <p className="mt-4 text-base md:text-lg text-stone-600 leading-relaxed max-w-xl">
            Onafhankelijke gidsen en vergelijkingen — gebaseerd op wetenschap,
            niet op marketing.
          </p>

          <div className="mt-8">
            {hasSession ? (
              <a
                href="#aanbevolen"
                className="inline-flex items-center gap-2 rounded-lg bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md scroll-smooth"
              >
                Bekijk je aanbevelingen ↓
              </a>
            ) : (
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 rounded-lg bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md"
              >
                Doe de leefstijlcheck →
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
