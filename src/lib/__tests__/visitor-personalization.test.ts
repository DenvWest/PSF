import { describe, expect, it } from "vitest";
import { derivePersonalization } from "@/lib/visitor-personalization";

describe("derivePersonalization", () => {
  it("kiest het laagste domein als prioriteit en geeft profileLabel door", () => {
    const result = derivePersonalization(
      { slaap: 40, energie: 70, stress: 60, voeding: 65, beweging: 75, herstel: 80 },
      "Onrustige Slaper",
    );
    expect(result.priorityPillarId).toBe("slaap");
    expect(result.priorityLabel).toBe("Slaap");
    expect(result.orderedPillarIds[0]).toBe("slaap");
    expect(result.profileLabel).toBe("Onrustige Slaper");
  });

  it("geeft null door als er geen profileLabel is", () => {
    const result = derivePersonalization(
      { slaap: 70, energie: 40, stress: 60, voeding: 65, beweging: 75, herstel: 80 },
      null,
    );
    expect(result.priorityPillarId).toBe("energie");
    expect(result.profileLabel).toBeNull();
  });
});
