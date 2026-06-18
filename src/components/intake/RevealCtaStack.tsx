"use client";

import Link from "next/link";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

type RevealCtaStackProps = {
  previewOpen: boolean;
  onPreviewOpen: () => void;
};

export default function RevealCtaStack({ previewOpen, onPreviewOpen }: RevealCtaStackProps) {
  return (
    <section aria-label="Bewaar je overzicht" className="mb-5 mt-5 lg:mb-6">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/account/login"
          className="flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-intake-sage px-6 text-[15.5px] font-semibold text-[#0f1c10] no-underline transition-colors hover:bg-[#67a079]"
        >
          {REVEAL_COPY.cta}
        </Link>
        <p className="mt-3 text-center text-sm leading-relaxed text-intake-ink-muted">
          {REVEAL_COPY.ctaSubtext}
        </p>
        <p className="mt-3 text-center">
          <button
            type="button"
            onClick={onPreviewOpen}
            aria-expanded={previewOpen}
            aria-controls="dashboard-preview"
            className="cursor-pointer text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
          >
            {previewOpen ? REVEAL_COPY.ctaPreviewLinkHide : REVEAL_COPY.ctaPreviewLink}
          </button>
        </p>
      </div>
    </section>
  );
}
