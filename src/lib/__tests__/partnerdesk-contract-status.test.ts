import { describe, it, expect } from "vitest";
import {
  cancelDeadlineSeverity,
  contractStatus,
  daysUntil,
  expirySeverity,
} from "@/lib/partnerdesk/contract-status";

const TODAY = "2026-07-12";

describe("contractStatus", () => {
  it("is concept vóór de startdatum", () => {
    expect(contractStatus("2026-08-01", "2026-12-31", TODAY)).toBe("concept");
  });
  it("is actief binnen de looptijd", () => {
    expect(contractStatus("2026-01-01", "2026-12-31", TODAY)).toBe("active");
  });
  it("is actief bij onbepaalde tijd (geen einddatum)", () => {
    expect(contractStatus("2026-01-01", null, TODAY)).toBe("active");
  });
  it("is verlopen na de einddatum", () => {
    expect(contractStatus("2026-01-01", "2026-06-30", TODAY)).toBe("expired");
  });
});

describe("expirySeverity", () => {
  it("is null ruim vóór het einde", () => {
    expect(expirySeverity("2026-09-30", TODAY)).toBeNull(); // 80 dgn
    expect(expirySeverity("2026-09-10", TODAY)).toBeNull(); // 60 dgn
  });
  it("is amber binnen 60 dagen", () => {
    expect(expirySeverity("2026-09-09", TODAY)).toBe("amber"); // 59 dgn
  });
  it("is rood binnen 30 dagen", () => {
    expect(expirySeverity("2026-08-10", TODAY)).toBe("red"); // 29 dgn
  });
  it("is null bij een reeds verlopen contract", () => {
    expect(expirySeverity("2026-07-01", TODAY)).toBeNull();
  });
  it("is null zonder einddatum", () => {
    expect(expirySeverity(null, TODAY)).toBeNull();
  });
});

describe("cancelDeadlineSeverity", () => {
  it("is amber binnen 30 dagen", () => {
    expect(cancelDeadlineSeverity("2026-08-10", TODAY)).toBe("amber"); // 29 dgn
  });
  it("is rood binnen 14 dagen", () => {
    expect(cancelDeadlineSeverity("2026-07-25", TODAY)).toBe("red"); // 13 dgn
  });
  it("is null ruim ervoor", () => {
    expect(cancelDeadlineSeverity("2026-09-01", TODAY)).toBeNull();
  });
});

describe("daysUntil", () => {
  it("telt dagen tot een datum in de toekomst", () => {
    expect(daysUntil("2026-07-19", TODAY)).toBe(7);
  });
  it("is negatief voor het verleden", () => {
    expect(daysUntil("2026-07-05", TODAY)).toBe(-7);
  });
  it("is null zonder datum", () => {
    expect(daysUntil(null, TODAY)).toBeNull();
  });
});
