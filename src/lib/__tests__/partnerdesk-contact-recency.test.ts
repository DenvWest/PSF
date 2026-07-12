import { describe, it, expect } from "vitest";
import {
  isStaleContact,
  lastContactLabel,
} from "@/lib/partnerdesk/contact-recency";

const NOW = "2026-07-12";

describe("isStaleContact", () => {
  it("is niet verouderd zonder gelogd contact (neutraal, geen ruis)", () => {
    expect(isStaleContact(null, NOW)).toBe(false);
  });

  it("is niet verouderd binnen 90 dagen", () => {
    expect(isStaleContact("2026-06-01", NOW)).toBe(false);
    expect(isStaleContact("2026-04-13", NOW)).toBe(false); // exact 90 dgn
  });

  it("is verouderd na 90 dagen", () => {
    expect(isStaleContact("2026-04-12", NOW)).toBe(true); // 91 dgn
    expect(isStaleContact("2026-01-01", NOW)).toBe(true);
  });
});

describe("lastContactLabel", () => {
  it("beschrijft de recentheid in het Nederlands", () => {
    expect(lastContactLabel(null, NOW)).toBe("geen contact gelogd");
    expect(lastContactLabel("2026-07-12", NOW)).toBe("vandaag");
    expect(lastContactLabel("2026-07-11", NOW)).toBe("gisteren");
    expect(lastContactLabel("2026-06-30", NOW)).toBe("12 dgn geleden");
  });
});
