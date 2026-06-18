import type { ReactNode } from "react";

type RevealCollapsiblePanelProps = {
  summary: string;
  children: ReactNode;
  id?: string;
};

export default function RevealCollapsiblePanel({
  summary,
  children,
  id,
}: RevealCollapsiblePanelProps) {
  return (
    <details
      id={id}
      className="group mb-4 rounded-3xl border border-intake-card-border bg-intake-bg-elevated px-5 py-4 last:mb-0"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-intake-ink [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{summary}</span>
        <span
          className="ml-3 text-intake-ink-subtle transition-transform group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="mt-4 border-t border-intake-divider pt-4">{children}</div>
    </details>
  );
}
