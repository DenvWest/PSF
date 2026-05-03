export type ThemaNurtureDay = 1 | 3 | 7;

export interface ThemaNurtureTemplate {
  subject: string;
  html: (unsubscribeUrl: string) => string;
}
