export interface NurtureEmailData {
  profileLabel: string;
  primaryDomain: string;
  domainScores: Record<string, number>;
  sequenceDay: number;
  urgencyLevel?: string;
  /** Optioneel; voor persoonlijke aanhef in mail (voornaam). */
  firstName?: string | null;
}

export type NurtureEmailDispatchContext = {
  recipientEmail: string;
  sessionId?: string | null;
  /** Recovery-URL met eenmalige token; fallback naar /intake als niet gezet. */
  recoveryUrl?: string | null;
};
