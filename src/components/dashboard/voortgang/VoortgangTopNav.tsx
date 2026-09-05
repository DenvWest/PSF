"use client";

import CockpitTopNav, {
  type CockpitTopNavItem,
} from "@/components/dashboard/cockpit/CockpitTopNav";
import { PILLAR } from "@/data/dashboard";
import {
  VOEDING_RAIL_LAYERS,
  type ContextRailDomainItem,
  type VoortgangRailItemId,
} from "@/lib/context-rail";
import type { VoedingLaagSlug } from "@/lib/dashboard-url";
import { isKlikbaarVoortgangDomein } from "@/lib/zichtbare-domeinen";
import type { PillarId } from "@/types/dashboard";

/**
 * Voortgang-navigatie onder md: dezelfde bestemmingen als de linker rail,
 * ingeklapt tot één regel in de sticky header.
 */

type VoortgangTopNavProps = {
  activeItem: VoortgangRailItemId;
  /** Het domein binnen het leefstijlprofiel, of `null` op de keuzehub. */
  leefstijlprofielDomein: PillarId | null;
  voedingLaag?: VoedingLaagSlug | null;
  domains: ContextRailDomainItem[];
  onOpenItem: (item: VoortgangRailItemId) => void;
  onOpenDomein: (domain: PillarId) => void;
  onOpenVoedingLaag?: (laag: VoedingLaagSlug) => void;
};

function resolveTitle({
  activeItem,
  leefstijlprofielDomein,
  voedingLaag,
}: Pick<VoortgangTopNavProps, "activeItem" | "leefstijlprofielDomein" | "voedingLaag">): {
  title: string;
  icon: string;
  color?: string;
} {
  if (activeItem === "hermeting") {
    return { title: "Hermeting", icon: "Calendar" };
  }
  if (activeItem === "leefstijlprofiel") {
    if (leefstijlprofielDomein === "voeding" && voedingLaag) {
      const layer = VOEDING_RAIL_LAYERS.find((item) => item.slug === voedingLaag);
      return {
        title: `Voeding · ${layer?.label ?? voedingLaag}`,
        icon: "User",
        color: PILLAR.voeding.color,
      };
    }
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
  voedingLaag = null,
  domains,
  onOpenItem,
  onOpenDomein,
  onOpenVoedingLaag,
}: VoortgangTopNavProps) {
  const { title, icon, color } = resolveTitle({
    activeItem,
    leefstijlprofielDomein,
    voedingLaag,
  });

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
    ...domains.flatMap((domain) => {
      const clickable = isKlikbaarVoortgangDomein(domain.id);
      const domainItem: CockpitTopNavItem = {
        id: `domein-${domain.id}`,
        label: domain.label,
        dotColor: domain.color,
        trailing: String(domain.score),
        indent: true,
        active:
          clickable &&
          activeItem === "leefstijlprofiel" &&
          leefstijlprofielDomein === domain.id &&
          (domain.id !== "voeding" || voedingLaag == null),
        disabled: !clickable,
        onSelect: clickable ? () => onOpenDomein(domain.id) : () => {},
      };
      if (domain.id !== "voeding") {
        return [domainItem];
      }
      return [
        domainItem,
        ...VOEDING_RAIL_LAYERS.map((layer) => ({
          id: `voeding-laag-${layer.slug}`,
          label: layer.label,
          indent: true,
          indentLevel: 2 as const,
          active:
            activeItem === "leefstijlprofiel" &&
            leefstijlprofielDomein === "voeding" &&
            voedingLaag === layer.slug,
          onSelect: () => onOpenVoedingLaag?.(layer.slug),
        })),
      ];
    }),
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
