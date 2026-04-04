import SectionShell from "./ui/SectionShell";

export default function PhilosophySection() {
  return (
    <section
      className="border-b border-[var(--ps-border)]/50 bg-[var(--ps-ink)] py-[var(--ps-section-y)] text-[var(--ps-cream)]"
      aria-labelledby="philosophy-heading"
    >
      <SectionShell>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-white/45">
            Filosofie
          </p>
          <h2
            id="philosophy-heading"
            className="font-display mt-8 text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.12] tracking-wide text-white"
          >
            Een rustiger pad naar meer gezondheidskapitaal
          </h2>
          <div className="mt-14 space-y-8 text-[1.0625rem] leading-[1.8] text-white/78 sm:text-lg">
            <p>
              Minder ruis. Minder, maar betere essentials. Bouwen vanaf de basis—zodat
              energie, focus en herstel niet worden geleend van morgen.
            </p>
            <p>
              Perfect Supplement is voor wie helderheid zoekt in plaats van chaos:
              professionals en gezondheidsbewuste volwassenen die onderstatement
              verkiezen boven urgentie, en inhoud boven marketingtheater.
            </p>
            <p className="text-white/55">
              Wij zijn geen kliniek en geen coachingsprogramma. Wij zijn een premium
              supplementenmerk met een preventief en longevity-gericht kader—waarin
              systemen, geen losse producten, de toon zetten. Vandaag begint dat bij
              een gedisciplineerd dagelijks fundament.
            </p>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}
