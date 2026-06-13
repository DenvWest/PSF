import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IntakePlanPage from "@/components/intake/IntakePlanPage";
import {
  getPlanTemplate,
  isPlanTemplateDomain,
  PLAN_TEMPLATE_DOMAINS,
} from "@/data/lifestyle-plans";

interface Props {
  params: Promise<{ domain: string }>;
}

export function generateStaticParams() {
  return PLAN_TEMPLATE_DOMAINS.map((domain) => ({ domain }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  if (!isPlanTemplateDomain(domain)) {
    return {};
  }

  const template = getPlanTemplate(domain);
  if (!template) {
    return {};
  }

  return {
    title: `${template.title} | PerfectSupplement`,
    robots: { index: false, follow: false },
  };
}

export default async function IntakePlanDomainPage({ params }: Props) {
  const { domain } = await params;

  if (!isPlanTemplateDomain(domain) || !getPlanTemplate(domain)) {
    notFound();
  }

  return <IntakePlanPage domain={domain} />;
}
