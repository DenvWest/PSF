"use client";

import FoundationPyramid, {
  type PillarStatus,
} from "@/components/pyramid/FoundationPyramid";
import type { PillarId } from "@/data/foundation-pyramid";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

type RevealMethodologyPanelProps = {
  pillarStatuses: Partial<Record<PillarId, PillarStatus>>;
};

export default function RevealMethodologyPanel({
  pillarStatuses,
}: RevealMethodologyPanelProps) {
  return (
    <details
      style={{
        marginBottom: 20,
        borderRadius: 24,
        border: "1px solid var(--panel-border)",
        background: "var(--panel)",
        padding: "16px 20px",
      }}
    >
      <summary
        style={{
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          listStyle: "none",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text)",
        }}
        className="[&::-webkit-details-marker]:hidden"
      >
        {REVEAL_COPY.footerPanelSummary}
      </summary>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--divider)" }}>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--text-muted)",
            margin: "0 0 20px",
          }}
        >
          {REVEAL_COPY.footerMethodIntro}
        </p>
        <FoundationPyramid mode="personalized" pillarStatuses={pillarStatuses} />
      </div>
    </details>
  );
}
