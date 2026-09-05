import Container from "@/components/layout/Container";
import {
  KB_BG_CLASS,
  KB_HERO_H1,
  KB_HERO_INTRO,
  KB_HERO_PB,
  KB_HERO_PT,
  KB_HUB_LABEL,
} from "@/components/kennisbank/kennisbank-layout";

export default function KennisbankHubHero() {
  return (
    <section className={`${KB_BG_CLASS} ${KB_HERO_PB} ${KB_HERO_PT}`}>
      <Container>
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-stone-300/90" aria-hidden />
            <p className="ps-eyebrow">{KB_HUB_LABEL}</p>
          </div>
          <h1 className={KB_HERO_H1}>Begrippen en concepten</h1>
          <p className={KB_HERO_INTRO}>
            Begrippen over supplementen en leefstijl, elk met bronnen.
          </p>
        </div>
      </Container>
    </section>
  );
}
