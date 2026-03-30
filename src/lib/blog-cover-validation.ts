import "server-only";

import fs from "node:fs";
import path from "node:path";
import { BLOG_POSTS, getCoverImageSrc } from "@/data/blog-posts";

const warnedSlugs = new Set<string>();
let validationRan = false;

/**
 * Logs when a post's cover path is empty, malformed, or missing on disk.
 * Runs once per server/process; dedupes warnings by slug.
 */
export function warnMissingBlogCoverFiles(): void {
  if (validationRan) return;
  validationRan = true;

  const publicRoot = path.join(process.cwd(), "public");

  for (const post of BLOG_POSTS) {
    if (warnedSlugs.has(post.slug)) continue;

    const src = getCoverImageSrc(post);
    if (!src) {
      warnedSlugs.add(post.slug);
      console.warn(
        `[blog] Post "${post.slug}" has no valid coverImage (empty after normalisation).`,
      );
      continue;
    }

    if (!src.startsWith("/images/blog/")) {
      warnedSlugs.add(post.slug);
      console.warn(
        `[blog] Post "${post.slug}" cover path should be /images/blog/... got: ${src}`,
      );
      continue;
    }

    const relativeFromPublic = src.replace(/^\//, "");
    const absolute = path.join(publicRoot, relativeFromPublic);
    if (!fs.existsSync(absolute)) {
      warnedSlugs.add(post.slug);
      console.warn(
        `[blog] Missing file for "${post.slug}": expected at public/${relativeFromPublic} (resolved: ${absolute})`,
      );
    }
  }
}
