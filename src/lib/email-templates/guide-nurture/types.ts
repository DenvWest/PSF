import type { GuideThema } from "@/types/guide-opt-in";

export const GUIDE_SEQUENCE_DAYS = [0, 3, 7, 14, 21, 30] as const;

export type GuideNurtureDay = (typeof GUIDE_SEQUENCE_DAYS)[number];

export interface GuideNurtureTemplate {
  subject: string;
  html: (unsubscribeUrl: string) => string;
}

export interface GuideThemaEmailMeta {
  thema: GuideThema;
  guideName: string;
  pillarHref: string;
  pdfPath: string | null;
}
