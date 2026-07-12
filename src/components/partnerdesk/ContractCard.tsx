"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ContractForm } from "@/components/partnerdesk/ContractForm";
import {
  cancelDeadlineSeverity,
  contractStatus,
  daysUntil,
  expirySeverity,
} from "@/lib/partnerdesk/contract-status";
import { formatNlDay } from "@/lib/partnerdesk/format";
import {
  archiveContractAction,
  deleteDocumentAction,
  getDocumentUrlAction,
  uploadDocumentAction,
} from "@/lib/partnerdesk/contract-actions";
import type { PdContract, PdDocument } from "@/types/partnerdesk";

const SEV_CLASS: Record<"red" | "amber", string> = {
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
};

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "red" | "amber" }) {
  const cls =
    tone === "green"
      ? "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]"
      : tone === "red"
        ? SEV_CLASS.red
        : tone === "amber"
          ? SEV_CLASS.amber
          : "bg-[var(--ps-bg)] text-[var(--ps-body)]";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <div className="text-xs text-[var(--ps-muted)]">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function ContractCard({
  contract,
  documents,
  ruleCount,
  partnerId,
  slug,
  today,
}: {
  contract: PdContract;
  documents: PdDocument[];
  ruleCount: number;
  partnerId: string;
  slug: string;
  today: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const status = contractStatus(contract.starts_on, contract.ends_on, today);
  const expiry = status === "active" ? expirySeverity(contract.ends_on, today) : null;
  const cancelSev = cancelDeadlineSeverity(contract.cancel_by, today);
  const expiryDays = daysUntil(contract.ends_on, today);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      router.refresh();
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("partnerId", partnerId);
    fd.set("contractId", contract.id);
    fd.set("kind", "contract");
    fd.set("slug", slug);
    run(() => uploadDocumentAction(fd));
    if (fileRef.current) fileRef.current.value = "";
  }

  function openDoc(path: string) {
    startTransition(async () => {
      const result = await getDocumentUrlAction({ storagePath: path });
      if (result.ok) window.open(result.data.url, "_blank", "noopener");
      else setError(result.error);
    });
  }

  if (editing) {
    return (
      <ContractForm
        partnerId={partnerId}
        slug={slug}
        existing={contract}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-medium">{contract.number}</span>
        {status === "concept" && <Badge>Concept</Badge>}
        {status === "expired" && <Badge tone="red">Verlopen</Badge>}
        {status === "active" && !expiry && <Badge tone="green">Actief</Badge>}
        {status === "active" && expiry && (
          <Badge tone={expiry}>Verloopt over {expiryDays} dgn</Badge>
        )}
        {cancelSev && (
          <Badge tone={cancelSev}>Opzeggen vóór {formatNlDay(contract.cancel_by)}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Fact label="Looptijd">
          {formatNlDay(contract.starts_on)} – {contract.ends_on ? formatNlDay(contract.ends_on) : "onbepaald"}
        </Fact>
        <Fact label="Opzegdeadline">
          {contract.cancel_by ? formatNlDay(contract.cancel_by) : "—"}
        </Fact>
        <Fact label="Cookieduur">
          {contract.cookie_days != null ? `${contract.cookie_days} dgn` : "—"}
        </Fact>
        <Fact label="Exclusiviteit">{contract.exclusivity ?? "—"}</Fact>
        <Fact label="Verlengt">{contract.auto_renews ? "automatisch" : "nee"}</Fact>
        <Fact label="Commissieregels">{ruleCount}</Fact>
      </div>

      {documents.length > 0 && (
        <ul className="mt-3 space-y-1">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => openDoc(d.storage_path)} className="text-[var(--ps-body)] hover:underline">
                📎 {d.title}
              </button>
              <button
                type="button"
                onClick={() =>
                  run(() => deleteDocumentAction({ documentId: d.id, storagePath: d.storage_path, slug }))
                }
                className="text-xs text-[var(--ps-muted)] hover:text-red-600"
                title="Verwijderen"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--ps-body)]">
        <button type="button" onClick={() => setEditing(true)} className="hover:underline">
          Bewerk
        </button>
        <label className="cursor-pointer hover:underline">
          PDF toevoegen
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={onUpload}
            disabled={pending}
            className="hidden"
          />
        </label>
        <button
          type="button"
          className="ml-auto hover:underline"
          onClick={() => {
            if (window.confirm("Contract archiveren?")) {
              run(() => archiveContractAction({ contractId: contract.id, partnerId, slug }));
            }
          }}
        >
          Archiveer
        </button>
      </div>
    </div>
  );
}
