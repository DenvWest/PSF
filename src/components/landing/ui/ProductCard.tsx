"use client";

import { motion } from "framer-motion";
import LandingButton from "./LandingButton";

export type ProductCardProps = {
  name: string;
  subtitle: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  delay?: number;
};

export default function ProductCard({
  name,
  subtitle,
  bullets,
  ctaLabel,
  ctaHref,
  delay = 0,
}: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[var(--ps-border)]/60 bg-white/90 px-9 py-11 sm:px-10 sm:py-12"
    >
      <div className="relative">
        <h3 className="font-display text-[clamp(1.75rem,3vw,2.125rem)] font-light tracking-tight text-[var(--ps-ink)]">
          {name}
        </h3>
        <p className="mt-5 max-w-prose font-sans text-[1.0625rem] leading-relaxed text-[var(--ps-body)]">
          {subtitle}
        </p>
        <ul className="mt-9 space-y-3.5 font-sans text-[0.9375rem] leading-[1.7] text-[var(--ps-body)] sm:text-base">
          {bullets.map((item) => (
            <li key={item} className="flex gap-4">
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[var(--ps-accent)]/85"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <LandingButton
            href={ctaHref}
            variant="secondary"
            className="w-full px-8 py-3.5 text-[0.8125rem] tracking-[0.04em] sm:w-auto"
          >
            {ctaLabel}
          </LandingButton>
        </div>
      </div>
    </motion.article>
  );
}
