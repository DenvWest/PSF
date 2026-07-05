import type { ReactNode } from "react";

type MethodologyPreviewCardProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function MethodologyPreviewCard({
  eyebrow,
  title,
  children,
  footer,
  className = "",
}: MethodologyPreviewCardProps) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 shadow-lg md:min-h-[420px] ${className}`}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
          {eyebrow}
        </p>
        <p className="mt-0.5 font-serif text-lg text-white">{title}</p>
      </div>
      <div className="flex flex-1 flex-col bg-[#1a2e1c] p-4 md:p-5">{children}</div>
      {footer ? (
        <div className="border-t border-white/10 bg-[#1a2e1c] px-4 py-3 text-xs">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
