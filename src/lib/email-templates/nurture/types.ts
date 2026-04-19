export interface NurtureEmailData {
  profileLabel: string;
  primaryDomain: string;
  domainScores: Record<string, number>;
  sequenceDay: number;
}

export type NurtureEmailDispatchContext = {
  recipientEmail: string;
  sessionId?: string | null;
};
