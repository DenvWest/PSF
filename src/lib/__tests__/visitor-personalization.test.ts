import { describe, expect, it } from "vitest";
import { derivePersonalization } from "@/lib/visitor-personalization";

describe("derivePersonalization", () => {
  it("kiest het laagste domein als prioriteit en geeft profileLabel door", () => {
    const result = derivePersonalization(
      { slaap: 40, energie: 70, stress: 60, voeding: 65, beweging: 75, herstel: 80,
    verbinding: 80 },
      "Onrustige Slaper",
    );
    // Slaap scoort het laagst maar is verborgen (`zichtbare-domeinen.ts`), dus
    // voeding wint als laagste zichtbare interventiedomein.
    expect(result.priorityPillarId).toBe("voeding");
    expect(result.priorityLabel).toBe("Voeding");
    expect(result.orderedPillarIds[0]).toBe("voeding");
    expect(result.profileLabel).toBe("Onrustige Slaper");
  });

  it("geeft null door als er geen profileLabel is", () => {
    const result = derivePersonalization(
      { slaap: 70, energie: 40, stress: 60, voeding: 65, beweging: 75, herstel: 80,
    verbinding: 80 },
      null,
    );
    // Stress heeft hier de laagste zichtbare score niet meer nodig: het domein
    // is uit de interface, dus energie wint. Zie `zichtbare-domeinen.ts`.
    expect(result.priorityPillarId).toBe("voeding");
    expect(result.profileLabel).toBeNull();
  });
});
