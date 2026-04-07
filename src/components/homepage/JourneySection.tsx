import Container from "@/components/layout/Container";
import StepCard, { type StepCardProps } from "@/components/homepage/StepCard";

const STEPS: StepCardProps[] = [
  {
    step: 1,
    title: "Symptomen",
    description: "Vermoeid? Slechter slapen? Minder drive?",
    // Gewijzigd: navigeert nu naar de symptomenpagina i.p.v. /faqs
    href: "/symptomen",
    ctaLabel: "Ontdek waar je staat",
  },
  {
    step: 2,
    title: "Leefstijl",
    description: "Slaap, training en voeding als basis",
    href: "/methodologie",
  },
  {
    step: 3,
    title: "Supplementen",
    description: "Gerichte ondersteuning wanneer nodig",
    href: "/supplementen",
  },
  {
    step: 4,
    title: "Progressie",
    description: "Blijf verbeteren en meten",
    href: "/blog",
  },
];

export default function JourneySection() {
  return (
    <section
      id="step-care"
      className="scroll-mt-24 border-b border-stone-200/50 bg-white"
      aria-labelledby="step-care-heading"
    >
      <Container className="max-w-screen-xl py-14 md:py-20">
        <div className="mx-auto max-w-screen-xl">
          <div className="mx-auto max-w-[65ch] text-center md:mx-0 md:max-w-none md:text-left">
            <p className="ps-eyebrow">Step-care</p>
            <h2
              id="step-care-heading"
              className="mt-4 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl"
            >
              Vier stappen, jouw tempo
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-600 md:max-w-xl">
              Van herkenning naar routine — zonder drukte.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
