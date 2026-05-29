import type { SupabaseClient } from "@supabase/supabase-js";
import type { ThemeSlug } from "@/lib/content/themes";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const EVIDENCE_CHAT_OUT_OF_SCOPE_MESSAGE =
  "Daar heb ik geen gepubliceerde evidence voor in onze database. Stel je vraag anders, of bespreek aanhoudende klachten met je huisarts — dit is geen medisch advies.";

export const EVIDENCE_CHAT_DISCLAIMER =
  "Geen medisch advies. Antwoord uitsluitend op basis van gepubliceerde evidence-claims in PerfectSupplement.";

export type EvidenceCitation = {
  id: string;
  claimText: string;
  domainLabel: string;
  sourceLabel: string;
  sourceUrl: string | null;
};

export type EvidenceChatResult = {
  inScope: boolean;
  answer: string;
  citations: EvidenceCitation[];
  disclaimer: string;
};

type EvidenceClaimRow = {
  id: string;
  claim_text: string;
  domain_label: string;
  source_vancouver: string;
  source_url: string | null;
  rank: number;
};

const VALID_THEME_SLUGS = new Set<string>([
  "sleep",
  "stress",
  "nutrition",
  "movement",
]);

export function normalizeEvidenceQuestion(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (trimmed.length < 3 || trimmed.length > 500) {
    return null;
  }
  return trimmed;
}

export function normalizeThemeDomainLabel(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const slug = raw.trim().toLowerCase();
  if (!VALID_THEME_SLUGS.has(slug)) {
    return null;
  }
  return slug;
}

export function buildEvidenceChatAnswer(citations: EvidenceCitation[]): string {
  if (citations.length === 0) {
    return EVIDENCE_CHAT_OUT_OF_SCOPE_MESSAGE;
  }

  const blocks = citations.map((item, index) => {
    const sourcePart = item.sourceUrl
      ? `${item.sourceLabel} (${item.sourceUrl})`
      : item.sourceLabel;
    return `${index + 1}. ${item.claimText} — Bron: ${sourcePart}`;
  });

  return `Op basis van onze gepubliceerde evidence:\n\n${blocks.join("\n\n")}`;
}

export async function searchPublishedEvidenceClaims(
  question: string,
  options?: {
    organizationId?: string;
    themeSlug?: ThemeSlug | null;
    limit?: number;
  },
): Promise<EvidenceCitation[]> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return [];
  }

  const organizationId = options?.organizationId ?? getDefaultOrganizationId();
  const domainLabel = options?.themeSlug
    ? normalizeThemeDomainLabel(options.themeSlug)
    : null;
  const limit = Math.min(Math.max(options?.limit ?? 5, 1), 10);

  const { data, error } = await admin.rpc("search_evidence_claims", {
    p_organization_id: organizationId,
    p_query: question,
    p_domain_label: domainLabel,
    p_match_count: limit,
  });

  if (error) {
    console.error("[searchPublishedEvidenceClaims] rpc error:", error.message);
    return await searchPublishedEvidenceClaimsFallback(
      admin,
      organizationId,
      question,
      domainLabel,
      limit,
    );
  }

  const rows = (data ?? []) as EvidenceClaimRow[];
  return rows.map((row) => ({
    id: row.id,
    claimText: row.claim_text,
    domainLabel: row.domain_label,
    sourceLabel: row.source_vancouver,
    sourceUrl: row.source_url,
  }));
}

async function searchPublishedEvidenceClaimsFallback(
  admin: SupabaseClient,
  organizationId: string,
  question: string,
  domainLabel: string | null,
  limit: number,
): Promise<EvidenceCitation[]> {
  const pattern = `%${question.slice(0, 80).replace(/%/g, "")}%`;
  let query = admin
    .from("evidence_claims")
    .select(
      "id, claim_text, domain_label, evidence_sources ( vancouver, url )",
    )
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .ilike("claim_text", pattern)
    .limit(limit);

  if (domainLabel) {
    query = query.eq("domain_label", domainLabel);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    if (error) {
      console.error(
        "[searchPublishedEvidenceClaimsFallback] error:",
        error.message,
      );
    }
    return [];
  }

  return data.map((row) => {
    const source = row.evidence_sources as
      | { vancouver: string; url: string | null }
      | { vancouver: string; url: string | null }[]
      | null;
    const sourceRow = Array.isArray(source) ? source[0] : source;
    return {
      id: row.id as string,
      claimText: row.claim_text as string,
      domainLabel: row.domain_label as string,
      sourceLabel: sourceRow?.vancouver ?? "Bron",
      sourceUrl: sourceRow?.url ?? null,
    };
  });
}

export async function answerEvidenceQuestion(
  question: string,
  options?: {
    organizationId?: string;
    themeSlug?: ThemeSlug | null;
  },
): Promise<EvidenceChatResult> {
  const citations = await searchPublishedEvidenceClaims(question, options);
  const inScope = citations.length > 0;

  return {
    inScope,
    answer: buildEvidenceChatAnswer(citations),
    citations,
    disclaimer: EVIDENCE_CHAT_DISCLAIMER,
  };
}
