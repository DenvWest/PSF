import Image from "next/image";
import Link from "next/link";
import { formatPublishedLabel, getCoverImageSrc, type BlogPost } from "@/data/blog-posts";

/**
 * Shared grid for `/blog` and homepage featured articles — keep layouts aligned.
 * (2 columns from `sm`, 3 from `lg`; vertical rhythm matches blog listing.)
 */
export const BLOG_CARD_GRID_CLASS =
  "grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3";

/** Space above the card grid (after intro / section header). */
export const BLOG_CARD_GRID_SECTION_TOP_CLASS = "mt-14 md:mt-16";

type Props = {
  post: BlogPost;
  priority?: boolean;
  /** Kept for backwards compatibility; card design is now unified. */
  homePage?: boolean;
};

export default function BlogCard({ post, priority }: Props) {
  const src = getCoverImageSrc(post);

  return (
    <Link
      href={`/${post.slug}`}
      className="group flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt={post.coverImageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="h-full w-full bg-stone-200"
            role="img"
            aria-label={post.coverImageAlt}
          />
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {post.category}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-base font-semibold leading-snug text-gray-900 transition group-hover:text-stone-600">
          {post.title}
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          {formatPublishedLabel(post.publishedAt)}
          <span className="mx-1.5" aria-hidden>·</span>
          {post.readingTime}
        </p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-400">
          {post.excerpt}
        </p>

        <p className="mt-4 text-base font-medium text-stone-400 transition group-hover:text-stone-800">
          →
        </p>
      </div>
    </Link>
  );
}
