import { ON_HOLD_DISCLAIMER } from "@/data/approved-claims";

export default function AshwagandhaOnHoldDisclaimer() {
  return (
    <aside
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
      role="note"
      aria-label="EFSA on-hold melding ashwagandha"
    >
      <p className="font-semibold text-amber-900">Let op: EU-claimstatus</p>
      <p className="mt-2 leading-relaxed text-amber-900/90">{ON_HOLD_DISCLAIMER}</p>
    </aside>
  );
}
