import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import BlogCard from "@/components/blog/BlogCard";
import { warnMissingBlogCoverFiles } from "@/lib/blog-cover-validation";
import { BLOG_POSTS, type BlogPost } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Analyse en uitleg over omega 3, magnesium en de keuzes die ertoe doen.",
};

function byNewestFirst(a: BlogPost, b: BlogPost): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export default function BlogPage() {
  warnMissingBlogCoverFiles();
  const posts = [...BLOG_POSTS].sort(byNewestFirst);

  return (
    <Container>
      <div className="py-16 md:py-24">
        {/* Text-only intro — no images, no featured post above the fold */}
        <header className="max-w-[520px]">
          <p className="text-[0.63rem] font-medium uppercase tracking-[0.26em] text-stone-400">
            Blog
          </p>
          <h1 className="ps-display mt-5 text-[3rem] leading-[1.06] text-stone-900 sm:text-[3.75rem]">
            Analyse en uitleg over omega&nbsp;3 en magnesium.
          </h1>
          <p className="mt-6 text-base leading-[1.85] text-stone-400">
            Gerichte artikelen over ingrediënten, vergelijkingen en de keuzes
            die ertoe doen. Inhoudelijk, zonder hype.
          </p>
        </header>

        <div className="ps-divider mt-14 md:mt-16" aria-hidden />

        <section
          className="mt-14 md:mt-16"
          aria-labelledby="blog-articles-heading"
        >
          <h2
            id="blog-articles-heading"
            className="sr-only"
          >
            Artikelen
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((article, index) => (
              <BlogCard
                key={article.slug}
                post={article}
                priority={index < 3}
              />
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
