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
  | "medicatie"
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
  startTime?: string;
  endTime?: string;
  status?: AgendaBlockStatus;
};
