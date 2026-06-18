"use client";

import Link from "next/link";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

type RevealCtaStackProps = {
  previewOpen: boolean;
  onPreviewToggle: () => void;
};

export default function RevealCtaStack({ previewOpen, onPreviewToggle }: RevealCtaStackProps) {
  return (
    <section aria-label="Dashboard acties" className="mb-5 mt-6 lg:mb-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={onPreviewToggle}
          aria-expanded={previewOpen}
          aria-controls="dashboard-preview"
          className="flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[14px] border border-intake-sage/45 bg-intake-sage/10 px-6 text-[15px] font-semibold text-intake-ink transition-colors hover:border-intake-sage/65 hover:bg-intake-sage/15"
        >
          {previewOpen ? REVEAL_COPY.ctaPreviewOpen : REVEAL_COPY.ctaPreview}
        </button>
        <Link
          href="/account/login"
          className="flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-intake-sage px-6 text-[15.5px] font-semibold text-[#0f1c10] no-underline transition-colors hover:bg-[#67a079]"
        >
          {REVEAL_COPY.cta}
        </Link>
      </div>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-intake-ink-muted">
        {REVEAL_COPY.ctaSubtext}
      </p>
    </section>
  );
}
