import Container from "@/components/layout/Container";
import StepCard, { type StepCardProps } from "@/components/homepage/StepCard";

const STEPS: StepCardProps[] = [
  {
    step: 1,
    title: "Herken Symptomen",
    description: "Vermoeid? Slechter slapen? Minder drive?",
    href: "/faqs",
    ctaLabel: "Ontdek waar je staat",
  },
  {
    step: 2,
    title: "Herstel Leefstijl",
    description: "Slaap, training, voeding en stress vormen je basis.",
    href: "/methodologie",
  },
  {
    step: 3,
    title: "Gerichte Supplementen",
    description: "Ondersteun je lichaam gericht wanneer de basis staat.",
    href: "/supplementen",
  },
  {
    step: 4,
    title: "Volg & Optimaliseer",
    description: "Meet je progressie en blijf verbeteren.",
    href: "/blog",
  },
];

/**
 * Step-care navigatie: educatie → leefstijl → supplementen → vervolg.
 */
export default function JourneySection() {
  return (
    <section
      id="step-care"
      className="home-journey-section border-b border-stone-200/60 bg-white"
      aria-labelledby="step-care-heading"
    >
      <Container>
        <div className="home-journey-inner max-w-[65ch] lg:max-w-none">
          <p className="ps-eyebrow">Jouw pad</p>
          <h2 id="step-care-heading" className="home-journey-title ps-display mt-5 text-stone-900">
            Step-Care Pad
          </h2>
          <p className="mt-4 max-w-[65ch] text-[0.9375rem] leading-[1.75] text-stone-600">
            Van herkenning naar routine: volg de stappen in je eigen tempo.
          </p>

          <div className="step-care-grid mt-10 lg:mt-12">
            {STEPS.map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
