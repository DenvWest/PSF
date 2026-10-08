import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AI_CHAT_LIMITS,
  checkChatAllowed,
  checkChatShape,
  type ChatTurn,
} from "@/lib/nutrition-ai-chat-guard";
import { resetRateLimitBackendForTests } from "@/lib/rate-limit";

const user = (content: string): ChatTurn => ({ role: "user", content });

describe("nutrition-ai-chat-guard", () => {
  beforeEach(() => {
    resetRateLimitBackendForTests();
    delete process.env.NUTRITION_AI_CHAT_ENABLED;
  });
  afterEach(() => {
    delete process.env.NUTRITION_AI_CHAT_ENABLED;
  });

  it("weigert alles zolang de vlag uit staat", async () => {
    expect(await checkChatAllowed("acc-1", [user("ontbijt")])).toEqual({
      ok: false,
      reason: "disabled",
    });
  });

  it("weigert te veel beurten, een te lange beurt en een te lang gesprek", () => {
    const veel = Array.from({ length: AI_CHAT_LIMITS.maxTurns + 1 }, () => user("x"));
    expect(checkChatShape(veel)).toMatchObject({ ok: false, reason: "too_many_turns" });
    expect(checkChatShape([user("x".repeat(AI_CHAT_LIMITS.maxCharsPerTurn + 1))])).toMatchObject({
      ok: false,
      reason: "turn_too_long",
    });
    const lang: ChatTurn[] = [
      { role: "assistant", content: "y".repeat(AI_CHAT_LIMITS.maxCharsPerConversation) },
      user("hallo"),
    ];
    expect(checkChatShape(lang)).toMatchObject({ ok: false, reason: "conversation_too_long" });
  });

  it("begrenst per account per uur", async () => {
    process.env.NUTRITION_AI_CHAT_ENABLED = "true";
    for (let i = 0; i < AI_CHAT_LIMITS.perAccount.limit; i += 1) {
      expect((await checkChatAllowed("acc-2", [user("ontbijt")])).ok).toBe(true);
    }
    expect(await checkChatAllowed("acc-2", [user("ontbijt")])).toMatchObject({
      ok: false,
      reason: "rate_limited",
    });
    expect((await checkChatAllowed("acc-3", [user("ontbijt")])).ok).toBe(true);
  });
});
