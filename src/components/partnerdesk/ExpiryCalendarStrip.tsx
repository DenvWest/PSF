import Link from "next/link";
import { formatNlDay } from "@/lib/partnerdesk/format";
import type { ExpiryEvent } from "@/lib/partnerdesk/queries";

const WINDOW = 90;

export function ExpiryCalendarStrip({ events }: { events: ExpiryEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--ps-muted)]">
        Geen contract-eindes of opzegdeadlines in de komende 90 dagen.
      </p>
    );
  }

  return (
    <div>
      <div className="relative mb-2 h-10">
        <div className="absolute inset-x-0 top-5 h-px bg-[var(--ps-border)]" />
        {[0, 30, 60, 90].map((d) => (
          <div
            key={d}
            className="absolute top-3 -translate-x-1/2 text-[10px] text-[var(--ps-muted)]"
            style={{ left: `${(d / WINDOW) * 100}%` }}
          >
            {d === 0 ? "nu" : `${d}d`}
          </div>
        ))}
        {events.map((e, i) => (
          <Link
            key={`${e.partnerSlug}-${e.kind}-${i}`}
            href={`/admin/partners/${e.partnerSlug}#contracten`}
            title={`${e.partnerName} ${e.contractNumber} — ${
              e.kind === "cancel" ? "opzeggen vóór" : "verloopt"
            } ${formatNlDay(e.date)}`}
            className={`absolute top-4 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[var(--ps-surface)] ${
              e.kind === "cancel" ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ left: `${(Math.min(e.daysLeft, WINDOW) / WINDOW) * 100}%` }}
          />
        ))}
      </div>
      <ul className="space-y-0.5 text-xs text-[var(--ps-body)]">
        {events.slice(0, 6).map((e, i) => (
          <li key={`li-${i}`} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${e.kind === "cancel" ? "bg-amber-500" : "bg-red-500"}`} />
            <Link href={`/admin/partners/${e.partnerSlug}#contracten`} className="hover:underline">
              {e.partnerName} {e.contractNumber}
            </Link>
            <span className="text-[var(--ps-muted)]">
              · {e.kind === "cancel" ? "opzeggen vóór" : "verloopt"} {formatNlDay(e.date)} ({e.daysLeft} dgn)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
