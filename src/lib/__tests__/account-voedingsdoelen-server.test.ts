import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSessionRows } = vi.hoisted(() => ({
  mockSessionRows: vi.fn(),
}));

vi.mock("@/lib/db/scoped", () => ({
  orgScoped: () => ({
    raw: {},
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => ({ data: mockSessionRows(), error: null }),
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/account-voedingsdoelen", async (importOriginal) => {
  const origineel = await importOriginal<typeof import("@/lib/account-voedingsdoelen")>();
  return {
    ...origineel,
    getVoedingsdoelen: async () => origineel.LEGE_VOEDINGSDOELEN,
  };
});

import { laadVoedingsdoelenWeergave } from "@/lib/account-voedingsdoelen-server";

/** Een check op /intake: geen gewicht, geen leeftijdsband, geen brede-check-antwoorden. */
const VOEDINGSSESSIE = { weight_kg: null, age_range: null, answers: null };

const BREDE_CHECK = { weight_kg: 84, age_range: "45–49", answers: { MOV_STR: 2, MOV_CARD: 1 } };

describe("laadVoedingsdoelenWeergave — welke sessie draagt het gewicht", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gebruikt het gewicht van de brede check", async () => {
    mockSessionRows.mockReturnValue([BREDE_CHECK]);
    const weergave = await laadVoedingsdoelenWeergave("account-1");

    expect(weergave.checkHeeftGewicht).toBe(true);
    expect(weergave.gewichtBron).toBe("check");
    expect(weergave.richtlijn).not.toBeNull();
  });

  it("valt niet terug als de nieuwste sessie een check zonder gewicht is (F1)", async () => {
    mockSessionRows.mockReturnValue([VOEDINGSSESSIE, BREDE_CHECK]);
    const alleenBreed = await (async () => {
      mockSessionRows.mockReturnValueOnce([BREDE_CHECK]);
      return laadVoedingsdoelenWeergave("account-1");
    })();
    const metCheckErboven = await laadVoedingsdoelenWeergave("account-1");

    expect(metCheckErboven.checkHeeftGewicht).toBe(true);
    expect(metCheckErboven.gewichtBron).toBe("check");
    expect(metCheckErboven.richtlijn).toEqual(alleenBreed.richtlijn);
  });

  it("zonder enige sessie met gewicht: geen richtlijn", async () => {
    mockSessionRows.mockReturnValue([VOEDINGSSESSIE]);
    const weergave = await laadVoedingsdoelenWeergave("account-1");

    expect(weergave.checkHeeftGewicht).toBe(false);
    expect(weergave.gewichtBron).toBe("geen");
    expect(weergave.richtlijn).toBeNull();
  });
});
