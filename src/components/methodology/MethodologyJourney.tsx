import { METHODOLOGY_JOURNEY } from "@/data/methodology";
import {
  methodologyBodyClass,
  methodologyH2Class,
} from "@/components/methodology/methodology-typography";

function StepNode({ number }: { number: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100 font-serif text-sm text-[#5A8F6A]">
        {number}
      </div>
    </div>
  );
}

export default function MethodologyJourney() {
  return (
    <section
      id="verhaal"
      aria-labelledby="methodology-journey-title"
      className="scroll-mt-28 py-14 md:py-16"
    >
      <h2 id="methodology-journey-title" className={methodologyH2Class}>
        {METHODOLOGY_JOURNEY.title}
      </h2>
      <blockquote className="mt-8 max-w-3xl border-l-2 border-[#5A8F6A] py-2 pl-6 font-serif text-2xl leading-snug text-stone-800 md:text-3xl">
        {METHODOLOGY_JOURNEY.quote}
      </blockquote>

      <ol className="relative mt-12 space-y-0">
        <div
          className="absolute bottom-4 left-5 top-4 w-px bg-stone-200 md:hidden"
          aria-hidden="true"
        />
        {METHODOLOGY_JOURNEY.steps.map((step, index) => (
          <li
            key={step.number}
            className={`relative grid grid-cols-[40px_1fr] gap-x-4 gap-y-1 pb-10 last:pb-0 md:grid-cols-[80px_1fr] md:gap-x-8 ${
              index === 2 ? "-mx-6 rounded-2xl bg-[#F7F5F0]/80 px-6 py-6 md:-mx-8 md:px-8" : ""
            }`}
          >
            <StepNode number={step.number} />
            <div className="pt-1.5">
              <h3 className="font-display text-base font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className={`mt-1 ${methodologyBodyClass}`}>
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
