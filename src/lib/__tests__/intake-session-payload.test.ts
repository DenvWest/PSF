import { describe, expect, it } from "vitest";
import { intakeSessionRowToPayload } from "@/lib/intake-session-payload";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";

const DOMAIN_SCORES = {
  sleep_score: 60,
  energy_score: 55,
  stress_score: 50,
  nutrition_score: 45,
  movement_score: 40,
  recovery_score: 65,
  connection_score: 70,
};

const BROAD_CHECK_ROW = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  symptom_profile: ["moe"],
  answers: { SLP_QUAL: 2 },
  domain_scores: DOMAIN_SCORES,
  urgency_level: "matig",
  profile_label: "Lage Batterij",
  created_at: "2026-09-01T10:00:00.000Z",
  age_range: "40–44",
  gender: "man",
  first_name: null,
};

/**
 * Een rij zoals de check op /intake hem gaat aanmaken
 * (BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.1): alleen id en
 * tijdstip, alle kolommen van de brede check leeg.
 */
const NUTRITION_CHECK_ROW = {
  id: "660e8400-e29b-41d4-a716-446655440000",
  symptom_profile: null,
  answers: null,
  domain_scores: null,
  urgency_level: null,
  profile_label: null,
  created_at: "2026-09-25T10:00:00.000Z",
  age_range: null,
  gender: null,
  first_name: null,
};

describe("intakeSessionRowToPayload", () => {
  it("levert de payload van de brede check", () => {
    const payload = intakeSessionRowToPayload(BROAD_CHECK_ROW);
    expect(payload?.sessionId).toBe(BROAD_CHECK_ROW.id);
    expect(payload?.profile).toBe("Lage Batterij");
    expect(payload?.ageRange).toBe("40–44");
  });

  it("geeft null voor een geanonimiseerde sessie", () => {
    expect(
      intakeSessionRowToPayload({ ...BROAD_CHECK_ROW, profile_label: ANON_PROFILE_LABEL }),
    ).toBeNull();
  });

  it("geeft null voor een sessie zonder brede check — blijft zo na de migratie, want de payload betekent 'brede check'", () => {
    expect(intakeSessionRowToPayload(NUTRITION_CHECK_ROW)).toBeNull();
  });
});
