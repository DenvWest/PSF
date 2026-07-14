import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateForm } from "@/components/affiliate/AffiliateForm";
import { AfConversionsSection } from "@/components/affiliate/AfConversionsSection";
import { AfLedgerSection } from "@/components/affiliate/AfLedgerSection";
import { AfLinksSection } from "@/components/affiliate/AfLinksSection";
import { AfPayoutSection } from "@/components/affiliate/AfPayoutSection";
import { AfRulesSection } from "@/components/affiliate/AfRulesSection";
import { CollapsibleSection } from "@/components/partnerdesk/CollapsibleSection";
import {
  getAffiliateByRef,
  getAffiliateConversions,
  getAffiliateLedger,
  getAffiliatePayouts,
} from "@/lib/affiliate/queries";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Actief",
  paused: "Gepauzeerd",
  ended: "Beëindigd",
};

export default async function AffiliateDossierPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const dossier = await getAffiliateByRef(ref);
  if (!dossier) notFound();

  const { affiliate, rules, links } = dossier;
  const [conversions, ledger, payouts] = await Promise.all([
    getAffiliateConversions(affiliate.id),
    getAffiliateLedger(affiliate.id),
    getAffiliatePayouts(affiliate.id),
  ]);
  const accruedConversionIds = ledger.entries
    .filter((e) => e.kind === "accrual" && e.conversion_id)
    .map((e) => e.conversion_id as string);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-[var(--ps-border)] bg-[var(--ps-surface)]/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-8 py-4">
          <Link href="/admin/programma" className="text-sm text-[var(--ps-body)] hover:underline">
            ← Affiliates
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{affiliate.display_name}</h1>
            <span className="rounded-full bg-[var(--ps-bg)] px-2.5 py-0.5 text-xs text-[var(--ps-body)]">
              {STATUS_LABEL[affiliate.status] ?? affiliate.status}
            </span>
            <code className="rounded bg-[var(--ps-bg)] px-1.5 py-0.5 text-xs text-[var(--ps-body)]">
              ref: {affiliate.ref}
            </code>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-5 px-8 py-6">
        <CollapsibleSection id="algemeen" title="Algemene gegevens">
          <AffiliateForm affiliate={affiliate} />
        </CollapsibleSection>

        <CollapsibleSection id="commissie" title="Commissieafspraken">
          <AfRulesSection affiliateId={affiliate.id} affiliateRef={affiliate.ref} rules={rules} />
        </CollapsibleSection>

        <CollapsibleSection id="links" title="Affiliate-links">
          <AfLinksSection affiliateId={affiliate.id} affiliateRef={affiliate.ref} links={links} />
        </CollapsibleSection>

        <CollapsibleSection id="conversies" title="Conversies">
          <AfConversionsSection
            affiliateId={affiliate.id}
            affiliateRef={affiliate.ref}
            conversions={conversions}
            accruedConversionIds={accruedConversionIds}
          />
        </CollapsibleSection>

        <CollapsibleSection id="grootboek" title="Grootboek & commissie">
          <AfLedgerSection ledger={ledger} />
        </CollapsibleSection>

        <CollapsibleSection id="uitbetalingen" title="Uitbetalingen">
          <AfPayoutSection
            affiliateId={affiliate.id}
            affiliateRef={affiliate.ref}
            approvedCents={ledger.approvedCents}
            payouts={payouts}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
