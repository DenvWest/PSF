"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import EvidenceStars from "@/components/evidence/EvidenceStars";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DomainEvidenceView } from "@/lib/statistieken-advies-model";

type EvidenceLadderCardProps = {
  domains: DomainEvidenceView[];
};

export default function EvidenceLadderCard({ domains }: EvidenceLadderCardProps) {
  const [openDomain, setOpenDomain] = useState<string | null>(
    domains[0]?.pillarId ?? null,
  );

  if (domains.length === 0) {
    return null;
  }

  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow="Wat de wetenschap hierover zegt"
        title="Waarom we hiernaar vroegen"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {domains.map((domain) => {
          const open = openDomain === domain.pillarId;
          return (
            <div
              key={domain.pillarId}
              style={{
                borderTop: "1px solid var(--divider)",
                paddingTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const next = open ? null : domain.pillarId;
                  setOpenDomain(next);
                  if (next) {
                    trackEvent("dashboard_evidence_open", {
                      domain: domain.pillarId,
                      stars: domain.stars,
                    });
                    clarityTag("dashboard_evidence", domain.pillarId);
                  }
                }}
                aria-expanded={open}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "4px 0 8px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--f-serif)",
                    fontSize: 16,
                    color: "var(--text)",
                  }}
                >
                  <Icons.ChevronRight
                    s={16}
                    style={{
                      color: "var(--text-subtle)",
                      transform: open ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                  {domain.label}
                </span>
                <EvidenceStars
                  stars={domain.stars}
                  label=""
                  className="text-[12px] text-[var(--text-muted)]"
                />
              </button>

              {open ? (
                <div style={{ padding: "0 0 8px 24px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                      textWrap: "pretty",
                    }}
                  >
                    {domain.whyThisQuestion}
                  </p>
                  {domain.answerHint ? (
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 13,
                        color: "var(--text)",
                        lineHeight: 1.5,
                        textWrap: "pretty",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Jouw antwoord wees op: </span>
                      {domain.answerHint}
                    </p>
                  ) : null}
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-subtle)",
                        marginBottom: 4,
                      }}
                    >
                      Sterkte van dit signaal
                    </div>
                    <EvidenceStars
                      stars={domain.stars}
                      label={domain.strengthLabel}
                      className="text-[13px] font-medium text-[var(--text-muted)]"
                    />
                  </div>
                  {domain.references[0] ? (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--text-subtle)",
                          marginBottom: 4,
                        }}
                      >
                        Bron
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: "var(--text-muted)",
                          lineHeight: 1.5,
                          textWrap: "pretty",
                        }}
                      >
                        {domain.references[0].apa}
                        {domain.references[0].doi ? (
                          <>
                            {" "}
                            doi:{domain.references[0].doi}
                          </>
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: 11.5,
                      color: "var(--text-subtle)",
                      lineHeight: 1.45,
                      textWrap: "pretty",
                    }}
                  >
                    Sterren zeggen iets over de kracht van dit signaal — niet over de
                    zekerheid van je score.
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </CockpitTile>
  );
}
