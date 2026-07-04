"use client";

import Link from "next/link";
import type { AnalyticsConsentMeta } from "@/lib/analytics-consent";

type CookieConsentAboutPanelProps = {
  consentMeta: AnalyticsConsentMeta | null;
};

function formatConsentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CookieConsentAboutPanel({
  consentMeta,
}: CookieConsentAboutPanelProps) {
  return (
    <div className="grid gap-4 text-sm leading-relaxed text-stone-600">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Over cookies</h2>
        <p className="mt-2">
          Cookies zijn kleine tekstbestanden die via je browser op je apparaat worden geplaatst.
          Ze helpen websites goed te laten werken en kunnen gebruik meten.
        </p>
      </div>

      <p>
        Strikt noodzakelijke cookies mogen wettelijk zonder voorafgaande toestemming worden
        geplaatst. Alle andere categorieën vereisen expliciete toestemming. Je kunt je keuze op
        elk moment wijzigen via &lsquo;Cookievoorkeuren&rsquo; onderaan elke pagina.
      </p>

      <p>
        Om reeds geplaatste cookies te verwijderen, gebruik je browserinstellingen. Meer
        informatie over gegevensverwerking staat in onze{" "}
        <Link
          href="/privacy"
          className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
        >
          privacyverklaring
        </Link>{" "}
        en{" "}
        <Link
          href="/cookies"
          className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
        >
          cookieverklaring
        </Link>
        .
      </p>

      {consentMeta ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-xs text-stone-600">
          <p className="font-semibold text-stone-800">Je consent-registratie</p>
          <p className="mt-2">
            <span className="font-medium text-stone-700">Consent-ID: </span>
            <span className="font-mono">{consentMeta.id}</span>
          </p>
          <p className="mt-1">
            <span className="font-medium text-stone-700">Datum: </span>
            {formatConsentDate(consentMeta.grantedAt)}
          </p>
          <p className="mt-2">
            Geef deze gegevens door als je vragen hebt over je cookiekeuze.
          </p>
        </div>
      ) : (
        <p className="text-xs text-stone-500">
          Na het opslaan van je keuze ontvang je een consent-ID voor auditdoeleinden.
        </p>
      )}

      <p className="text-xs text-stone-500">
        Cookieverklaring laatst bijgewerkt op 04-07-2026 door PerfectSupplement.
      </p>
    </div>
  );
}
