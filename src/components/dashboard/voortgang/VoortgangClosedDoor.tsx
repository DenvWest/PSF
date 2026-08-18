"use client";

import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";

type VoortgangClosedDoorProps = {
  title: string;
  body: string;
  footnote?: string;
};

export default function VoortgangClosedDoor({
  title,
  body,
  footnote,
}: VoortgangClosedDoorProps) {
  return (
    <CockpitTile>
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 18,
          color: "var(--text)",
          lineHeight: 1.25,
          margin: "0 0 8px",
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          textWrap: "pretty",
        }}
      >
        {body}
      </p>
      {footnote ? (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 11,
            color: "var(--text-subtle)",
            lineHeight: 1.6,
            textWrap: "pretty",
          }}
        >
          {footnote}
        </p>
      ) : null}
    </CockpitTile>
  );
}
