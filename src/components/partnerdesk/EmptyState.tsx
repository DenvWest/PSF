import type { ReactNode } from "react";

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--ps-border)] bg-[var(--ps-surface)] px-6 py-12 text-center">
      <p className="font-medium text-[var(--ps-ink)]">{title}</p>
      {children && (
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ps-body)]">
          {children}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
