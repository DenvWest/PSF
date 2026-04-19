export type AdminDashboardStats = {
  totalSessions: number;
  sessionsWeekDelta: number;
  uniqueEmails: number;
  remindersSent: number;
  avgTotalScore: number | null;
};

export type AdminProfileSlice = {
  name: string;
  value: number;
};

export type AdminDomainAverage = {
  id: string;
  label: string;
  average: number;
  color: string;
};

export type AdminAgeBucket = {
  range: string;
  count: number;
};

export type AdminFeedbackRow = {
  rating: string;
  comment: string | null;
  createdAt: string;
};

export type AdminSessionRow = {
  createdAt: string;
  ageRange: string | null;
  profileLabel: string | null;
  totalScore: number | null;
  urgency: string | null;
};

export type AdminNurtureStats = {
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
};

export type AdminNurtureRecentRow = {
  emailMasked: string;
  sequenceDay: number;
  status: string;
  scheduledAt: string;
};

export type AdminNurtureSequenceSent = {
  sequenceDay: number;
  sent: number;
};

export type AdminNurtureDay30Conversion = {
  day30Sent: number;
  repeatIntakeAfterMail: number;
  /** Aandeel dag-30-mails waarna opnieuw een intake-sessie met hetzelfde adres werd gestart. */
  conversionRate: number | null;
};

export type AdminNurtureSection = {
  stats: AdminNurtureStats;
  recent: AdminNurtureRecentRow[];
  sequenceSent: AdminNurtureSequenceSent[];
  day30Conversion: AdminNurtureDay30Conversion;
};

export type AdminDashboardPayload = {
  stats: AdminDashboardStats;
  profileDistribution: AdminProfileSlice[];
  domainAverages: AdminDomainAverage[];
  ageDistribution: AdminAgeBucket[];
  recentFeedback: AdminFeedbackRow[];
  recentSessions: AdminSessionRow[];
  nurture: AdminNurtureSection | null;
};
