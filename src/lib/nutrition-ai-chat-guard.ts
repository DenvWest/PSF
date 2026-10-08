import { consumeRateLimit } from "@/lib/rate-limit";
import { isNutritionAiChatEnabled } from "@/lib/feature-flags";

/**
 * Kosten- en misbruikgrenzen voor het chatvenster (V6). Het maandbudget zelf
 * staat in de console van de provider (Dennis); dit zijn de grenzen in de app.
 * Aanmelding is verplicht, dus geen Turnstile: de ingang is een account.
 */
export const AI_CHAT_LIMITS = {
  maxTurns: 20,
  maxCharsPerTurn: 500,
  maxCharsPerConversation: 6000,
  perAccount: { limit: 30, windowMs: 60 * 60 * 1000 },
} as const;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatGuardDenial =
  | "disabled"
  | "too_many_turns"
  | "turn_too_long"
  | "conversation_too_long"
  | "rate_limited";

export type ChatGuardResult =
  | { ok: true }
  | { ok: false; reason: ChatGuardDenial; retryAfterSeconds?: number };

export function checkChatShape(turns: readonly ChatTurn[]): ChatGuardResult {
  const userTurns = turns.filter((turn) => turn.role === "user");
  if (userTurns.length > AI_CHAT_LIMITS.maxTurns) {
    return { ok: false, reason: "too_many_turns" };
  }
  if (userTurns.some((turn) => turn.content.length > AI_CHAT_LIMITS.maxCharsPerTurn)) {
    return { ok: false, reason: "turn_too_long" };
  }
  const total = turns.reduce((sum, turn) => sum + turn.content.length, 0);
  if (total > AI_CHAT_LIMITS.maxCharsPerConversation) {
    return { ok: false, reason: "conversation_too_long" };
  }
  return { ok: true };
}

export async function checkChatAllowed(
  accountId: string,
  turns: readonly ChatTurn[],
): Promise<ChatGuardResult> {
  if (!isNutritionAiChatEnabled()) {
    return { ok: false, reason: "disabled" };
  }
  const shape = checkChatShape(turns);
  if (!shape.ok) {
    return shape;
  }
  const limited = await consumeRateLimit(`ai-chat:${accountId}`, AI_CHAT_LIMITS.perAccount);
  if (!limited.allowed) {
    return { ok: false, reason: "rate_limited", retryAfterSeconds: limited.retryAfterSeconds };
  }
  return { ok: true };
}
