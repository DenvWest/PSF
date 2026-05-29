import { describe, expect, it } from "vitest";
import {
  computeCompositeScore,
  passesSafetyFilter,
} from "@/lib/content/intervention-scoring";

describe("intervention scoring", () => {
  it("computes composite as (mech × ond × veil) / moeite", () => {
    expect(
      computeCompositeScore({
        scoreMoeite: 2,
        scoreMechanisme: 4,
        scoreOnderbouwing: 5,
        scoreVeiligheid: 4,
      }),
    ).toBe(40);
  });

  it("filters interventions with veiligheid below 4", () => {
    expect(
      passesSafetyFilter({
        scoreMoeite: 1,
        scoreMechanisme: 5,
        scoreOnderbouwing: 5,
        scoreVeiligheid: 3,
      }),
    ).toBe(false);
    expect(
      computeCompositeScore({
        scoreMoeite: 1,
        scoreMechanisme: 5,
        scoreOnderbouwing: 5,
        scoreVeiligheid: 3,
      }),
    ).toBe(0);
  });
});
