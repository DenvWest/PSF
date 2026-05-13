import { NextResponse } from "next/server";
import {
  createInitialChatState,
  processUserResponse,
  type ChatIntakeState,
} from "@/lib/chat-intake";

export const dynamic = "force-dynamic";

interface ChatRequest {
  state?: ChatIntakeState;
  message?: string;
}

export async function POST(request: Request) {
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
