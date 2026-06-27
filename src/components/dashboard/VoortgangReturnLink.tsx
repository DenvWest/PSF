"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  hasVoortgangReturnParam,
  VOORTGANG_FAVORIETEN_HREF,
} from "@/lib/voortgang-return-link";

type VoortgangReturnLinkProps = {
  surface: "supplementen" | "beste" | "gids";
};

export default function VoortgangReturnLink({ surface }: VoortgangReturnLinkProps) {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  if (!hasVoortgangReturnParam(params)) {
    return null;
  }

  function handleClick() {
    trackEvent("voortgang_return_click", { surface });
    clarityTag("voortgang_return", surface);
  }

  return (
    <nav aria-label="Terug naar voortgang" className="mb-6">
      <Link
        href={VOORTGANG_FAVORIETEN_HREF}
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-700"
      >
        ← Terug naar voortgang
      </Link>
    </nav>
  );
}
