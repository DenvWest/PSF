"use client";

import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import Container from "@/components/layout/Container";
import { INTAKE_QUESTIONS_LABEL } from "@/lib/intake-facts";
import {
  VOEDINGCHECK_DURATION_LABEL,
  VOEDINGCHECK_QUESTIONS_LABEL,
} from "@/lib/voedingcheck-facts";

type CheckOption = {
  key: string;
  icon: string;
  title: string;
  meta: string;
  body: string;
  href: string;
  cta: string;
};

const OPTIONS: CheckOption[] = [
  {
    key: "voeding",
    icon: "🥗",
    title: "Voedingcheck",
    meta: `${VOEDINGCHECK_QUESTIONS_LABEL} · ${VOEDINGCHECK_DURATION_LABEL}`,
    body: "Wil je vooral weten of je genoeg eiwit, omega-3, magnesium, vitamine D en zink binnenkrijgt? Deze check laat zien wat je voeding wel en niet dekt.",
    href: "/intake/voeding",
    cta: "Start de Voedingcheck →",
  },
  {
    key: "leefstijl",
    icon: "☀️",
    title: "Leefstijlcheck",
    meta: `${INTAKE_QUESTIONS_LABEL} · 3 minuten`,
    body: "Wil je een breder beeld — hoe slaap, stress, beweging en voeding samen bij jou uitpakken? Deze check zet alles in één profiel.",
    href: "/intake",
    cta: "Start de Leefstijlcheck →",
  },
];

export default function CheckChooser() {
  return (
    <main className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] py-14 md:py-20">
      <Container className="max-w-3xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-ps-green">
            Gratis · geen account nodig
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Welke check past bij jouw vraag?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Allebei gratis en anoniem. Kies de Voedingcheck voor een snel
            antwoord over je voeding, of de Leefstijlcheck voor het volledige
            beeld.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <article
              key={option.key}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-7"
            >
              <span className="text-2xl" aria-hidden>
                {option.icon}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-stone-900">
                {option.title}
              </h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone-400">
                {option.meta}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                {option.body}
              </p>
              <IntakeCtaLink
                locatie={`check_chooser_${option.key}`}
                href={option.href}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
              >
                {option.cta}
              </IntakeCtaLink>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
