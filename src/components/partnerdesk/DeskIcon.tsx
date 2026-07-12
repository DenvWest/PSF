import type { SVGProps } from "react";

export type DeskIconName =
  | "today"
  | "partners"
  | "tasks"
  | "settings"
  | "site"
  | "affiliate"
  | "logout"
  | "chevron"
  | "plus"
  | "external";

const PATHS: Record<DeskIconName, string> = {
  today: "M4 5h16v15H4zM4 9h16M8 3v4M16 3v4",
  partners: "M4 6h10M4 12h16M4 18h7M18 14l3 3-3 3",
  tasks: "M4 6l2 2 3-3M4 12l2 2 3-3M4 18l2 2 3-3M13 6h7M13 12h7M13 18h7",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1L14.5 2h-5l-.3 2.9a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.9h5l.3-2.9a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6a7 7 0 00.1-1z",
  site: "M3 12a9 9 0 1018 0 9 9 0 00-18 0zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  affiliate: "M9 15l6-6M10.5 8.5l1-1a3 3 0 014 4l-1 1M13.5 15.5l-1 1a3 3 0 01-4-4l1-1",
  logout: "M15 12H4m0 0l4-4m-4 4l4 4M14 4h5v16h-5",
  chevron: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  external: "M14 4h6v6M20 4l-9 9M18 13v6H5V6h6",
};

export function DeskIcon({
  name,
  ...props
}: { name: DeskIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
