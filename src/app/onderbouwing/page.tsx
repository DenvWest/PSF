import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { QUESTIONS } from "@/data/intake-questions";
import {
  LEEFSTIJLCHECK_EVIDENCE_BY_ID,
  LEEFSTIJLCHECK_EVIDENCE_PILLARS,
  LEEFSTIJLCHECK_INTERPRETATION_NOTES,
  LEEFSTIJLCHECK_INTERVENTION_DOMAINS,
  LEEFSTIJLCHECK_READOUT_DOMAINS,
  LEEFSTIJLCHECK_READOUT_MODEL_NOTES,
  LEEFSTIJLCHECK_REFERENCE_LIBRARY,
  LEEFSTIJLCHECK_STRENGTH_DISCLAIMER,
  LEEFSTIJLCHECK_TRANSPARANTIE_NOTES,
  type EvidenceReference,
} from "@/data/leefstijlcheck-evidence";
import { canonicalMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Onderbouwing Leefstijlcheck | PerfectSupplement",
  description:
    "Wetenschappelijke onderbouwing van de Leefstijlcheck per vraag, domein en resultaatinterpretatie.",
  ...canonicalMetadata("/onderbouwing"),
};

const sectionTitleClass =
  "font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-900";

function EvidenceStars({ stars, label }: { stars: 3 | 4 | 5; label: string }) {
  return (
    <p className="text-sm font-medium text-stone-700">
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)} {label}
    </p>
  );
}

function renderRef(ref: EvidenceReference) {
  const meta: string[] = [];
  if (ref.doi) meta.push(`DOI: ${ref.doi}`);
  if (ref.pmid) meta.push(`PMID: ${ref.pmid}`);
  return `${ref.apa}${meta.length ? ` (${meta.join(" · ")})` : ""}`;
}

export default function OnderbouwingPage() {
  const themeOrder = [
    "voeding",
    "beweging",
    "slaap",
    "stress",
    "motivatie",
    "sociale-verbinding",
    "mediterrane-leefstijl",
    "gedragsverandering",
  ] as const;

  return (
    <main className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] pb-20">
      <Container className="pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
            <li>
              <Link href="/" className="transition hover:text-stone-600">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-stone-600">Onderbouwing</li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Onderbouwing van de Leefstijlcheck
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Deze pagina beschrijft de wetenschappelijke basis van elke vraag uit
            de Leefstijlcheck. De check is een leefstijlinstrument voor
            bewustwording en gedragsverandering.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">Belangrijke afbakening</p>
            <ul className="mt-2 space-y-1">
              <li>Deze leefstijlcheck is geen medisch hulpmiddel.</li>
              <li>De uitkomst is geen diagnose of ziektevoorspelling.</li>
              <li>De check geeft geen behandeladvies.</li>
              <li>
                De uitkomst laat alleen zien hoe jouw patroon aansluit bij
                onderzochte leefstijlprincipes.
              </li>
            </ul>
          </div>
        </header>

        <section className="mt-14 max-w-4xl">
          <h2 className={sectionTitleClass}>Hoe is deze leefstijlcheck ontwikkeld?</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            De vragenlijst bevat 15 vragen verdeeld over de domeinen slaap,
            energie, stress, voeding, beweging, herstel en leefstijl. Selectie
            van vragen is gebaseerd op wetenschappelijke leefstijlmodellen,
            internationale richtlijnen en toepasbaarheid in dagelijkse routines.
          </p>
          <ul className="mt-5 space-y-2 text-base leading-relaxed text-stone-600">
            {LEEFSTIJLCHECK_EVIDENCE_PILLARS.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14 max-w-4xl">
          <h2 className={sectionTitleClass}>Hoe interpreteren wij de resultaten?</h2>
          <ul className="mt-4 space-y-2 text-base leading-relaxed text-stone-600">
            {LEEFSTIJLCHECK_INTERPRETATION_NOTES.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14 max-w-4xl">
          <h2 className={sectionTitleClass}>Waarom interventie- en rapportdomeinen?</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            De Leefstijlcheck onderscheidt <strong>gedrag waar je op stuurt</strong> van{" "}
            <strong>hoe je het ervaart</strong>. Dat sluit aan bij internationale
            leefstijlmodellen (MEDLIFE, WHO 24-uurs) en meetliteratuur rond vitaliteit
            en fatigue.
          </p>
          <h3 className="mt-8 font-display text-xl font-semibold text-stone-900">
            Interventiedomeinen
          </h3>
          <ul className="mt-3 space-y-2 text-base leading-relaxed text-stone-600">
            {LEEFSTIJLCHECK_INTERVENTION_DOMAINS.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <h3 className="mt-8 font-display text-xl font-semibold text-stone-900">
            Rapportdomeinen
          </h3>
          <div className="mt-4 space-y-4">
            {LEEFSTIJLCHECK_READOUT_DOMAINS.map((domain) => (
              <article
                key={domain.id}
                className="rounded-xl border border-stone-200 bg-white p-5"
              >
                <h4 className="font-semibold text-stone-900">{domain.label}</h4>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {domain.description}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Aangedreven door: {domain.drivers}
                </p>
              </article>
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-base leading-relaxed text-stone-600">
            {LEEFSTIJLCHECK_READOUT_MODEL_NOTES.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14 max-w-4xl">
          <h2 className={sectionTitleClass}>Onze wetenschappelijke uitgangspunten</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            De onderbouwing volgt een evidence-hierarchie met prioriteit voor
            umbrella reviews, meta-analyses, systematische reviews, Cochrane
            reviews en internationale richtlijnen. Grote cohortstudies en RCT&apos;s
            worden aanvullend gebruikt waar relevant.
          </p>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            Specifiek steunt de methodiek op mediterrane leefstijlprincipes,
            Self-Determination Theory (Deci & Ryan) en literatuur over
            gewoontevorming, zelfregulatie en gedragsbehoud in kleine stappen.
          </p>
        </section>

        <section className="mt-16">
          <h2 className={sectionTitleClass}>Onderbouwing per vraag</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-stone-500">
            {LEEFSTIJLCHECK_STRENGTH_DISCLAIMER}
          </p>
          <div className="mt-6 space-y-6">
            {QUESTIONS.map((question, index) => {
              const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[question.id];
              return (
                <article
                  key={question.id}
                  className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-display text-xl font-semibold text-stone-900">
                    Vraag {index + 1}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-stone-700">
                    {question.question}
                  </p>

                  <div className="mt-6 space-y-5">
                    <section>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
                        Waarom stellen we deze vraag?
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {evidence.whyThisQuestion}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
                        Wetenschappelijke onderbouwing
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-stone-600">
                        {evidence.scientificRationale.map((line) => (
                          <li key={line}>- {line}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
                        Wat zegt jouw antwoord?
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {evidence.answerMeaning.higherAlignment}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {evidence.answerMeaning.lowerAlignment}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
                        Sterkte van het bewijs
                      </h4>
                      <div className="mt-2">
                        <EvidenceStars
                          stars={evidence.strength.stars}
                          label={evidence.strength.label}
                        />
                        <p className="mt-1 text-sm leading-relaxed text-stone-600">
                          {evidence.strength.rationale}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
                        Bronnen
                      </h4>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-stone-600">
                        {evidence.references.map((ref) => (
                          <li key={renderRef(ref)}>{renderRef(ref)}</li>
                        ))}
                      </ol>
                    </section>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 max-w-5xl">
          <h2 className={sectionTitleClass}>Transparantie</h2>
          <ul className="mt-4 space-y-2 text-base leading-relaxed text-stone-600">
            {LEEFSTIJLCHECK_TRANSPARANTIE_NOTES.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className={sectionTitleClass}>Referentiebibliotheek per thema</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {themeOrder.map((theme) => (
              <article
                key={theme}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <h3 className="text-base font-semibold capitalize text-stone-900">
                  {theme.replace("-", " ")}
                </h3>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-stone-600">
                  {LEEFSTIJLCHECK_REFERENCE_LIBRARY[theme].map((ref) => (
                    <li key={renderRef(ref)}>{renderRef(ref)}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-emerald-900 p-8 text-emerald-50">
          <h2 className="font-display text-2xl font-semibold">
            Van inzicht naar actie
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
            Deze onderbouwing helpt je begrijpen waar de vragen vandaan komen. De
            volgende stap blijft praktisch: kies een kleine haalbare routine en
            evalueer je voortgang periodiek.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/intake"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Start de Leefstijlcheck
            </Link>
            <Link
              href="/methodologie"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            >
              Bekijk methodologie
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
