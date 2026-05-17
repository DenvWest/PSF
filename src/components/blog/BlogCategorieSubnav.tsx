import type { BlogCategorie } from "@/types/blog";
import type { IntentArticleLink } from "@/data/blog/categorieen";
import Container from "@/components/layout/Container";
import BlogCategorieTabs from "@/components/blog/BlogCategorieTabs";
import BlogSymptomNav from "@/components/blog/BlogSymptomNav";
import { BLOG_BG_CLASS } from "@/components/blog/blog-layout";

interface BlogCategorieSubnavProps {
  activeId: BlogCategorie;
  aantalPerCategorie: Record<BlogCategorie, number>;
  intentArticleLinks: IntentArticleLink[];
  intentTopics: string[];
}

/** Unified category tabs + topic links — editorial, not app-like */
export default function BlogCategorieSubnav({
  activeId,
  aantalPerCategorie,
  intentArticleLinks,
  intentTopics,
}: BlogCategorieSubnavProps) {
  return (
    <section className={`${BLOG_BG_CLASS} pb-1`} aria-label="Navigatie binnen de herstelbibliotheek">
      <Container className="pt-5 md:pt-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60">
          <BlogCategorieTabs activeId={activeId} aantalPerCategorie={aantalPerCategorie} />
          <BlogSymptomNav links={intentArticleLinks} topics={intentTopics} />
        </div>
      </Container>
    </section>
  );
}
