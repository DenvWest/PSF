import Link from "next/link";
import type { BlogCornerstoneLink as BlogCornerstone } from "@/types/blog";

interface BlogCornertoneLinkProps {
  link: BlogCornerstone;
}

export default function BlogCornerstoneLink({ link }: BlogCornertoneLinkProps) {
  return (
    <nav aria-label="Terug naar overzicht">
      <Link
        href={link.href}
        className="group inline-flex items-center gap-2.5 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 px-4 py-3 text-sm font-medium text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/40 hover:shadow-[0_4px_14px_rgba(90,143,106,0.16)] active:translate-y-0"
      >
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-400 transition-[transform,border-color,color] duration-200 ease-out motion-safe:group-hover:-translate-x-0.5 group-hover:border-ps-green/45 group-hover:text-ps-green"
        >
          ←
        </span>
        <span className="text-stone-700 transition-colors group-hover:text-ps-green">
          Terug naar:{" "}
          <span className="font-semibold text-stone-900 transition-colors group-hover:text-ps-green">
            {link.label}
          </span>
        </span>
      </Link>
    </nav>
  );
}
