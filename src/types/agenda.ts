import type { DashboardIconName, PillarId } from "@/types/dashboard";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";

export type AgendaBlockSource =
  | "routine"
  | "analysis"
  | "external:google_calendar"
  | "external:apple_calendar"
  | "external:outlook"
  | "external:apple_health"
  | "external:google_fit"
  | "external:garmin"
  | "external:fitbit"
  | "external:oura"
  | "external:whoop";

export type AgendaBlockStatus = "open" | "done";

export type AgendaCategoryId =
  | "slaap"
  | "stress"
  | "voeding"
  | "beweging"
  | "verbinding"
  | "supplementen"
  | "water"
  | "werk"
  | "ontspanning"
  | "persoonlijke_routine";

export type AgendaCategoryDef = {
  id: AgendaCategoryId;
  label: string;
  color: string;
  icon: DashboardIconName;
  selectable: boolean;
  pillarId?: PillarId;
};

export type AgendaBlockRecord = {
  id: string;
  date: string;
  categoryId: AgendaCategoryId;
  title: string;
  startTime: string;
  endTime: string;
  source: AgendaBlockSource;
  status: AgendaBlockStatus;
  externalProvider: string | null;
  externalRef: string | null;
  deletedAt?: string | null;
};

export type TimelineBlockKind = "analysis" | "routine" | "external";

export type TimelineBlock = {
  id: string;
  kind: TimelineBlockKind;
  categoryId: AgendaCategoryId;
  title: string;
  startTime: string;
  endTime: string;
  done: boolean;
  source: AgendaBlockSource;
  isEditable: boolean;
  slot?: WeekDaySlot;
  domain?: PillarId;
  durationLabel?: string;
};

export type CreateAgendaBlockInput = {
  date: string;
  categoryId: AgendaCategoryId;
  title: string;
  startTime: string;
  endTime: string;
};

export type UpdateAgendaBlockInput = {
  title?: string;
  /** Verplaatsen naar een andere dag; alleen eigen (routine) momenten. */
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: AgendaBlockStatus;
};

/** Eén regel in de maandweergave (tijd + titel + kleur). */
export type AgendaMonthDayItem = {
  startTime: string;
  title: string;
  color: string;
};
