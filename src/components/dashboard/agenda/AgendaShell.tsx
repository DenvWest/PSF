import type { ReactNode } from "react";

type AgendaShellProps = {
  accentColor: string;
  children: ReactNode;
};

export default function AgendaShell({ accentColor, children }: AgendaShellProps) {
  return (
    <article
      aria-label="Mijn dag"
      className="-mt-2 overflow-hidden rounded-[28px] border border-[#e4e0da] bg-white shadow-[0_8px_32px_rgba(15,28,16,0.06)]"
      style={{ borderTopWidth: 2, borderTopColor: accentColor }}
    >
      {children}
    </article>
  );
}

export function AgendaShellSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-[#ebe7e2] px-5 py-4 first:border-t-0 ${className}`}>
      {children}
    </div>
  );
}
