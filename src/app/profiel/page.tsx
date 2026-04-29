import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { PROFILE_PAGES } from "@/data/profiles";

export const metadata: Metadata = {
  title: "Profielen: Welk Type Ben Jij? | PerfectSupplement",
  description:
    "Zes profielen voor mannen 40+: Stressdrager, Lage Batterij, Onrustige Slaper en meer. Herken jezelf en ontdek wat je kunt doen.",
  alternates: { canonical: "https://perfectsupplement.nl/profiel" },
};

export default function ProfielOverzichtPage() {
  const profiles = Object.values(PROFILE_PAGES);

  return (
    <main>
      <Container>
        <div className="py-12 md:py-20">
          <div className="max-w-2xl mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 leading-tight mb-4">
              Welk profiel herken jij?
            </h1>
            <p className="text-lg text-slate-600">
              Zes veelvoorkomende patronen bij mannen 40+. Herken jezelf en
              ontdek wat je kunt doen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profiles.map((profile) => (
              <Link key={profile.slug} href={`/profiel/${profile.slug}`}>
                <div className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors h-full">
                  <h2 className="font-serif text-xl text-slate-900">
                    {profile.label}
                  </h2>
                  <p className="text-slate-600 mt-2">{profile.hero.subline}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 bg-emerald-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-3">
              Weet je niet welk profiel bij je past?
            </h2>
            <p className="text-slate-600 mb-6">
              De Leefstijlcheck bepaalt het voor je in 3 minuten.
            </p>
            <Link
              href="/intake"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Doe de gratis Leefstijlcheck
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
