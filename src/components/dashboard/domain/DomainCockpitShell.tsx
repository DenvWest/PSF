import type { ReactNode } from "react";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";

type DomainCockpitShellProps = {
  accent: string;
  ariaLabel: string;
  children: ReactNode;
};

/**
 * Donkere cockpit-schaal voor een Kompas-domeinscherm (Stress/Slaap/Voeding/
 * Verbinding/Beweging): zelfde breedte-ladder als MovementCockpit, zodat de
 * midden-zone bij een open contextkolom niet breekt (@container i.p.v. lg:/xl:).
 */
export default function DomainCockpitShell({
  accent,
  ariaLabel,
  children,
}: DomainCockpitShellProps) {
  return (
    <CockpitShell accent={accent} ariaLabel={ariaLabel} embedded>
      <div className="@container mx-auto w-full max-w-[1040px] @[1080px]:max-w-[1340px]">
        <div className="flex flex-col gap-3 pb-16 md:pb-0">{children}</div>
      </div>
    </CockpitShell>
  );
}
