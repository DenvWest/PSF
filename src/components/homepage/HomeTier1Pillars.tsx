import Link from "next/link";
import Container from "@/components/layout/Container";

const TIER1_PILLARS = [
  {
    href: "/voeding-na-40",
    title: "Voeding na 40",
    description: "Eiwit, ritme en vetten — eerst op orde, dan pas supplementen.",
  },
  {
    href: "/beweging-na-40",
    title: "Beweging na 40",
    description: "Kracht, cardio en herstel — zonder sportschool-hype.",
  },
] as const;

export default function HomeTier1Pillars() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 text-center">
            Begin met leefstijl — niet met een winkelmandje
          </h2>
          <p className="mt-3 text-center text-stone-600 leading-relaxed">
            Twee ingangen zonder affiliate in de tekst: voeding en beweging als fundament
            vóór vergelijkingen.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {TIER1_PILLARS.map((pillar) => (
              <li key={pillar.href}>
                <Link
                  href={pillar.href}
                  className="block rounded-xl border border-stone-200 bg-white p-6 transition hover:border-ps-green/40 hover:shadow-sm h-full"
                >
                  <p className="font-semibold text-stone-900">{pillar.title}</p>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {pillar.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-ps-green">
                    Lees de gids →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
