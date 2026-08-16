"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CONNECTION_AVAILABILITY,
  CONNECTION_TRAVEL_RADIUS,
  CONNECTION_AGE_BANDS,
} from "@/data/connection/vocabulary";
import type { ProfileContentItem } from "@/lib/connection-content";
import type { ProfileChip, ProfileHighlights } from "@/lib/connection-profile/highlights";
import type { ConnectionProfile } from "@/lib/connection-profile/types";

export type HighlightKind =
  | "topics"
  | "brengen"
  | "ontdekken"
  | "praktisch"
  | "way"
  | "first_step"
  | "content"
  | "dashboard";

type ConnectionProfileResultProps = {
  profile: ConnectionProfile;
  highlights: ProfileHighlights;
  content: ProfileContentItem[];
  /** Springt terug de flow in, op de stap die bij het blok hoort. */
  onEdit: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onHighlightClick: (kind: HighlightKind) => void;
  onRemove: () => void;
  removeConfirm: boolean;
  removing: boolean;
};

/**
 * "Dit past bij jou" — de vaste opbrengst van het profiel, zie
 * BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §6 en §10.
 *
 * Dit is geen tussenscherm na het opslaan maar het ADRES van de uitkomst: wie
 * "Wat bij jou past" opent en al iets invulde, komt hier binnen en niet in een
 * formulier. Links staat wat je zelf aantikte (de zichtbare verantwoording),
 * rechts wat dat oplevert.
 *
 * Dit scherm rekent niets uit: alles komt uit resolveProfileHighlights() en
 * resolveProfileContent(), beide getest en beide uitsluitend gevoed door
 * statische data plus het eigen profiel. Voeg hier geen tekst toe die iets
 * belooft wat er nog niet is — dat is precies de fout die van het
 * verbinding-scherm is weggehaald (§12).
 */

const CARD =
  "rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-5 flex flex-col";
const CARD_TITLE = "m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]";
const EDIT_LINK =
  "mt-3.5 inline-flex min-h-11 cursor-pointer items-center self-start border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--sage)]";

function joinLabels(chips: ProfileChip[]): string {
  const labels = chips.map((chip) => chip.label.toLowerCase());
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} en ${labels[labels.length - 1]}`;
}

function ChipRow({ chips, tone }: { chips: ProfileChip[]; tone: "sage" | "terra" }) {
  const className =
    tone === "sage"
      ? "border-[var(--sage)]/45 bg-[var(--sage)]/[0.14]"
      : "border-[var(--terra)]/45 bg-[var(--terra)]/[0.12]";

  return (
    <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
      {chips.map((chip) => (
        <li
          key={chip.id}
          className={`rounded-full border px-3 py-1.5 text-[13px] text-[var(--text)] ${className}`}
        >
          {chip.label}
        </li>
      ))}
    </ul>
  );
}

function Card({
  title,
  children,
  onEdit,
  editLabel,
}: {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <article className={CARD}>
      <h2 className={CARD_TITLE}>{title}</h2>
      {children}
      {onEdit ? (
        <button type="button" onClick={onEdit} className={EDIT_LINK}>
          {editLabel ?? "Bijwerken"} →
        </button>
      ) : null}
    </article>
  );
}

/** De praktische antwoorden teruggegeven, zodat dit scherm ook laat zien wát er van je bewaard is. */
function practicalLines(profile: ConnectionProfile): string[] {
  const lines: string[] = [];

  const slots = CONNECTION_AVAILABILITY.filter((slot) =>
    profile.beschikbaarheid.includes(slot.id),
  ).map((slot) => slot.label.toLowerCase());
  if (slots.length > 0) {
    lines.push(`Je kunt ${slots.join(", ")}.`);
  }

  const radius = CONNECTION_TRAVEL_RADIUS.find((option) => option.id === profile.travelRadius);
  if (profile.areaPc2 && radius) {
    lines.push(`Rond postcodegebied ${profile.areaPc2}, ${radius.label.toLowerCase()}.`);
  } else if (profile.areaPc2) {
    lines.push(`Rond postcodegebied ${profile.areaPc2}.`);
  } else if (radius) {
    lines.push(`${radius.label}.`);
  }

  const band = CONNECTION_AGE_BANDS.find((option) => option.id === profile.ageBand);
  if (band) {
    lines.push(`Leeftijden ${band.label}.`);
  }

  return lines;
}

export default function ConnectionProfileResult({
  profile,
  highlights,
  content,
  onEdit,
  onHighlightClick,
  onRemove,
  removeConfirm,
  removing,
}: ConnectionProfileResultProps) {
  const practical = practicalLines(profile);

  return (
    <section aria-label="Dit past bij jou" className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">
          Wat bij jou past
        </p>
        <h1 className="m-0 font-serif text-[30px] leading-[1.12] text-[var(--text)]">
          Dit past bij jou
        </h1>
        <p className="m-0 max-w-[62ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
          Alles hieronder komt uit wat je zelf aantikte. Je leefstijlcheck staat
          hier los van en blijft daar.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Links: wat je aangaf — de zichtbare verantwoording van elke aanbeveling (§10). */}
        <div className="flex flex-col gap-4">
          <Card
            title="Jouw onderwerpen"
            onEdit={() => {
              onHighlightClick("topics");
              onEdit(1);
            }}
          >
            <ChipRow chips={highlights.topics} tone="sage" />
            <p className="m-0 mt-3 max-w-[52ch] text-[12.5px] leading-relaxed text-[var(--text-muted)]">
              Hier kijken we naar als we iets voor je uitzoeken.
            </p>
          </Card>

          {highlights.brengen.length > 0 ? (
            <Card
              title="Wat jij kunt brengen"
              onEdit={() => {
                onHighlightClick("brengen");
                onEdit(2);
              }}
            >
              <ChipRow chips={highlights.brengen} tone="terra" />
              <p className="m-0 mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-[var(--text)]">
                Je kunt iemand op weg helpen met {joinLabels(highlights.brengen)}.
              </p>
              <p className="m-0 mt-2 max-w-[52ch] text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                Dat is een andere ingang dan hulp vragen, en voor de meeste
                mannen een makkelijkere.
              </p>
            </Card>
          ) : null}

          {highlights.ontdekken.length > 0 ? (
            <Card
              title="Waar jij beter in wil worden"
              onEdit={() => {
                onHighlightClick("ontdekken");
                onEdit(3);
              }}
            >
              <ChipRow chips={highlights.ontdekken} tone="sage" />
            </Card>
          ) : null}

          {practical.length > 0 ? (
            <Card
              title="Waar en wanneer"
              onEdit={() => {
                onHighlightClick("praktisch");
                onEdit(5);
              }}
            >
              <div className="mt-2.5 flex flex-col gap-1.5">
                {practical.map((line) => (
                  <p
                    key={line}
                    className="m-0 text-[13.5px] leading-relaxed text-[var(--text-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        {/* Rechts: wat het oplevert — allemaal berekend uit het eigen profiel (§6). */}
        <div className="flex flex-col gap-4">
          {highlights.firstStep ? (
            <article className="rounded-2xl border border-[var(--sage)]/40 bg-[var(--sage)]/[0.07] p-5">
              <h2 className={CARD_TITLE}>Je eerste stap</h2>
              <p className="m-0 mt-2.5 font-serif text-[19px] leading-snug text-[var(--text)]">
                {highlights.firstStep.title}
              </p>
              <p className="m-0 mt-2 max-w-[54ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
                {highlights.firstStep.body}
              </p>
              {highlights.style.formLabel ? (
                <p className="m-0 mt-3 text-[12.5px] leading-relaxed text-[var(--text-subtle)]">
                  Je koos {highlights.style.formLabel}
                  {highlights.style.reach ? ` en ${highlights.style.reach}` : ""} — zo
                  hoeft het er ook uit te zien.
                </p>
              ) : null}
            </article>
          ) : null}

          <Card
            title={
              highlights.ways.length === 1
                ? "1 manier die bij jou past"
                : `${highlights.ways.length} manieren die bij jou passen`
            }
          >
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {highlights.ways.map((way) => (
                <li
                  key={way.id}
                  className="border-l border-[var(--sage)]/45 pl-3 text-[14px] text-[var(--text)]"
                >
                  {way.name}
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--text-muted)]">
                    {way.subtitle}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {content.length > 0 ? (
            <Card title="Hier sluit dit op aan">
              <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
                {content.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      onClick={() => onHighlightClick("content")}
                      className="block text-[14px] leading-snug text-[var(--text)] no-underline"
                    >
                      {item.title}
                      <span className="mt-0.5 block text-[12px] text-[var(--text-subtle)]">
                        {item.pillarLabel}
                        {item.readingTime ? ` · ${item.readingTime}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Link
            href="/dashboard"
            onClick={() => onHighlightClick("dashboard")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--sage)] px-5 py-2.5 text-[14px] font-semibold text-[#0f1c10] no-underline"
          >
            Naar je dashboard
          </Link>
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-[var(--divider)] pt-4">
        <p className="m-0 max-w-[62ch] text-[12px] leading-relaxed text-[var(--text-subtle)]">
          Wat je invulde blijft privé. Niemand ziet dit; het bepaalt alleen wat
          wij je laten zien. Je kunt het weghalen — dan verdwijnen je keuzes en
          je toestemming, en blijft je leefstijlcheck ongemoeid.
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="min-h-11 cursor-pointer self-start border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--terra)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {removeConfirm ? "Weet je het zeker?" : "Wat ik invulde verwijderen"}
        </button>
      </footer>
    </section>
  );
}
