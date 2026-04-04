"use client";

import { motion } from "framer-motion";
import SectionShell from "./ui/SectionShell";

export default function LeadCaptureSection() {
  return (
    <section
      className="border-b border-[var(--ps-border)]/50 bg-[var(--ps-warm-gray)]/40 py-[var(--ps-section-y)]"
      aria-labelledby="newsletter-heading"
    >
      <SectionShell>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl rounded-[1.75rem] bg-white/90 px-8 py-12 text-center shadow-[0_28px_56px_-32px_rgba(20,20,20,0.12)] backdrop-blur-sm sm:px-14 sm:py-16"
        >
          <h2
            id="newsletter-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.2] tracking-wide text-[var(--ps-ink)]"
          >
            Ontvang de gids voor een sterker dagelijks fundament
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[var(--ps-body)] sm:text-lg">
            Inzichten over preventie, herstel en lange-termijnvitaliteit—rustige,
            doordachte updates. Geen schreeuwerige lijsten, geen kortingscircus.
          </p>
          <form
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <label htmlFor="email" className="sr-only">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="uw@e-mail.nl"
              className="min-h-[52px] flex-1 rounded-full border border-[var(--ps-border)]/80 bg-white px-6 text-[0.9375rem] text-[var(--ps-ink)] placeholder:text-[var(--ps-muted)] focus:border-[var(--ps-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ps-accent)]"
            />
            <button
              type="submit"
              className="min-h-[52px] rounded-full bg-[var(--ps-ink)] px-10 text-[0.8125rem] font-medium tracking-[0.06em] text-[var(--ps-cream)] transition hover:bg-[var(--ps-charcoal)]"
            >
              Inschrijven
            </button>
          </form>
          <p className="mt-6 text-xs leading-relaxed text-[var(--ps-muted)] sm:text-sm">
            U kunt zich op elk moment uitschrijven. Geen doorverkoop van
            adressen.
          </p>
        </motion.div>
      </SectionShell>
    </section>
  );
}
