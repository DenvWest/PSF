"use client";

import { motion } from "framer-motion";
import LandingButton from "./ui/LandingButton";

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[min(92svh,900px)] items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(250,249,247,0.98)_0%,transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgba(236,234,230,0.45)_0%,transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[15%] top-[8%] h-[min(40rem,52vw)] w-[min(40rem,52vw)] rounded-full bg-gradient-to-br from-[var(--ps-accent-soft)] via-[#c5d4cf]/15 to-transparent blur-[100px]" />
        <div className="absolute -right-[10%] top-[25%] h-[min(32rem,44vw)] w-[min(32rem,44vw)] rounded-full bg-gradient-to-bl from-[#e6e9e7]/70 via-transparent to-transparent blur-[90px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[var(--ps-cream)]/90"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[92rem] px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-4xl flex-col"
        >
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.38em] text-[var(--ps-muted)] sm:text-xs">
            Supplementen · kennis eerst
          </p>
          <h1
            id="hero-heading"
            className="font-display mt-10 max-w-[min(100%,36rem)] text-[clamp(2.5rem,9vw,5.5rem)] font-light leading-[1.02] tracking-wide text-[var(--ps-ink)] sm:mt-12"
          >
            Omega-3 en magnesium, helder uitgelegd.
          </h1>
          <p className="mt-12 max-w-2xl text-xl font-light leading-[1.65] text-[var(--ps-body)] sm:mt-14 sm:text-[1.35rem] sm:leading-relaxed md:max-w-2xl md:text-[1.4rem]">
            Perfect Supplement is een premium merk voor twee veelgebruikte
            supplementen: duidelijke informatie, zorgvuldige keuzes—zonder
            ruis.
          </p>
          <div className="mt-14 flex flex-col gap-4 sm:mt-16 sm:flex-row sm:items-center sm:gap-8">
            <LandingButton
              href="#products"
              variant="primary"
              className="min-w-[12rem] px-10 py-4 text-[0.8125rem] tracking-[0.06em]"
            >
              Bekijk omega-3 en magnesium
            </LandingButton>
            <a
              href="#kennis"
              className="text-sm font-medium text-[var(--ps-body)] underline-offset-[6px] transition hover:text-[var(--ps-ink)] hover:underline"
            >
              Lees in het blog
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
