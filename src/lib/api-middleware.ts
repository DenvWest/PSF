// EXPERIMENTAL: scaffold for future multi-tenant work. Not used by production pages. Do not refactor production routes against this API yet.

import { NextResponse } from "next/server";
import { verifyCronRequest } from "./cron-auth";
import { getDefaultOrganizationId } from "./organization";

export type ApiGroup = "public" | "internal" | "partner";

export interface ApiMiddlewareResult {
  authorized: boolean;
  response?: NextResponse;
  orgId?: string;
}

type PartnerKeyEntry = {
  key: string;
  orgId?: string;
};

export function parsePartnerApiKeys(raw: string): PartnerKeyEntry[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIndex = entry.indexOf(":");
      if (colonIndex === -1) {
        return { key: entry };
      }
      return {
        key: entry.slice(0, colonIndex),
        orgId: entry.slice(colonIndex + 1),
      };
    });
}

export function resolvePartnerOrgId(apiKey: string): string | undefined {
  const entries = parsePartnerApiKeys(process.env.PARTNER_API_KEYS ?? "");
  const match = entries.find((entry) => entry.key === apiKey);
  if (!match) {
    return undefined;
  }
  if (match.orgId) {
    return match.orgId;
  }
  return getDefaultOrganizationId();
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

  const entries = parsePartnerApiKeys(process.env.PARTNER_API_KEYS ?? "");
  const validKeys = entries.map((entry) => entry.key);
  if (!validKeys.includes(apiKey)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 },
      ),
    };
  }

  const orgId = resolvePartnerOrgId(apiKey);
  return { authorized: true, orgId };
}
