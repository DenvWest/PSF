"use client";

import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

export type DomainRouteStripNode = {
  key: string;
  label: string;
  sublabel: string;
  current?: boolean;
  href?: string;
  onClick?: () => void;
};

type DomainRouteStripProps = {
  domain: PillarId;
  surface: string;
  nodes: readonly DomainRouteStripNode[];
};

export default function DomainRouteStrip({ domain, surface, nodes }: DomainRouteStripProps) {
  function handleActivate(node: DomainRouteStripNode) {
    if (node.current) return;
    trackEvent("voortgang_route_click", { domain, target: node.key, surface });
    clarityTag("voortgang_route_click", `${domain}:${node.key}`);
    node.onClick?.();
  }

  return (
    <CockpitTile eyebrow="Jouw route" ariaLabel="Jouw route door dit domein">
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-2">
        {nodes.map((node, index) => (
          <span key={node.key} className="flex items-center gap-1">
            {index > 0 ? (
              <Icons.ChevronRight s={12} style={{ color: "#4A544D", flexShrink: 0 }} />
            ) : null}
            {node.current ? (
              <span className="inline-flex flex-col rounded-[10px] border border-[#5A8F6A]/50 bg-[#5A8F6A]/[0.14] px-3 py-1.5">
                <span className="text-[12.5px] font-semibold text-[#9CC5A9]">{node.label}</span>
                <span className="text-[10px] leading-tight text-[#7E8C82]">{node.sublabel}</span>
              </span>
            ) : node.href ? (
              <a
                href={node.href}
                onClick={() => handleActivate(node)}
                className="inline-flex cursor-pointer flex-col rounded-[10px] border border-white/10 bg-black/20 px-3 py-1.5 text-inherit no-underline transition-colors hover:border-[#5A8F6A]/35"
              >
                <span className="text-[12.5px] font-semibold text-[#F1EFE8]">{node.label}</span>
                <span className="text-[10px] leading-tight text-[#7E8C82]">{node.sublabel}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleActivate(node)}
                className="inline-flex cursor-pointer flex-col rounded-[10px] border border-white/10 bg-black/20 px-3 py-1.5 text-left font-[inherit] transition-colors hover:border-[#5A8F6A]/35"
              >
                <span className="text-[12.5px] font-semibold text-[#F1EFE8]">{node.label}</span>
                <span className="text-[10px] leading-tight text-[#7E8C82]">{node.sublabel}</span>
              </button>
            )}
          </span>
        ))}
      </div>
    </CockpitTile>
  );
}
