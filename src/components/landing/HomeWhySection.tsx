import SectionShell from "./ui/SectionShell";

export default function HomeWhySection() {
  return (
    <section
      id="why"
      className="border-b border-[var(--ps-border)]/50 py-[clamp(5rem,12vw,8rem)]"
      aria-labelledby="why-heading"
    >
      <SectionShell>
        <div className="mx-auto max-w-3xl">
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-[var(--ps-muted)] sm:text-xs">
            Waarom Perfect Supplement
          </p>
          <h2
            id="why-heading"
            className="font-display mt-8 text-[clamp(1.875rem,4vw,2.75rem)] font-light leading-[1.12] tracking-[-0.03em] text-[var(--ps-ink)]"
          >
            Kwaliteit en uitleg—geen programma
          </h2>
          <div className="mt-12 space-y-8 font-sans text-[1.0625rem] leading-[1.75] text-[var(--ps-body)] sm:text-lg sm:leading-[1.72]">
            <p>
              Wij richten ons op supplementen die veel mensen dagelijks gebruiken:
              omega-3 en magnesium. Geen brede gezondheidsbeloftes—wel duidelijke
              informatie zodat je zelf kunt kiezen.
            </p>
            <p>
              Perfect Supplement is een premium merk met een redactionele aanpak:
              eerst begrijpen wat op het etiket staat, daarna vergelijken en
              beslissen.
            </p>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}
