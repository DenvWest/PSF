import Link from "next/link";
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
        <nav aria-label="Breadcrumb" className="mb-10 md:mb-12">
          <ol className="flex items-center gap-2 text-[0.8125rem] text-stone-400">
            <li>
              <Link href="/" className="transition hover:text-stone-600">
                Home
              </Link>
            </li>
            <li aria-hidden className="select-none">
              ›
            </li>
            <li className="font-medium text-stone-600">{KB_HUB_LABEL}</li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-stone-300/90" aria-hidden />
            <p className="ps-eyebrow">{KB_HUB_LABEL}</p>
          </div>
          <h1 className={KB_HERO_H1}>Begrippen & Concepten</h1>
          <p className={KB_HERO_INTRO}>
            Supplementen beoordelen begint met de juiste begrippen kennen. Van
            hoe je lichaam verandert na 40 tot hoe je een etiket leest — hier
            vind je de uitleg die ertoe doet.
          </p>
        </div>
      </Container>
    </section>
  );
}
