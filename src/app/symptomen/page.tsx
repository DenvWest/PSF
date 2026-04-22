import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Symptomen bij mannelijke menopauze",
  description:
    "Herken jij de symptomen van mannelijke menopauze? Ontdek stress, slaap en energieproblemen en wat je eraan kunt doen.",
};

// Symptomen array — voeg hier eenvoudig nieuwe symptomen toe
const SYMPTOMEN = [
  {
    slug: "stress",
    title: "Stress",
    description: "Meer prikkelbaarheid, minder rust en een hoofd dat niet stopt.",
    // Placeholder achtergrondkleur totdat echte afbeeldingen beschikbaar zijn
    placeholderColor: "bg-amber-100",
    placeholderIcon: "🧠",
  },
  {
    slug: "slaap",
    title: "Slaap",
    description: "Moeite met inslapen, vaker wakker worden of nooit echt uitgerust opstaan.",
    placeholderColor: "bg-indigo-100",
    placeholderIcon: "🌙",
  },
  {
    slug: "energie",
    title: "Energie",
    description: "Een lege batterij halverwege de dag, minder drive en motivatie.",
    placeholderColor: "bg-emerald-100",
    placeholderIcon: "⚡",
  },
] as const;

export default function SymptomenPage() {
  return (
    <div className="bg-stone-50/40 pb-24">
      {/* ── Paginakoptekst ────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="ps-eyebrow mb-3">Stap 1</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
              Symptomen bij mannelijke menopauze
            </h1>
            <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
              Herken jij de signalen? Kies een symptoom om meer te leren over
              oorzaken en wat je eraan kunt doen.
            </p>
          </div>
        </Container>
      </div>

      {/* ── Symptomen grid ────────────────────────────────────────────── */}
      <Container className="pt-10 md:pt-14">
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {SYMPTOMEN.map((symptoom) => (
            <li key={symptoom.slug} className="list-none">
              {/* Hele kaart is klikbaar via de Link-wrapper */}
              <Link
                href={`/thema/${symptoom.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                aria-label={`Meer over ${symptoom.title}`}
              >
                {/* Placeholder afbeelding — vervang door <Image> zodra assets beschikbaar zijn */}
                <div
                  className={`flex h-44 w-full items-center justify-center ${symptoom.placeholderColor}`}
                  aria-hidden
                >
                  <span className="text-5xl">{symptoom.placeholderIcon}</span>
                </div>

                {/* Kaartinhoud */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                    {symptoom.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                    {symptoom.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 transition group-hover:text-emerald-900">
                    <span>Meer over {symptoom.title}</span>
                    <span
                      aria-hidden
                      className="transition group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
