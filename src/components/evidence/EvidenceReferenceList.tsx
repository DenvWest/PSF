import type { EvidenceReference } from "@/data/leefstijlcheck-evidence";

export function formatEvidenceReference(ref: EvidenceReference): string {
  const meta: string[] = [];
  if (ref.doi) meta.push(`DOI: ${ref.doi}`);
  if (ref.pmid) meta.push(`PMID: ${ref.pmid}`);
  return `${ref.apa}${meta.length ? ` (${meta.join(" · ")})` : ""}`;
}

export default function EvidenceReferenceList({
  references,
  className = "mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-stone-600",
}: {
  references: EvidenceReference[];
  className?: string;
}) {
  return (
    <ol className={className}>
      {references.map((ref) => (
        <li key={formatEvidenceReference(ref)}>{formatEvidenceReference(ref)}</li>
      ))}
    </ol>
  );
}
