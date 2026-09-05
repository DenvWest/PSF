import Container from "@/components/layout/Container";
import {
  BLOG_BG_CLASS,
  BLOG_HERO_H1,
  BLOG_HERO_INTRO,
  BLOG_HERO_PB,
  BLOG_HERO_PT,
  BLOG_HUB_LABEL,
} from "@/components/blog/blog-layout";

interface BlogHubHeroProps {
  compact?: boolean;
}

export default function BlogHubHero({ compact = false }: BlogHubHeroProps) {
  return (
    <section
      className={
        compact
          ? `${BLOG_BG_CLASS} pb-12 pt-8 md:pb-14 md:pt-10`
          : `${BLOG_BG_CLASS} ${BLOG_HERO_PB} ${BLOG_HERO_PT}`
      }
    >
      <Container>
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 md:mb-8">
            <div className="h-px w-8 bg-stone-300/90" aria-hidden />
            <p className="ps-eyebrow tracking-[0.14em]">{BLOG_HUB_LABEL}</p>
          </div>
          <h1 className={`${BLOG_HERO_H1} md:leading-[1.05]`}>
            Slaap, stress en herstel vanaf 30
          </h1>
          <p className={`${BLOG_HERO_INTRO} mt-8 md:mt-10`}>
            Artikelen over slaap, stress, energie en supplementen.
          </p>
        </div>
      </Container>
    </section>
  );
}
