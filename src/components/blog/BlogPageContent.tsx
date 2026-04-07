"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard, {
  BLOG_CARD_GRID_CLASS,
  BLOG_CARD_GRID_SECTION_TOP_CLASS,
} from "@/components/blog/BlogCard";
import {
  formatPublishedLabel,
  getCoverImageSrc,
  type BlogPost,
} from "@/data/blog-posts";

const CATEGORIES = ["Alle", "Ingrediënten", "Vergelijking", "Keuzehulp"] as const;

type Props = {
  posts: BlogPost[];
};

export default function BlogPageContent({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Alle");

  const filteredPosts =
    activeCategory === "Alle"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const [featuredPost, ...remainingPosts] = filteredPosts;

  return (
    <section aria-labelledby="blog-articles-heading">
      <h2 id="blog-articles-heading" className="sr-only">
        Artikelen
      </h2>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors duration-150 ${
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="mt-16 text-sm text-stone-400">
          Geen artikelen gevonden in deze categorie.
        </p>
      )}

      {/* Featured post — full width on desktop, regular card on mobile */}
      {featuredPost && (
        <div className={BLOG_CARD_GRID_SECTION_TOP_CLASS}>
          <Link
            href={`/${featuredPost.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg lg:flex-row"
          >
            {/* Image — aspect-video on mobile, stretches to text height on desktop */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-2/5">
              {getCoverImageSrc(featuredPost) ? (
                <Image
                  src={getCoverImageSrc(featuredPost)}
                  alt={featuredPost.coverImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  className="h-full w-full bg-stone-200"
                  role="img"
                  aria-label={featuredPost.coverImageAlt}
                />
              )}

              {/* Category badge */}
              <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {featuredPost.category}
              </span>
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col justify-center p-5 lg:w-3/5 lg:p-10">
              <h3 className="text-xl font-semibold leading-snug text-gray-900 transition group-hover:text-stone-600 lg:text-2xl">
                {featuredPost.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {formatPublishedLabel(featuredPost.publishedAt)}
                <span className="mx-1.5" aria-hidden>·</span>
                {featuredPost.readingTime}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-stone-400 lg:text-base">
                {featuredPost.excerpt}
              </p>

              <p className="mt-6 text-base font-medium text-stone-400 transition group-hover:text-stone-800">
                →
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Remaining posts grid */}
      {remainingPosts.length > 0 && (
        <div className={`${BLOG_CARD_GRID_SECTION_TOP_CLASS} ${BLOG_CARD_GRID_CLASS}`}>
          {remainingPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} priority={index < 3} />
          ))}
        </div>
      )}
    </section>
  );
}
