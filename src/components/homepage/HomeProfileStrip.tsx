import Link from "next/link";
import Container from "@/components/layout/Container";

const PROFILES = [
  {
    slug: "onrustige-slaper",
    label: "Onrustige Slaper",
    hint: "Wakker liggen, cortisol 's nachts",
  },
  {
    slug: "stressdrager",
    label: "Stressdrager",
    hint: "Altijd aan, moeilijk ontspannen",
  },
  {
    slug: "lage-batterij",
    label: "Lage Batterij",
    hint: "Moe overdag, weinig veerkracht",
  },
  {
    slug: "overtrainer",
    label: "Overtrainer",
    hint: "Trainen helpt niet meer zoals vroeger",
  },
] as const;

export default function HomeProfileStrip() {
  return (
    <section className="border-t border-stone-200 bg-stone-50 py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
            Herken je een patroon?
          </h2>
          <p className="mt-3 text-stone-600 leading-relaxed">
            Vier veelvoorkomende profielen bij mannen 40+ — met herkenning, uitleg en een
            concreet plan. Geen diagnose, wel een startpunt.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {PROFILES.map((profile) => (
            <li key={profile.slug}>
              <Link
                href={`/profiel/${profile.slug}`}
                className="block h-full rounded-xl border border-stone-200 bg-white p-5 transition hover:border-ps-green/40 hover:shadow-sm"
              >
                <p className="font-semibold text-stone-900">{profile.label}</p>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{profile.hint}</p>
                <span className="mt-3 inline-block text-sm font-medium text-ps-green">
                  Bekijk profiel →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center">
          <Link
            href="/profiel"
            className="text-sm font-medium text-stone-600 underline underline-offset-[3px] hover:text-stone-900"
          >
            Alle profielen op één pagina
          </Link>
        </p>
      </Container>
    </section>
  );
}
