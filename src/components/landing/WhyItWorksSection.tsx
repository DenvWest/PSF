import SectionShell from "./ui/SectionShell";
import SectionHeading from "./ui/SectionHeading";

const blocks = [
  {
    title: "Waarom een fundament belangrijker is dan losse optimalisatie",
    body: "Het lichaam reageert op herhaling. Een kleine, hoogwaardige ondersteuning die jaren vol te houden is, verslaat een wisselende stapel ‘optimalisaties’. Wij kiezen voor uitlegbaarheid en volhoudbaarheid.",
  },
  {
    title: "De rol van dagelijkse ondersteuning",
    body: "Preventieve gezondheid is geen incident—het is consistentie. Supplementen zijn hier onderdeel van een groter geheel: slaap, beweging, voeding en rust. De merkfilosofie start bij wat dagelijks haalbaar blijft.",
  },
  {
    title: "Een systemische benadering van energie, herstel en vitaliteit",
    body: "We blijven dicht bij wat onderbouwd is—zonder miracle claims. Heldere keuzes, transparante redenering en ruimte voor uw arts of diëtist. Zo blijft preventie serieus en rustig.",
  },
];

export default function WhyItWorksSection() {
  return (
    <section
      id="why-it-works"
      className="border-b border-[var(--ps-border)]/50 py-[var(--ps-section-y)]"
      aria-labelledby="why-heading"
    >
      <SectionShell>
        <SectionHeading
          eyebrow="Onderzoek & expertise"
          title="Principes in plaats van lawaai"
          titleId="why-heading"
          description="Zo denken we over supplementen binnen preventie en longevity: eenvoudig uit te leggen, afgestemd op hoe energie, herstel en vitale reserve zich in de praktijk gedragen."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {blocks.map((block) => (
            <article
              key={block.title}
              className="rounded-[1.35rem] bg-white/90 px-8 py-10 shadow-[0_20px_44px_-28px_rgba(20,20,20,0.09)] sm:px-9 sm:py-11"
            >
              <h3 className="font-display text-[1.25rem] font-light leading-snug tracking-wide text-[var(--ps-ink)] sm:text-[1.35rem]">
                {block.title}
              </h3>
              <p className="mt-6 text-[0.9375rem] leading-[1.75] text-[var(--ps-body)] sm:text-base">
                {block.body}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
