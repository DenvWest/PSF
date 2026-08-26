"use client";

import CockpitTopNav, {
  type CockpitTopNavItem,
} from "@/components/dashboard/cockpit/CockpitTopNav";
import { PILLAR } from "@/data/dashboard";
import type { ContextRailDomainItem } from "@/lib/context-rail";
import type { PillarId } from "@/types/dashboard";

/**
 * Kompas-navigatie onder md: terug naar het overzicht plus de vijf domeinen,
 * ingeklapt tot één regel in de sticky header. Vanaf md neemt de linker rail
 * het over (zie `hideDomainTopNav` in Dashboard).
 */

export type DomainNavApi = {
  onBack: () => void;
  onSwitch: (domain: PillarId) => void;
};

type DomainTopNavProps = {
  activeDomain: PillarId;
  domains: ContextRailDomainItem[];
  onBack: () => void;
  onSwitch: (domain: PillarId) => void;
};

export default function DomainTopNav({
  activeDomain,
  domains,
  onBack,
  onSwitch,
}: DomainTopNavProps) {
  const pillar = PILLAR[activeDomain];

  const items: CockpitTopNavItem[] = [
    {
      id: "kompas",
      label: "Kompas-overzicht",
      icon: "Compass",
      onSelect: onBack,
    },
    ...domains.map((domain) => ({
      id: domain.id,
      label: domain.label,
      dotColor: domain.color,
      trailing: String(domain.score),
      indent: true,
      active: domain.id === activeDomain,
      onSelect: () => onSwitch(domain.id),
    })),
  ];

  return (
    <CockpitTopNav
      ariaLabel="Domein-navigatie"
      title={pillar.label}
      titleIcon={pillar.icon}
      titleColor={pillar.color}
      items={items}
      surface="kompas"
    />
  );
}
