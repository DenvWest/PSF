// EXPERIMENTAL: scaffold for future multi-tenant work. Not used by production pages. Do not refactor production routes against this API yet.

import { NextResponse } from "next/server";
import { verifyCronRequest } from "./cron-auth";

export type ApiGroup = "public" | "internal" | "partner";

export interface ApiMiddlewareResult {
  authorized: boolean;
  response?: NextResponse;
  orgId?: string;
}

export function withPublicApi(request: Request): ApiMiddlewareResult {
  const orgId = request.headers.get("x-org-id") ?? undefined;
  return { authorized: true, orgId };
}

export function withInternalApi(request: Request): ApiMiddlewareResult {
  const cronResult = verifyCronRequest(request);
  if (!cronResult.authorized) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: cronResult.error },
        { status: 401 },
      ),
    };
  }
  return { authorized: true };
}

export function withPartnerApi(request: Request): ApiMiddlewareResult {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "API key required" },
        { status: 401 },
      ),
    };
  }

  const validKeys = (process.env.PARTNER_API_KEYS ?? "").split(",").map((k) => k.trim()).filter(Boolean);
  if (!validKeys.includes(apiKey)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 },
      ),
    };
  }

  const orgId = request.headers.get("x-org-id") ?? undefined;
  return { authorized: true, orgId };
}
