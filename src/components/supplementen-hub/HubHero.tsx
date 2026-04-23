import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

type HubHeroProps = {
  hasSession: boolean;
};

export default function HubHero({ hasSession }: HubHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#F7F5F0] to-white"
      aria-label="Supplementen hub introductie"
    >
      <Container className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Supplementen" },
            ]}
          />
        </div>

        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-stone-900 leading-tight">
            Welk supplement past bij jou?
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-xl mt-4">
            Onafhankelijke gidsen en vergelijkingen — gebaseerd op wetenschap,
            niet op marketing.
          </p>

          <div className="mt-8">
            {hasSession ? (
              <a
                href="#aanbevolen"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5A8F6A] px-8 py-4 text-base font-semibold text-white hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md scroll-smooth"
              >
                Bekijk je aanbevelingen ↓
              </a>
            ) : (
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5A8F6A] px-8 py-4 text-base font-semibold text-white hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md"
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
