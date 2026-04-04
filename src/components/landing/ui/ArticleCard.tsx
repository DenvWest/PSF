"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type ArticleCardProps = {
  title: string;
  excerpt: string;
  href: string;
  delay?: number;
};

export default function ArticleCard({
  title,
  excerpt,
  href,
  delay = 0,
}: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-[1.25rem] bg-white/95 px-7 py-9 shadow-[0_20px_44px_-30px_rgba(20,20,20,0.1)] transition hover:shadow-[0_28px_52px_-28px_rgba(20,20,20,0.12)] sm:px-8 sm:py-10"
    >
      <h3 className="font-display text-[1.2rem] font-light leading-snug tracking-wide text-[var(--ps-ink)] sm:text-[1.3rem]">
        <Link href={href} className="transition hover:text-[var(--ps-charcoal)]">
          {title}
        </Link>
      </h3>
      <p className="mt-5 flex-1 text-[0.9375rem] leading-[1.7] text-[var(--ps-body)]">
        {excerpt}
      </p>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--ps-ink)] underline-offset-[6px] transition hover:underline"
      >
        Verder lezen
        <span aria-hidden className="text-[var(--ps-muted)]">
          →
        </span>
      </Link>
    </motion.article>
  );
}
