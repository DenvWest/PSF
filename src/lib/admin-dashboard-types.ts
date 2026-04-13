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

export type AdminDashboardPayload = {
  stats: AdminDashboardStats;
  profileDistribution: AdminProfileSlice[];
  domainAverages: AdminDomainAverage[];
  ageDistribution: AdminAgeBucket[];
  recentFeedback: AdminFeedbackRow[];
  recentSessions: AdminSessionRow[];
};
