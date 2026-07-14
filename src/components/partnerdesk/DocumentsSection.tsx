"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { todayIso } from "@/lib/partnerdesk/dates";
import { daysSince } from "@/lib/partnerdesk/dates";
import { formatNlDay } from "@/lib/partnerdesk/format";
import {
  deleteDocumentAction,
  getDocumentUrlAction,
  uploadDocumentAction,
} from "@/lib/partnerdesk/contract-actions";
import type { DocumentKind, PdDocument } from "@/types/partnerdesk";

const IMAGE_KINDS = ["banner", "logo", "screenshot"];
const OUTDATED_KINDS = ["contract", "terms", "manual", "rate_card"];
const KIND_OPTIONS: { value: DocumentKind; label: string }[] = [
  { value: "banner", label: "Banner" },
  { value: "logo", label: "Logo" },
  { value: "screenshot", label: "Screenshot" },
  { value: "terms", label: "Voorwaarden" },
  { value: "manual", label: "Handleiding" },
  { value: "rate_card", label: "Tarieven" },
  { value: "other", label: "Overig" },
];

function isOutdated(doc: PdDocument, today: string): boolean {
  if (!OUTDATED_KINDS.includes(doc.kind)) return false;
  const days = daysSince(doc.created_at.slice(0, 10), today);
  return days !== null && days > 365;
}

export function DocumentsSection({
  partnerId,
  slug,
  documents,
  previewUrls,
}: {
  partnerId: string;
  slug: string;
  documents: PdDocument[];
  previewUrls: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<DocumentKind>("banner");
  const fileRef = useRef<HTMLInputElement>(null);
  const today = todayIso();

  const images = documents.filter((d) => IMAGE_KINDS.includes(d.kind));
  const files = documents.filter((d) => !IMAGE_KINDS.includes(d.kind));

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Er ging iets mis.");
      else router.refresh();
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("partnerId", partnerId);
    fd.set("kind", kind);
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

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((d) => (
            <div key={d.id} className="group relative overflow-hidden rounded-lg border border-[var(--ps-border)]">
              {previewUrls[d.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrls[d.id]} alt={d.title} className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center text-xs text-[var(--ps-muted)]">geen preview</div>
              )}
              <div className="flex items-center justify-between px-2 py-1 text-xs">
                <button type="button" onClick={() => openDoc(d.storage_path)} className="truncate hover:underline">
                  {d.title}
                </button>
                <button type="button" onClick={() => run(() => deleteDocumentAction({ documentId: d.id, storagePath: d.storage_path, slug }))} className="text-[var(--ps-muted)] hover:text-red-600">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="divide-y divide-[var(--ps-border)]">
          {files.map((d) => (
            <li key={d.id} className="flex items-center gap-2 py-1.5 text-sm">
              <button type="button" onClick={() => openDoc(d.storage_path)} className="flex-1 truncate text-left hover:underline">
                📎 {d.title}
                {d.version > 1 && <span className="ml-1 text-xs text-[var(--ps-muted)]">v{d.version}</span>}
              </button>
              {isOutdated(d, today) && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700" title={`Ouder dan 12 mnd (${formatNlDay(d.created_at)})`}>
                  verouderd
                </span>
              )}
              <button type="button" onClick={() => run(() => deleteDocumentAction({ documentId: d.id, storagePath: d.storage_path, slug }))} className="text-xs text-[var(--ps-muted)] hover:text-red-600">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 && (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen materiaal of documenten.</p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)} className="rounded-md border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-1.5 text-sm">
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label className="cursor-pointer rounded-lg border border-[var(--ps-border)] px-3 py-1.5 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)]">
          Bestand toevoegen
          <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={onUpload} disabled={pending} className="hidden" />
        </label>
      </div>
    </div>
  );
}
