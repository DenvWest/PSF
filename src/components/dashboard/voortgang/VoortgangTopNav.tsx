"use client";

import CockpitTopNav, {
  type CockpitTopNavItem,
} from "@/components/dashboard/cockpit/CockpitTopNav";
import type { VoortgangRailItemId } from "@/lib/context-rail";

/**
 * Voortgang-navigatie onder md: dezelfde bestemmingen als de linker rail,
 * ingeklapt tot één regel in de sticky header.
 */

type VoortgangTopNavProps = {
  activeItem: VoortgangRailItemId;
  onOpenItem: (item: VoortgangRailItemId) => void;
};

function resolveTitle(activeItem: VoortgangRailItemId): { title: string; icon: string } {
  if (activeItem === "hermeting") {
    return { title: "Hermeting", icon: "Calendar" };
  }
  return { title: "Je patroon", icon: "BarChart" };
}

export default function VoortgangTopNav({ activeItem, onOpenItem }: VoortgangTopNavProps) {
  const { title, icon } = resolveTitle(activeItem);

  const items: CockpitTopNavItem[] = [
    {
      id: "hub",
      label: "Je patroon",
      icon: "BarChart",
      active: activeItem === "hub",
      onSelect: () => onOpenItem("hub"),
    },
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
      items={items}
      surface="voortgang"
    />
  );
}
