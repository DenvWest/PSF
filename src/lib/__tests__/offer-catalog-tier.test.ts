import { describe, expect, it } from "vitest";
import {
  SERVICE_REFERRAL_OFFERS,
  SUPPLEMENT_CATALOG,
} from "@/data/supplement-catalog";
import { calcDomainScores } from "@/lib/intake-engine";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import {
  getPillarRecommendation,
  getRecommendations,
} from "@/lib/recommendation-engine";

const REFERRAL_ID = "slaap-coaching-referral";

describe("offer catalog tier typing", () => {
  it("assigns tier 3 to every SUPPLEMENT_CATALOG entry", () => {
    for (const entry of SUPPLEMENT_CATALOG) {
      expect(entry.tier).toBe(3);
    }
  });

  it("defines tier-4 service referral without affiliate URL markers", () => {
    const offer = SERVICE_REFERRAL_OFFERS[0];
    expect(offer.tier).toBe(4);
    expect(offer.externalProviderUrl).not.toContain("sld=");
    expect(offer.externalProviderUrl).not.toContain("ws=");
  });
});

describe("service referral isolation from recommendation engine", () => {
  it("never surfaces slaap-coaching-referral via route, hub, or pillar sources", () => {
    const answers = {
      SLP_QUAL: 1,
      SLP_CONS: 1,
      SLP_ONSET: 1,
      SLP_WAKE: 1,
      NRG_PATN: 1,
      NRG_DEP: 1,
      STR_FREQ: 1,
      STR_RCV: 1,
      NUT_O3: 1,
      NUT_PROT: 1,
      MOV_STR: 1,
      MOV_CARD: 1,
      RCV_PHYS: 1,
      LIF_ALC: 2,
      LIF_SUN: 2,
    };
    const input = buildRecommendationInput({
      scores: calcDomainScores(answers),
      answers,
    });

    const routeIds = getRecommendations(input, { source: "route" }).map(
      (item) => item.supplementId,
    );
    const hubIds = getRecommendations(input, { source: "hub" }).map(
      (item) => item.supplementId,
    );
    const pillarIds = (["slaap", "voeding"] as const)
      .map((pillarId) => getPillarRecommendation(input, pillarId)?.supplementId)
      .filter(Boolean);

    for (const ids of [routeIds, hubIds, pillarIds]) {
      expect(ids).not.toContain(REFERRAL_ID);
    }
  });
});
