import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { VoortgangReturnBanner } from "@/components/dashboard/VoortgangReturnBanner";

export type SupplementHubState = "no_intake" | "needs_nutrition" | "ready";

type HubHeroProps = {
  hubState: SupplementHubState;
};

export default function HubHero({ hubState }: HubHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#F7F5F0] to-white"
      aria-label="Supplementen hub introductie"
    >
      <Container className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <VoortgangReturnBanner surface="supplementen" />
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Supplementen" },
            ]}
          />
        </div>

        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-6xl">
            Welk supplement past bij jou?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-500">
            Onafhankelijke gidsen en vergelijkingen — gebaseerd op wetenschap,
            niet op marketing.
          </p>

          <div className="mt-8">
            {hubState === "no_intake" ? (
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 rounded-xl bg-ps-green px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
              >
                Ontdek welke supplementen bij jou passen →
              </Link>
            ) : (
              <a
                href="#aanbevolen"
                className="inline-flex items-center gap-2 rounded-xl bg-ps-green px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md scroll-smooth"
              >
                {hubState === "needs_nutrition"
                  ? "Doe je voedingscheck ↓"
                  : "Bekijk je aanbevelingen ↓"}
              </a>
            )}
            {hubState === "no_intake" ? (
              <IntakeCtaMicro className="mt-4 max-w-xl text-sm text-stone-500" />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
