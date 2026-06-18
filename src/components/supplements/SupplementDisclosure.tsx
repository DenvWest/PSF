"use client";

import Link from "next/link";
import { Pill } from "@/components/app/icons";

export type SupplementDisclosureData = {
  name: string;
  form: string;
  grade: "A" | "B" | string;
  claim: string;
  comparisonPath: string;
  onHold: boolean;
  qualityReason: string;
};

type SupplementDisclosureProps = {
  data: SupplementDisclosureData;
};

export default function SupplementDisclosure({ data }: SupplementDisclosureProps) {
  return (
    <aside
      aria-label="Aanvullend supplement-advies"
      className="border-l-2 pl-3.5"
      style={{ borderColor: "var(--divider, rgba(255,255,255,0.08))" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Pill s={14} style={{ color: "var(--text-subtle, rgba(255,255,255,0.4))" }} />
        <span
          className="text-[11.5px] uppercase tracking-[0.1em]"
          style={{ color: "var(--text-subtle, rgba(255,255,255,0.4))" }}
        >
          Spoor B · Aanvulling, pas hierna
        </span>
      </div>
      <div
        className="rounded-2xl border p-4"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "var(--divider, rgba(255,255,255,0.08))",
        }}
      >
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <span className="font-serif text-lg" style={{ color: "var(--text, rgba(255,255,255,0.95))" }}>
            {data.name}
          </span>
          <span
            className="font-serif text-sm italic"
            style={{ color: "var(--text-subtle, rgba(255,255,255,0.4))" }}
          >
            {data.form}
          </span>
          <span
            className="ml-auto rounded-md border px-2 py-0.5 text-[11px]"
            style={{
              color: "var(--text-muted, rgba(255,255,255,0.6))",
              borderColor: "var(--divider, rgba(255,255,255,0.08))",
            }}
          >
            Evidence {data.grade}
          </span>
        </div>
        {data.onHold ? (
          <p className="mb-2 text-sm text-intake-terra">
            Dit is geen goedgekeurde gezondheidsclaim.
          </p>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted, rgba(255,255,255,0.6))" }}>
            {data.claim}
          </p>
        )}
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer list-none text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
            ⓘ Waarom dit advies?
          </summary>
          <ul className="mt-2 space-y-1.5 pl-4 text-sm leading-relaxed" style={{ color: "var(--text-muted, rgba(255,255,255,0.6))" }}>
            <li className="list-disc">{data.qualityReason}</li>
            <li className="list-disc">Wij kozen dit op kwaliteit, niet op commissie.</li>
          </ul>
        </details>
      </div>
      <Link
        href={data.comparisonPath}
        className="mt-3 inline-block min-h-11 py-2 text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px]"
      >
        Bekijk de onafhankelijke vergelijking →
      </Link>
    </aside>
  );
}
