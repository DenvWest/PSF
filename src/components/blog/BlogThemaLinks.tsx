import Link from "next/link";
import { BLOG_EDITORIAL_LINK } from "@/components/blog/blog-layout";

const THEMA_LINKS = [
  { label: "Stress en herstel", href: "/thema/stress" },
  { label: "Slaapproblemen", href: "/thema/slaap" },
  { label: "Energieverlies", href: "/thema/energie" },
] as const;

interface BlogThemaLinksProps {
  heading?: string;
  subtext?: string;
  centered?: boolean;
}

export default function BlogThemaLinks({
  heading = "Liever beginnen bij je klacht?",
  subtext = "Onze themagidsen helpen je begrijpen wat er speelt en wijzen je naar concrete stappen.",
  centered = true,
}: BlogThemaLinksProps) {
  return (
    <div className={centered ? "mx-auto max-w-xl text-center" : "max-w-xl"}>
      <p className="font-display text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
        {heading}
      </p>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone-500">{subtext}</p>
      <ul
        className={`mt-8 divide-y divide-stone-200/70 border-y border-stone-200/70 ${
          centered ? "text-left" : ""
        }`}
      >
        {THEMA_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center justify-between py-4 transition hover:bg-stone-50/50"
            >
              <span className={`${BLOG_EDITORIAL_LINK} no-underline group-hover:underline`}>
                {link.label}
              </span>
              <span
                className="text-stone-400 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
