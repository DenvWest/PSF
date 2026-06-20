import type { Metadata } from "next";
import { cookies } from "next/headers";
import DashboardUnlockSqueeze from "@/components/dashboard/unlock/DashboardUnlockSqueeze";
import {
  DASHBOARD_UNLOCK_FAQ,
  DASHBOARD_UNLOCK_HOWTO,
  DASHBOARD_UNLOCK_METADATA,
} from "@/data/dashboard-unlock";
import {
  DASHBOARD_UNLOCK_VARIANT_COOKIE,
  resolveDashboardUnlockVariant,
} from "@/lib/dashboard-unlock-variant";
import { canonicalMetadata } from "@/lib/seo/canonical";
import {
  buildFaqSchema,
  buildHowToSchema,
} from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: DASHBOARD_UNLOCK_METADATA.title,
  description: DASHBOARD_UNLOCK_METADATA.description,
  ...canonicalMetadata("/hoe-werkt-dashboard"),
};

type HoeWerktDashboardPageProps = {
  searchParams: Promise<{ variant?: string }>;
};

export default async function HoeWerktDashboardPage({
  searchParams,
}: HoeWerktDashboardPageProps) {
  const { variant: queryVariant } = await searchParams;
  const cookieStore = await cookies();
  const { variant, persistCookie } = resolveDashboardUnlockVariant({
    queryVariant: queryVariant ?? null,
    cookieVariant: cookieStore.get(DASHBOARD_UNLOCK_VARIANT_COOKIE)?.value ?? null,
  });

  const faqSchema = buildFaqSchema([...DASHBOARD_UNLOCK_FAQ]);
  const howToSchema = buildHowToSchema(DASHBOARD_UNLOCK_HOWTO);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <DashboardUnlockSqueeze variant={variant} persistCookie={persistCookie} />
    </>
  );
}
