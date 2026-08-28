"use client";

import CockpitTopNav, {
  type CockpitTopNavItem,
} from "@/components/dashboard/cockpit/CockpitTopNav";
import { PILLAR } from "@/data/dashboard";
import type { ContextRailDomainItem, VoortgangRailItemId } from "@/lib/context-rail";
import type { PillarId } from "@/types/dashboard";

/**
 * Voortgang-navigatie onder md: dezelfde bestemmingen als de linker rail,
 * ingeklapt tot één regel in de sticky header.
 */

type VoortgangTopNavProps = {
  activeItem: VoortgangRailItemId;
  /** Het domein binnen het leefstijlprofiel, of `null` op de keuzehub. */
  leefstijlprofielDomein: PillarId | null;
  domains: ContextRailDomainItem[];
  onOpenItem: (item: VoortgangRailItemId) => void;
  onOpenDomein: (domain: PillarId) => void;
};

function resolveTitle({
  activeItem,
  leefstijlprofielDomein,
}: Pick<VoortgangTopNavProps, "activeItem" | "leefstijlprofielDomein">): {
  title: string;
  icon: string;
  color?: string;
} {
  if (activeItem === "hermeting") {
    return { title: "Hermeting", icon: "Calendar" };
  }
  if (activeItem === "leefstijlprofiel") {
    return leefstijlprofielDomein
      ? {
          title: `Leefstijlprofiel · ${PILLAR[leefstijlprofielDomein].label}`,
          icon: "User",
          color: PILLAR[leefstijlprofielDomein].color,
        }
      : { title: "Leefstijlprofiel", icon: "User" };
  }
  return { title: "Overzicht", icon: "Home" };
}

export default function VoortgangTopNav({
  activeItem,
  leefstijlprofielDomein,
  domains,
  onOpenItem,
  onOpenDomein,
}: VoortgangTopNavProps) {
  const { title, icon, color } = resolveTitle({ activeItem, leefstijlprofielDomein });

  const items: CockpitTopNavItem[] = [
    {
      id: "hub",
      label: "Overzicht",
      icon: "Home",
      active: activeItem === "hub",
      onSelect: () => onOpenItem("hub"),
    },
    {
      id: "leefstijlprofiel",
      label: "Leefstijlprofiel",
      icon: "User",
      active: activeItem === "leefstijlprofiel" && !leefstijlprofielDomein,
      onSelect: () => onOpenItem("leefstijlprofiel"),
    },
    ...domains.map((domain) => ({
      id: `domein-${domain.id}`,
      label: domain.label,
      dotColor: domain.color,
      trailing: String(domain.score),
      indent: true,
      active: activeItem === "leefstijlprofiel" && leefstijlprofielDomein === domain.id,
      onSelect: () => onOpenDomein(domain.id),
    })),
    {
      id: "hermeting",
      label: "Hermeting",
      icon: "Calendar",
      active: activeItem === "hermeting",
      onSelect: () => onOpenItem("hermeting"),
    },
  ];

  return (
    <CockpitTopNav
      ariaLabel="Voortgang-navigatie"
      title={title}
      titleIcon={icon}
      titleColor={color}
      items={items}
      surface="voortgang"
    />
  );
}
