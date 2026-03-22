import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";

type AffiliateLinkProps = {
  affiliateSlug: AffiliateSlug;
  className?: string;
  children: React.ReactNode;
};

export default function AffiliateLink({
  affiliateSlug,
  className,
  children,
}: AffiliateLinkProps) {
  return (
    <a
      href={affiliateLinks[affiliateSlug]}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
    >
      {children}
    </a>
  );
}