import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_TYPES, isDomainEventType } from "@/lib/events";

describe("isDomainEventType", () => {
  it("accepts known event types", () => {
    for (const type of DOMAIN_EVENT_TYPES) {
      expect(isDomainEventType(type)).toBe(true);
    }
  });

  it("rejects unknown types", () => {
    expect(isDomainEventType("intake.unknown")).toBe(false);
    expect(isDomainEventType("")).toBe(false);
  });

  it("accepts evidence.chat_queried", () => {
    expect(isDomainEventType("evidence.chat_queried")).toBe(true);
  });

  it("accepts remeasure.completed", () => {
    expect(isDomainEventType("remeasure.completed")).toBe(true);
  });
});
