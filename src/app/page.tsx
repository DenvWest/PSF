import type { Metadata } from "next";
import Link from "next/link";
import BlogCard, {
  BLOG_CARD_GRID_CLASS,
  BLOG_CARD_GRID_SECTION_TOP_CLASS,
} from "@/components/blog/BlogCard";
import Hero from "@/components/homepage/Hero";
import JourneySection from "@/components/homepage/JourneySection";
import Container from "@/components/layout/Container";
import { getBlogPostBySlug } from "@/data/blog-posts";
import "./homepage.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Voor mannen 40+: grip op energie, slaap en leefstijl—stap voor stap, zonder harde sales.",
};

/** Same articles as before (routes unchanged); data comes from blog-posts for covers. */
const FEATURED_ARTICLE_SLUGS = [
  "wat-is-omega-3",
  "omega-3-vergelijken",
  "magnesium-vergelijken",
] as const;

function BlogPreview() {
  const featuredPosts = FEATURED_ARTICLE_SLUGS.map((slug) =>
    getBlogPostBySlug(slug)
  ).filter((post): post is NonNullable<typeof post> => post != null);

  return (
    <section className="home-blog-section border-b border-stone-200/60">
      <div className="ps-divider" />
      <Container>
        <div className="home-blog-section-inner pt-[3em] pb-[3em] md:pt-[3.5em] md:pb-[3.5em]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="ps-eyebrow">Blog</p>
              <h2 className="ps-display mt-5 text-stone-900">
                Uitgelichte artikelen
              </h2>
            </div>
            <Link
              href="/blog"
              className="home-inline-link shrink-0 text-[0.8125rem] text-stone-500 transition-colors duration-150 hover:text-stone-800"
            >
              Alle artikelen
            </Link>
          </div>

          <div className={`${BLOG_CARD_GRID_SECTION_TOP_CLASS} ${BLOG_CARD_GRID_CLASS}`}>
            {featuredPosts.map((post, index) => (
              <BlogCard
                key={post.slug}
                post={post}
                priority={index < 3}
                homePage
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <JourneySection />
      <BlogPreview />
    </div>
  );
}
