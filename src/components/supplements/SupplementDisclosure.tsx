"use client";

import Link from "next/link";
import { Pill } from "@/components/app/icons";
import type { RecommendationExplanation } from "@/types/recommendation-explanation";

export type SupplementDisclosureData = {
  name: string;
  form: string;
  grade: "A" | "B" | string;
  claim: string;
  signal: string;
  qualityRule: string;
  comparisonPath: string;
  onHold: boolean;
  explanation: RecommendationExplanation;
};

type SupplementDisclosureProps = {
  data: SupplementDisclosureData;
  tone?: "dark" | "light";
};

export default function SupplementDisclosure({
  data,
  tone = "dark",
}: SupplementDisclosureProps) {
  const light = tone === "light";
  return (
    <aside
      aria-label="Aanvullend supplement-advies"
      style={{
        marginTop: 4,
        paddingLeft: 14,
        borderLeft: "2px solid var(--divider)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 8px" }}>
        <Pill s={14} style={{ color: "var(--text-subtle)" }} />
        <span
          style={{
            fontSize: 11.5,
            color: "var(--text-subtle)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Spoor B · Aanvulling, pas hierna
        </span>
      </div>
      <div
        style={{
          background: light ? "#ffffff" : "rgba(255,255,255,0.025)",
          border: "1px solid var(--divider)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontFamily: "var(--f-serif)", fontSize: 18, color: "var(--text)" }}>
            {data.name}
          </span>
          <span
            style={{
              fontFamily: "var(--f-serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--text-subtle)",
            }}
          >
            {data.form}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--text-muted)",
              border: "1px solid var(--divider)",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            Evidence {data.grade}
          </span>
        </div>
        {data.onHold ? (
          <p
            style={{
              fontSize: 13,
              color: light ? "var(--text)" : "rgba(255,255,255,0.88)",
              lineHeight: 1.5,
              margin: "0 0 8px",
            }}
          >
            Dit is geen goedgekeurde gezondheidsclaim.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 8px" }}>
            {data.claim}.
          </p>
        )}
        <details>
          <summary
            style={{
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              listStyle: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--sage)",
            }}
            className="[&::-webkit-details-marker]:hidden"
          >
            ⓘ Waarom dit advies?
          </summary>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {data.explanation.lifestyleFirst}
          </p>
          <ul
            style={{
              margin: "8px 0 0",
              paddingLeft: 16,
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {data.explanation.factors.map((factor, index) => (
              <li key={index} style={{ marginBottom: 6 }}>
                {factor.text}
              </li>
            ))}
            <li style={{ marginBottom: 6 }}>{data.explanation.supplementRationale}</li>
            <li>{data.explanation.trustLine}</li>
          </ul>
        </details>
      </div>
      <Link
        href={data.comparisonPath}
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
          marginTop: 10,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--sage)",
          textDecoration: "underline",
          textUnderlineOffset: 2,
        }}
      >
        Bekijk de onafhankelijke vergelijking →
      </Link>
    </aside>
  );
}
