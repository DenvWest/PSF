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
        className="group inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:text-stone-900"
      >
        <span aria-hidden className="text-stone-400 transition group-hover:text-stone-600">
          ←
        </span>
        <span>
          Terug naar:{" "}
          <span className="font-semibold text-stone-900">{link.label}</span>
        </span>
      </Link>
    </nav>
  );
}
