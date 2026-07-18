import type { QuestionId } from "@/data/intake-questions";
import type {
  DeficiencySignals,
  DomainScores,
  ProfileLabel,
} from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { GuideThema } from "@/types/guide-opt-in";

/**
 * Leefstijlplan als data, niet als PDF.
 *
 * Eén `LifestylePlanTemplate` (de content die jij/Cursor schrijft) + de losse
 * `PlanProgress` (de pseudonieme voortgang per gebruiker) vormen samen de bron
 * waaruit web, PDF, e-mail (n8n-nurture) en het B2B-coach-dashboard renderen.
 *
 * Ontwerpregels:
 * - Content en weergave zijn gescheiden: een template kent geen Tailwind/JSX.
 * - Personalisatie is declaratief (`PlanCondition`), niet via inline functies —
 *   zo blijft een template serialiseerbaar (PDF/e-mail/n8n) en testbaar.
 * - `id`-velden zijn stabiel: ze zijn sleutels in `PlanProgress` en in events.
 *   Hernoem ze nooit; voeg liever een nieuwe stap toe en deprecate de oude.
 */

/* -------------------------------------------------------------------------- */
/*  Personalisatie-context (L1)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Read-model van de intake dat een plan personaliseert. Puur afgeleid uit de
 * intake; bevat geen PII (geen naam/e-mail). Dit is de input voor het evalueren
 * van een `PlanCondition`.
 */
export interface PlanIntakeContext {
  primaryTheme: MeasuredPillarId;
  secondaryTheme: MeasuredPillarId | null;
  scores: DomainScores;
  profileName: ProfileLabel["name"];
  signals: DeficiencySignals;
  answers: Record<QuestionId, number>;
}

/**
 * Declaratieve voorwaarde voor het tonen van een stap. Serialiseerbaar zodat
 * hetzelfde template naar PDF/e-mail/n8n kan en in tests deterministisch is.
 * Een aparte evaluator (lib, latere stap) interpreteert dit tegen een
 * `PlanIntakeContext`.
 */
export type PlanCondition =
  | { type: "always" }
  | { type: "signal"; signal: keyof DeficiencySignals }
  | { type: "scoreBelow"; domain: MeasuredPillarId; value: number }
  | { type: "profileIs"; profile: ProfileLabel["name"] }
  | { type: "answerAtMost"; question: QuestionId; value: number }
  | { type: "answerAtLeast"; question: QuestionId; value: number }
  | { type: "answerEquals"; question: QuestionId; value: number };

/* -------------------------------------------------------------------------- */
/*  Template (de content)                                                     */
/* -------------------------------------------------------------------------- */

/** Tekstblok; losgekoppeld van weergave. `body` mag alinea's via `\n\n`. */
export interface PlanContentBlock {
  heading?: string;
  /** NL-copy. */
  body: string;
  /** Bron/onderbouwing — sluit aan op de Consumentenbond-positionering. */
  source?: string;
}

export type PlanStepLinkKind = "guide" | "comparison" | "article" | "kennisbank";

/** Link bij een stap. `kind` stuurt rel/affiliate-attributen in de render. */
export interface PlanStepLink {
  label: string;
  href: string;
  kind: PlanStepLinkKind;
}

/** Tijdshorizon van een fase — sluit aan op quickWins (nu) vs longTerm (12 wk). */
export type PlanPhaseHorizon = "deze-week" | "week-2-4" | "week-4-12";

/** Eén concrete, afvinkbare gedragsstap. Principe: één stap = één gedrag. */
export interface PlanStep {
  /** Stabiel, uniek binnen het template. Sleutel in `PlanProgress` + events. */
  id: string;
  /** NL UI-string, imperatief geformuleerd ("Leg je telefoon om 22:00 weg"). */
  title: string;
  /** Het "waarom" (mechanisme) achter de stap. */
  rationale?: PlanContentBlock;
  link?: PlanStepLink;
  /** Conditionele weergave (L1). Afwezig = altijd tonen. */
  showWhen?: PlanCondition;
  /** Vrije tags voor n8n-routing / coach-filtering. */
  tags?: readonly string[];
}

/** Eén fase: een handvol stappen binnen één tijdshorizon. */
export interface PlanPhase {
  /** Stabiel, uniek binnen het template. Sleutel in events + voortgang. */
  id: string;
  horizon: PlanPhaseHorizon;
  title: string;
  intro?: PlanContentBlock;
  steps: PlanStep[];
}

/** Het sjabloon dat jij/Cursor schrijft — één per primair domein. */
export interface LifestylePlanTemplate {
  /** Primaire domein (= laagste gemeten pijler) waar dit plan bij hoort. */
  domain: MeasuredPillarId;
  /** Gekoppelde gids-thema (PDF/opt-in); null = plan zonder downloadbare gids. */
  guideThema: GuideThema | null;
  /** Inhoudsversie; bump bij wijziging (audittrail + cache-invalidatie). */
  version: string;
  title: string;
  /** Herkenning bovenaan ("dit ben ik"). */
  recognition: PlanContentBlock;
  /** Mechanisme ("waarom na 40"). */
  mechanism: PlanContentBlock;
  phases: PlanPhase[];
  /** Verplichte medische grens — advies, geen diagnose. */
  medicalBoundary: PlanContentBlock;
}

/* -------------------------------------------------------------------------- */
/*  Voortgang (de pseudonieme staat — leeft in Supabase)                      */
/* -------------------------------------------------------------------------- */

export type PlanStepState = "todo" | "doing" | "done" | "skipped";

export interface PlanStepProgress {
  stepId: string;
  state: PlanStepState;
  /** ISO 8601; tijdstip van laatste statuswijziging. */
  updatedAt: string;
}

/**
 * Voortgang van één gebruiker op één domein-plan.
 *
 * Identiteit is pseudoniem: `sessionId` = de ondertekende intake-sessie
 * (httpOnly-cookie), geen PII. Bij intrekken/anonimiseren wordt deze koppeling
 * losgemaakt via dezelfde revoke-flow als de intake-sessie.
 */
export interface PlanProgress {
  /** Pseudonieme sleutel = ondertekende intake-sessie. */
  sessionId: string;
  /** Multi-tenant / B2B-scoping (RLS). */
  organizationId: string;
  domain: MeasuredPillarId;
  /** Template-versie die deze voortgang volgde. */
  templateVersion: string;
  currentPhaseId: string;
  /** Per `stepId` de actuele staat. */
  steps: Record<string, PlanStepProgress>;
  startedAt: string;
  updatedAt: string;
  /** Gezet zodra alle (zichtbare) stappen `done`/`skipped` zijn. */
  completedAt: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Coach-laag (B2B, L3) — future-ready, leeg bij self-serve                  */
/* -------------------------------------------------------------------------- */

/** Coach-overlay bovenop het template; afwezig/leeg bij thuisgebruik. */
export interface PlanCoachOverlay {
  organizationId: string;
  sessionId: string;
  /** Stappen die de coach voor deze cliënt heeft uitgezet. */
  disabledStepIds: readonly string[];
  /** Door de coach toegevoegde stappen, buiten het template om. */
  addedSteps: PlanStep[];
  /** Vrije notitie per fase (`phaseId` -> tekst). */
  phaseNotes: Record<string, string>;
}
