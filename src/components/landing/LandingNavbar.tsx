"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingButton from "./ui/LandingButton";

const navLinks = [
  { href: "#why", label: "Waarom" },
  { href: "#products", label: "Supplementen" },
  { href: "#kennis", label: "Kennis" },
  { href: "#contact", label: "Contact" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ps-border)]/70 bg-[var(--ps-cream)]/85 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12"
        aria-label="Hoofdnavigatie"
      >
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight text-[var(--ps-ink)]"
        >
          Perfect Supplement
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--ps-body)] transition hover:text-[var(--ps-ink)]"
            >
              {link.label}
            </Link>
          ))}
          <LandingButton
            href="#products"
            variant="primary"
            className="py-2.5 text-xs tracking-[0.05em]"
          >
            Supplementen
          </LandingButton>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-[var(--ps-border)]/90 p-2 text-[var(--ps-ink)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu openen of sluiten</span>
          <span className="flex h-5 w-5 flex-col justify-center gap-1">
            <motion.span
              animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="block h-px w-full bg-current"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="block h-px w-full bg-current"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="block h-px w-full bg-current"
            />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[var(--ps-border)] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4 sm:px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--ps-body)] hover:bg-[var(--ps-warm-gray)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <LandingButton
                  href="#products"
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Supplementen
                </LandingButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
