import Image from "next/image";
import Link from "next/link";
import { formatPublishedLabel, getCoverImageSrc, type BlogPost } from "@/data/blog-posts";

/** 3:2 cards — explicit dimensions avoid layout collapse with next/image `fill` in flex/grid. */
const CARD_WIDTH = 640;
const CARD_HEIGHT = 427;

/**
 * Shared grid for `/blog` and homepage featured articles — keep layouts aligned.
 * (2 columns from `sm`, 3 from `lg`; vertical rhythm matches blog listing.)
 */
export const BLOG_CARD_GRID_CLASS =
  "grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3";

/** Space above the card grid (after intro / section header). */
export const BLOG_CARD_GRID_SECTION_TOP_CLASS = "mt-14 md:mt-16";

type Props = {
  post: BlogPost;
  priority?: boolean;
};

export default function BlogCard({ post, priority }: Props) {
  const src = getCoverImageSrc(post);

  return (
    <Link
      href={`/${post.slug}`}
      className="group flex min-h-0 w-full min-w-0 flex-col"
    >
      <div className="relative w-full shrink-0 overflow-hidden rounded-md bg-stone-100">
        {src ? (
          <Image
            src={src}
            alt={post.coverImageAlt}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="aspect-[3/2] w-full bg-stone-200"
            role="img"
            aria-label={post.coverImageAlt}
          />
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-stone-400">
            {post.category}
          </p>
          <span className="text-stone-200" aria-hidden>
            ·
          </span>
          <p className="text-[0.625rem] text-stone-400">
            {formatPublishedLabel(post.publishedAt)}
          </p>
          <span className="text-stone-200" aria-hidden>
            ·
          </span>
          <p className="text-[0.625rem] text-stone-400">{post.readingTime}</p>
        </div>

        <h2 className="ps-display mt-3 text-[1.3125rem] leading-[1.2] text-stone-900 transition group-hover:text-stone-600">
          {post.title}
        </h2>

        <p className="mt-3 flex-1 text-[0.875rem] leading-[1.8] text-stone-400">
          {post.excerpt}
        </p>

        <p className="mt-5 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition group-hover:text-stone-700 group-hover:decoration-stone-400">
          Lees meer
        </p>
      </div>
    </Link>
  );
}
