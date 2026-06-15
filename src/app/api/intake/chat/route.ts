import { NextRequest, NextResponse } from "next/server";
import {
  createInitialChatState,
  processUserResponse,
  type ChatIntakeState,
} from "@/lib/chat-intake";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

export const dynamic = "force-dynamic";

interface ChatRequest {
  state?: ChatIntakeState;
  message?: string;
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/chat][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_chat",
    clientIp,
    getRateLimitConfig("intake_chat"),
  );

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.state && !body.message) {
    const initialState = createInitialChatState();
    return NextResponse.json({
      state: initialState,
      messages: initialState.messages.filter((m) => m.role !== "system"),
    });
  }

  if (!body.state || !body.message) {
    return NextResponse.json(
      { error: "Both state and message are required for conversation" },
      { status: 400 },
    );
  }

  const updatedState = processUserResponse(body.state, body.message);

  return NextResponse.json({
    state: updatedState,
    messages: updatedState.messages.filter((m) => m.role !== "system"),
    complete: updatedState.phase === "complete",
    results: updatedState.results ?? null,
  });
}
