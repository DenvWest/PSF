import type { ReactNode } from "react";

export function KompasLooseCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-[#e4e0da] bg-white p-4 shadow-[0_8px_32px_rgba(15,28,16,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
