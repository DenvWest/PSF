import type { ReactNode } from "react";

type DomainSectionHeaderProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
};

export default function DomainSectionHeader({
  eyebrow,
  title,
  action,
}: DomainSectionHeaderProps) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
            {eyebrow}
          </div>
        ) : null}
        {title ? (
          <div className="font-serif text-[19px] leading-[1.1] text-[#F1EFE8]">{title}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
