import type { PartnerStatus } from "@/types/partnerdesk";

const STATUS_META: Record<
  PartnerStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Actief",
    className: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]",
  },
  onboarding: {
    label: "Onboarding",
    className: "bg-amber-50 text-amber-700",
  },
  paused: {
    label: "Gepauzeerd",
    className: "bg-stone-100 text-stone-600",
  },
  ended: {
    label: "Beëindigd",
    className: "bg-stone-100 text-stone-500",
  },
};

export const PARTNER_STATUS_LABEL: Record<PartnerStatus, string> = {
  active: "Actief",
  onboarding: "Onboarding",
  paused: "Gepauzeerd",
  ended: "Beëindigd",
};

export function StatusBadge({ status }: { status: PartnerStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
