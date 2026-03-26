import type { ReactNode } from "react";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
};

export default function SectionShell({
  id,
  children,
  className = "",
  as: Tag = "section",
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      className={`mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12 ${className}`}
    >
      {children}
    </Tag>
  );
}
