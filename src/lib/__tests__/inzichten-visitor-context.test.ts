import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInzichtenVisitorContext } from "@/lib/inzichten-visitor-context";
import type { DashboardData } from "@/types/dashboard";

const { mockGetAccountFromCookie, mockLoadAccountDashboardData } = vi.hoisted(
  () => ({
    mockGetAccountFromCookie: vi.fn(),
    mockLoadAccountDashboardData: vi.fn(),
  }),
);

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccountFromCookie,
}));
vi.mock("@/lib/account-dashboard", () => ({
  loadAccountDashboardData: mockLoadAccountDashboardData,
}));

const DEV_ANSWERS: Record<string, number> = {
  SLP_QUAL: 3,
  SLP_CONS: 2,
  SLP_ONSET: 3,
  SLP_WAKE: 3,
  NRG_PATN: 3,
  NRG_DEP: 4,
  STR_FREQ: 2,
  STR_RCV: 2,
  NUT_O3: 1,
  NUT_PROT: 2,
  MOV_STR: 4,
  MOV_CARD: 4,
  RCV_PHYS: 2,
};

const EMPTY_DASHBOARD: DashboardData = {
  empty: true,
  current: null,
  prev: null,
  history: [],
  retest: false,
  nutritionIntake: null,
  movementRecoveryTrend: [],
  movementRcvFeel: null,
  movementRcvFeelAt: null,
  remeasure: null,
  deltaReport: null,
  profileLabel: null,
  firstName: null,
  answers: null,
  sessionId: null,
  planProgress: null,
  movementPlanProgress: null,
  planDomain: null,
  priorityPref: null,
  sleepCheckinFocus: null,
  movementPrefs: { startPattern: null, anchor: null },
};

const DASHBOARD_WITH_DATA: DashboardData = {
  empty: false,
  current: {
    scores: {
      slaap: 40,
      energie: 70,
      stress: 60,
      voeding: 65,
      beweging: 75,
      herstel: 80,
      verbinding: 80,
    },
    vitality: 62,
    date: "10 jun 2026",
    trend: {
      slaap: [40],
      energie: [70],
      stress: [60],
      voeding: [65],
      beweging: [75],
      herstel: [80],
      verbinding: [80],
    },
  },
  prev: null,
  history: [],
  retest: false,
  nutritionIntake: null,
  movementRecoveryTrend: [],
  movementRcvFeel: null,
  movementRcvFeelAt: null,
  remeasure: null,
  deltaReport: null,
  profileLabel: "Onrustige Slaper",
  firstName: "Dennis",
  answers: null,
  sessionId: "session-1",
  planProgress: null,
  movementPlanProgress: null,
  planDomain: "sleep",
  priorityPref: null,
  sleepCheckinFocus: null,
  movementPrefs: { startPattern: null, anchor: null },
};

const DASHBOARD_WITH_ANSWERS: DashboardData = {
  ...DASHBOARD_WITH_DATA,
  answers: DEV_ANSWERS,
};

beforeEach(() => {
  mockGetAccountFromCookie.mockReset();
  mockLoadAccountDashboardData.mockReset();
});

describe("getInzichtenVisitorContext", () => {
  it("geeft null zonder account", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    const result = await getInzichtenVisitorContext();
    expect(result).toBeNull();
    expect(mockLoadAccountDashboardData).not.toHaveBeenCalled();
  });

  it("geeft null als dashboard leeg is", async () => {
    mockGetAccountFromCookie.mockResolvedValue({
      id: "acc-1",
      email: "a@b.nl",
      status: "active",
    });
    mockLoadAccountDashboardData.mockResolvedValue(EMPTY_DASHBOARD);
    const result = await getInzichtenVisitorContext();
    expect(result).toBeNull();
  });

  it("geeft prioriteit, volgorde en profileLabel bij een gevulde dashboard", async () => {
    mockGetAccountFromCookie.mockResolvedValue({
      id: "acc-1",
      email: "a@b.nl",
      status: "active",
    });
    mockLoadAccountDashboardData.mockResolvedValue(DASHBOARD_WITH_DATA);
    const result = await getInzichtenVisitorContext();
    expect(result).not.toBeNull();
    expect(result?.priorityPillarId).toBe("slaap");
    expect(result?.priorityLabel).toBe("Slaap");
    expect(result?.orderedPillarIds[0]).toBe("slaap");
    expect(result?.profileLabel).toBe("Onrustige Slaper");
    expect(result?.gapSignals).toBeNull();
    expect(result?.activePlan).toBeNull();
  });

  it("geeft gapSignals en activePlan bij answers", async () => {
    mockGetAccountFromCookie.mockResolvedValue({
      id: "acc-1",
      email: "a@b.nl",
      status: "active",
    });
    mockLoadAccountDashboardData.mockResolvedValue(DASHBOARD_WITH_ANSWERS);
    const result = await getInzichtenVisitorContext();
    expect(result).not.toBeNull();
    expect(result?.gapSignals).not.toBeNull();
    expect(typeof result?.gapSignals?.protein_gap_signal).toBe("boolean");
    expect(result?.activePlan).not.toBeNull();
    expect(result?.activePlan?.planHref).toMatch(/^\/intake\/plan\//);
    expect(result?.activePlan?.stepTitle.length).toBeGreaterThan(0);
  });
});
