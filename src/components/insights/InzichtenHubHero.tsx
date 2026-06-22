import Container from "@/components/layout/Container";
import InzichtenHubActions from "@/components/insights/InzichtenHubActions";
import PersonalPathBridge from "@/components/insights/PersonalPathBridge";
import { BLOG_HERO_PT } from "@/components/blog/blog-layout";
import type { PillarId } from "@/types/dashboard";

type InzichtenHubHeroProps = {
  priorityLabel?: string;
  priorityPillarId?: PillarId;
};

export default function InzichtenHubHero({
  priorityLabel,
  priorityPillarId,
}: InzichtenHubHeroProps) {
  return (
    <section className={`${BLOG_HERO_PT} pb-10 md:pb-12`}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#5A8F6A]"
                aria-hidden
              />
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
                Kennis &amp; leefstijl
              </p>
            </div>
            <h1 className="max-w-[15ch] font-display text-[clamp(2.25rem,5vw,3.375rem)] font-normal leading-[1.08] tracking-[-0.02em] text-stone-900">
              Begrijp je lichaam. Verbeter je dag.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-[1.65] text-stone-600">
              Eén plek voor onderbouwde kennis over slaap, stress, voeding,
              beweging en herstel — verbonden met wat je meet, gericht op wat je
              vandaag kunt toepassen.
            </p>
            <div className="mt-7">
              <InzichtenHubActions />
            </div>
          </div>
          <PersonalPathBridge
            priorityLabel={priorityLabel}
            priorityPillarId={priorityPillarId}
          />
        </div>
      </Container>
    </section>
  );
}
