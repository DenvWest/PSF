import type { ReactNode } from "react";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";

type DomainCockpitShellProps = {
  accent: string;
  ariaLabel: string;
  children: ReactNode;
};

/**
 * Donkere cockpit-schaal voor een Kompas-domeinscherm (Stress/Slaap/Voeding/
 * Verbinding/Beweging): volledige breedte van de midden-kolom, met @container
 * zodat de interne @[560px]/@[1080px]-lagen (ladder, knoppenrij) blijven
 * werken ongeacht hoe breed de contextkolom ernaast openstaat.
 */
export default function DomainCockpitShell({
  accent,
  ariaLabel,
  children,
}: DomainCockpitShellProps) {
  return (
    <CockpitShell accent={accent} ariaLabel={ariaLabel} embedded>
      <div className="@container mx-auto w-full">
        <div className="flex flex-col gap-3 pb-16 md:pb-0">{children}</div>
      </div>
    </CockpitShell>
  );
}
