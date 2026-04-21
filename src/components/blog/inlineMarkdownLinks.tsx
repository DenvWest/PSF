import Link from "next/link";
import type { ReactNode } from "react";

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

const linkClassName =
  "font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]";

/**
 * Rendert `[label](href)` in platte blogstrings als interne Next-links.
 */
export function renderInlineMarkdownLinks(text: string): ReactNode {
  const segments: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  MD_LINK_RE.lastIndex = 0;
  while ((match = MD_LINK_RE.exec(text)) !== null) {
    if (match.index > last) {
      segments.push(text.slice(last, match.index));
    }
    const href = match[2];
    const label = match[1];
    segments.push(
      <Link key={`mdl-${i++}`} href={href} className={linkClassName}>
        {label}
      </Link>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push(text.slice(last));
  }
  return segments.length === 1 ? segments[0] : <>{segments}</>;
}

/** Voor o.a. FAQ JSON-LD: alleen zichtbare ankertekst, zonder markdown-syntax. */
export function stripInlineMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
