import {
  formatPublishedLabel,
  type BlogPost,
} from "@/data/blog-posts";

/** Text-only article hero: category, publication meta, optional excerpt from `blog-posts`. */
export function BlogArticleIntro({ post }: { post: BlogPost }) {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-800">
        {post.category}
      </p>
      <p className="mt-2 text-[0.8125rem] text-stone-500">
        {formatPublishedLabel(post.publishedAt)}
        <span className="mx-2 text-stone-300">·</span>
        {post.readingTime}
      </p>
    </>
  );
}

/** Editorial lead from `post.excerpt` — place directly under the article title. */
export function BlogArticleExcerpt({ post }: { post: BlogPost }) {
  return (
    <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 md:text-lg">
      {post.excerpt}
    </p>
  );
}
