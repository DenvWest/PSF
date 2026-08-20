import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";
import type { PillarId } from "@/types/dashboard";

/**
 * Een gekozen ladder-actie krijgt een moment: één datum, één tijdstip, één
 * blok op je agenda. Geen ritme — `agenda_blocks` kent geen herhaling, dus
 * een wekelijkse reeks zou hier verzonnen worden. Het ritme woont in je
 * programma; wat je op de ladder kiest is één afspraak met jezelf.
 *
 * De koppeling actie ↔ blok loopt via categorie + titel, niet via een eigen
 * kolom. De agenda-categorieën zijn 1-op-1 de vijf domeinen en de actietekst
 * is de bloktitel, dus er is niets tussen te verliezen — en geen migratie
 * nodig om een tweede sleutel bij te houden die kan gaan afwijken.
 */

/** Hoever vooruit we blokken laden om een gepland moment terug te vinden. */
export const LADDER_MOMENT_WINDOW_DAYS = 28;

/** Standaardduur van een ladder-actie: kort genoeg om nooit af te schrikken. */
export const LADDER_MOMENT_DEFAULT_MINUTES = 30;

const APP_TIMEZONE = "Europe/Amsterdam";

/**
 * De domeinen die een moment kunnen dragen. Energie en herstel zijn readouts
 * zonder ladder en zonder agenda-categorie — die kunnen hier per type niet
 * binnenkomen, in plaats van pas bij de API te stranden.
 */
export type LadderMomentDomain = Extract<PillarId, AgendaCategoryId>;

const MOMENT_DOMAINS = new Set<string>([
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
]);

export function isLadderMomentDomain(domain: PillarId): domain is LadderMomentDomain {
  return MOMENT_DOMAINS.has(domain);
}

export type LadderMomentDraft = {
  date: string;
  startTime: string;
  durationMinutes: number;
};

export function ladderMomentRange(today = todayInAgendaTimezone()): {
  startDate: string;
  endDate: string;
} {
  return { startDate: today, endDate: addAgendaDays(today, LADDER_MOMENT_WINDOW_DAYS) };
}

/**
 * Het blok dat bij deze actie hoort, of null. Alleen open blokken vanaf
 * vandaag tellen: een afgevinkt of verlopen blok is geschiedenis, geen
 * afspraak die nog staat.
 */
export function findLadderMomentBlock(
  blocks: readonly AgendaBlockRecord[],
  domain: LadderMomentDomain,
  title: string,
  today = todayInAgendaTimezone(),
): AgendaBlockRecord | null {
  const needle = title.trim();
  const matches = blocks.filter(
    (block) =>
      block.categoryId === domain &&
      block.status === "open" &&
      block.date >= today &&
      block.title.trim() === needle,
  );
  if (matches.length === 0) {
    return null;
  }
  return matches.reduce((earliest, block) =>
    block.date < earliest.date ||
    (block.date === earliest.date && block.startTime < earliest.startTime)
      ? block
      : earliest,
  );
}

function weekdayDayMonth(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${isoDate}T12:00:00.000Z`))
    .replace(/\.$/, "");
}

/** "vandaag", "morgen", anders "di 26 aug". */
export function formatMomentDay(isoDate: string, today = todayInAgendaTimezone()): string {
  if (isoDate === today) {
    return "vandaag";
  }
  if (isoDate === addAgendaDays(today, 1)) {
    return "morgen";
  }
  return weekdayDayMonth(isoDate);
}

/** "vandaag · 07:00" — de terugleesregel onder een geplande actie. */
export function formatMomentLabel(
  isoDate: string,
  startTime: string,
  today = todayInAgendaTimezone(),
): string {
  return `${formatMomentDay(isoDate, today)} · ${startTime}`;
}

/**
 * Beginstand van de kiezer. Vandaag als het nog kan, anders morgen: een
 * moment aanbieden dat al voorbij is, is een lege belofte.
 */
export function defaultMomentDate(
  nowMinutes: number,
  lastUsableMinutes: number,
  today = todayInAgendaTimezone(),
): string {
  return nowMinutes < lastUsableMinutes ? today : addAgendaDays(today, 1);
}

/**
 * De dagdelen waar een snel moment in valt. Zelfde tijden als
 * `deriveDefaultScheduledTime`, bewust overgeschreven en niet geïmporteerd:
 * die functie hangt aan de prioriteitsvoorkeur, en die naad hoort hier niet
 * binnengehaald te worden om drie klokwaarden te delen.
 */
const QUICK_MOMENT_TIMES = ["09:00", "14:00", "19:00"] as const;

/** Hoeveel lucht een moment minimaal vooruit moet hebben om nog te tellen. */
export const QUICK_MOMENT_LEAD_MINUTES = 30;

/** "07:30" → 450. */
export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function nowMinutesInAgendaTimezone(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("nl-NL", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "0";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "0";
  return Number(hour) * 60 + Number(minute);
}

/**
 * Het moment dat één klik oplevert: het eerstvolgende dagdeel dat nog past,
 * anders morgenochtend.
 *
 * Waarom een voorstel en geen kiezer: op slaap v2 (`renderKActies`) is "Zet op
 * Mijn Dag" één knop met de bestemming erin — je plant hem, en verzetten doe
 * je daarna. Een datumkiezer die openklapt vóór er iets staat, kost drie rijen
 * hoogte op een scherm dat in één beeld moet passen, en vraagt een beslissing
 * die je nog niet hoeft te nemen. Verzetten kan altijd, en weghalen ook.
 */
export function resolveQuickLadderMoment(
  now: Date = new Date(),
  today: string = todayInAgendaTimezone(),
): LadderMomentDraft {
  const nowMinutes = nowMinutesInAgendaTimezone(now);
  const lastTime = QUICK_MOMENT_TIMES[QUICK_MOMENT_TIMES.length - 1];
  const date = defaultMomentDate(
    nowMinutes,
    minutesOfDay(lastTime) - QUICK_MOMENT_LEAD_MINUTES,
    today,
  );
  const startTime =
    date === today
      ? (QUICK_MOMENT_TIMES.find(
          (time) => minutesOfDay(time) > nowMinutes + QUICK_MOMENT_LEAD_MINUTES,
        ) ?? lastTime)
      : QUICK_MOMENT_TIMES[0];

  return { date, startTime, durationMinutes: LADDER_MOMENT_DEFAULT_MINUTES };
}
