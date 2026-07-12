"use client";

import { useState } from "react";
import { ContractCard } from "@/components/partnerdesk/ContractCard";
import { ContractForm } from "@/components/partnerdesk/ContractForm";
import type { PdCommissionRule, PdContract, PdDocument } from "@/types/partnerdesk";

export function ContractsSection({
  partnerId,
  slug,
  today,
  contracts,
  rules,
  documents,
}: {
  partnerId: string;
  slug: string;
  today: string;
  contracts: PdContract[];
  rules: PdCommissionRule[];
  documents: PdDocument[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {contracts.length === 0 && !adding && (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen contracten.</p>
      )}

      {contracts.map((c) => (
        <ContractCard
          key={c.id}
          contract={c}
          documents={documents.filter((d) => d.contract_id === c.id)}
          ruleCount={rules.filter((r) => r.contract_id === c.id).length}
          partnerId={partnerId}
          slug={slug}
          today={today}
        />
      ))}

      {adding ? (
        <ContractForm partnerId={partnerId} slug={slug} onDone={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg border border-[var(--ps-border)] px-3.5 py-2 text-sm font-medium text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
        >
          + Contract
        </button>
      )}
    </div>
  );
}
